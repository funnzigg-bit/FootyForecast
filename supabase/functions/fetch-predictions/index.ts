import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const BASE = 'https://sports.bzzoiro.com/api';
const CACHE_MAX_AGE_MS = 4 * 60 * 60 * 1000;
type JsonRecord = Record<string, unknown>;
type ConfidenceLevel = 'elite' | 'high' | 'medium' | 'low' | 'very_risky';
type MatchStatus = 'live' | 'scheduled' | 'finished' | 'halftime';

type EnhancedPrediction = {
  id: string;
  fixtureId?: number | string;
  league: string;
  leagueCountry: string;
  leagueLogo?: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo?: string;
  awayLogo?: string;
  matchDate?: string;
  homeScore: number;
  awayScore: number;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  predictedResult: 'Home Win' | 'Draw' | 'Away Win';
  predictedScore: string;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  over25Prob: number;
  over35Prob: number;
  bttsProb: number;
  bttsResult: 'Yes' | 'No';
  isUpset: boolean;
  upsetScore: number;
  upsetConfidence?: number;
  riskLevel?: 'High' | 'Medium' | 'Low';
  isValue: boolean;
  valueEdge?: number;
  topScores: { score: string; probability: number }[];
  pickScore: number;
  totalGoalsExpected: number;
  recommendedMarket: string;
  reasoning: string;
  homeTeamScore: number;
  awayTeamScore: number;
  minute: number;
  status: MatchStatus;
};

function asRecord(value: unknown): JsonRecord {
  return typeof value === 'object' && value !== null ? value as JsonRecord : {};
}

const TARGET_LEAGUES = new Set([
  'premier league', 'la liga', 'bundesliga', 'serie a',
  'champions league', 'europa league', 'conference league',
  'uefa champions league', 'uefa europa league', 'uefa europa conference league',
]);

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function normalizePercent(value: unknown, fallback: number): number {
  const numeric = asNumber(value);
  if (numeric == null) return fallback;
  const scaled = numeric <= 1 ? numeric * 100 : numeric;
  return Math.round(Math.max(0, Math.min(100, scaled)));
}

function normalizeProbabilitySet(home: unknown, draw: unknown, away: unknown) {
  const raw = [asNumber(home), asNumber(draw), asNumber(away)];
  const usable = raw.every((value) => value != null) ? raw as number[] : null;

  if (!usable) {
    return { homeWinProb: 33, drawProb: 34, awayWinProb: 33 };
  }

  const scaled = usable.map((value) => (value <= 1 ? value * 100 : value));
  const total = scaled.reduce((sum, value) => sum + value, 0);

  if (total <= 0) {
    return { homeWinProb: 33, drawProb: 34, awayWinProb: 33 };
  }

  const normalized = scaled.map((value) => (value / total) * 100);
  const rounded = normalized.map((value) => Math.round(value));
  const drift = 100 - rounded.reduce((sum, value) => sum + value, 0);
  rounded[1] += drift;

  return {
    homeWinProb: Math.max(0, rounded[0]),
    drawProb: Math.max(0, rounded[1]),
    awayWinProb: Math.max(0, rounded[2]),
  };
}

function normalizeThreeWayFromOdds(homeOdds: unknown, drawOdds: unknown, awayOdds: unknown) {
  const home = asNumber(homeOdds);
  const draw = asNumber(drawOdds);
  const away = asNumber(awayOdds);

  if (!home || !draw || !away || home <= 1 || draw <= 1 || away <= 1) {
    return null;
  }

  const implied = [1 / home, 1 / draw, 1 / away];
  const total = implied.reduce((sum, value) => sum + value, 0);

  return implied.map((value) => (value / total) * 100) as [number, number, number];
}

function finalizeProbabilitySet(homeWinProb: number, drawProb: number, awayWinProb: number) {
  const rounded = [
    Math.max(1, Math.round(homeWinProb)),
    Math.max(1, Math.round(drawProb)),
    Math.max(1, Math.round(awayWinProb)),
  ];
  const total = rounded[0] + rounded[1] + rounded[2];
  const drift = 100 - total;
  const strongestIndex = rounded.indexOf(Math.max(...rounded));
  rounded[strongestIndex] += drift;

  return {
    homeWinProb: rounded[0],
    drawProb: rounded[1],
    awayWinProb: rounded[2],
  };
}

function rebalanceDraw(
  homeWinProb: number,
  drawProb: number,
  awayWinProb: number,
) {
  const strongestSide = Math.max(homeWinProb, awayWinProb);
  const sideGap = Math.abs(homeWinProb - awayWinProb);
  const drawCap =
    strongestSide >= 68 ? 17 :
    strongestSide >= 60 ? 20 :
    sideGap >= 20 ? 24 :
    sideGap >= 12 ? 27 : 31;
  const boostedDrawFloor =
    strongestSide >= 68 ? 10 :
    strongestSide >= 60 ? 14 :
    sideGap <= 6 ? 24 : 18;
  const adjustedDraw = Math.min(
    drawCap,
    Math.max(
      boostedDrawFloor,
      drawProb -
      sideGap * 0.28 -
      Math.max(0, strongestSide - 45) * 0.28
    )
  );
  const remaining = 100 - adjustedDraw;
  const decisivePool = Math.max(homeWinProb + awayWinProb, 1);

  return finalizeProbabilitySet(
    (homeWinProb / decisivePool) * remaining,
    adjustedDraw,
    (awayWinProb / decisivePool) * remaining,
  );
}

function amplifyFavorite(
  homeWinProb: number,
  drawProb: number,
  awayWinProb: number,
) {
  const strongestSide = Math.max(homeWinProb, awayWinProb);
  const sideGap = Math.abs(homeWinProb - awayWinProb);

  if (strongestSide < 58 || sideGap < 16) {
    return finalizeProbabilitySet(homeWinProb, drawProb, awayWinProb);
  }

  const favoriteIsHome = homeWinProb >= awayWinProb;
  const favoriteBoost =
    strongestSide >= 72 ? 7 :
    strongestSide >= 65 ? 5 :
    3;
  const drawReduction =
    strongestSide >= 72 ? 4 :
    strongestSide >= 65 ? 3 :
    2;
  const underdogReduction = Math.max(1, favoriteBoost - 1);

  const nextHome = favoriteIsHome ? homeWinProb + favoriteBoost : Math.max(4, homeWinProb - underdogReduction);
  const nextAway = favoriteIsHome ? Math.max(4, awayWinProb - underdogReduction) : awayWinProb + favoriteBoost;
  const nextDraw = Math.max(6, drawProb - drawReduction);

  return finalizeProbabilitySet(nextHome, nextDraw, nextAway);
}

function softenCoinflipDraw(
  homeWinProb: number,
  drawProb: number,
  awayWinProb: number,
) {
  const sideGap = Math.abs(homeWinProb - awayWinProb);
  const strongestSide = Math.max(homeWinProb, awayWinProb);

  if (sideGap > 8 || strongestSide > 46 || drawProb <= 30) {
    return finalizeProbabilitySet(homeWinProb, drawProb, awayWinProb);
  }

  const drawTrim = Math.min(4, Math.max(2, drawProb - 28));
  return finalizeProbabilitySet(
    homeWinProb + drawTrim / 2,
    drawProb - drawTrim,
    awayWinProb + drawTrim / 2,
  );
}

function marketBlendWeight(market: [number, number, number] | null) {
  if (!market) return 0;
  const strongest = Math.max(...market);
  const sideGap = Math.abs(market[0] - market[2]);

  if (strongest >= 68 || sideGap >= 35) return 0.64;
  if (strongest >= 58 || sideGap >= 22) return 0.52;
  return 0.4;
}

function inferPredictedResult(
  predictedResult: string,
  homeWinProb: number,
  drawProb: number,
  awayWinProb: number,
) {
  const strongest = Math.max(homeWinProb, drawProb, awayWinProb);
  const tolerance = 2;

  if (strongest === drawProb && drawProb >= homeWinProb + tolerance && drawProb >= awayWinProb + tolerance) {
    return 'Draw';
  }
  if (strongest === awayWinProb && awayWinProb >= homeWinProb + tolerance) {
    return 'Away Win';
  }
  if (strongest === homeWinProb && homeWinProb >= awayWinProb + tolerance) {
    return 'Home Win';
  }

  return predictedResult;
}

function getConfidenceBand(confidence: number): ConfidenceLevel {
  if (confidence >= 84) return 'elite';
  if (confidence >= 70) return 'high';
  if (confidence >= 55) return 'medium';
  if (confidence >= 40) return 'low';
  return 'very_risky';
}

function getFavoriteGuardrail(
  strongest: number,
  probabilityGap: number,
  drawProb: number,
) {
  if (strongest >= 74 && probabilityGap >= 34 && drawProb <= 16) return 82;
  if (strongest >= 66 && probabilityGap >= 24 && drawProb <= 20) return 70;
  if (strongest >= 60 && probabilityGap >= 16 && drawProb <= 24) return 58;
  if (strongest >= 55 && probabilityGap >= 12 && drawProb <= 28) return 46;
  return 28;
}

function calibrateConfidenceScore(
  strongest: number,
  probabilityGap: number,
  spread: number,
  drawProb: number,
  bsdConfidence: number,
) {
  const drawSuppression = Math.max(0, 28 - drawProb);
  const score = Math.round(
    4 +
    strongest * 0.38 +
    probabilityGap * 0.45 +
    spread * 0.08 +
    drawSuppression * 0.2 +
    bsdConfidence * 0.05
  );

  return Math.min(92, Math.max(28, score));
}

function getConfidenceContext(
  homeWin: number,
  draw: number,
  awayWin: number,
) {
  const strongest = Math.max(homeWin, draw, awayWin);
  const sorted = [homeWin, draw, awayWin].sort((a, b) => b - a);
  const probabilityGap = sorted[0] - sorted[1];
  const spread = sorted[0] - sorted[2];

  return { strongest, probabilityGap, spread };
}

function calibrateProbabilitySet(
  homeWinProb: number,
  drawProb: number,
  awayWinProb: number,
  homeOdds: unknown,
  drawOdds: unknown,
  awayOdds: unknown,
) {
  const market = normalizeThreeWayFromOdds(homeOdds, drawOdds, awayOdds);
  const marketWeight = marketBlendWeight(market);
  const baseWeight = 1 - marketWeight;
  const blended = market
    ? {
        homeWinProb: homeWinProb * baseWeight + market[0] * marketWeight,
        drawProb: drawProb * baseWeight + market[1] * marketWeight,
        awayWinProb: awayWinProb * baseWeight + market[2] * marketWeight,
      }
    : { homeWinProb, drawProb, awayWinProb };

  const rebalanced = rebalanceDraw(blended.homeWinProb, blended.drawProb, blended.awayWinProb);
  const favored = amplifyFavorite(rebalanced.homeWinProb, rebalanced.drawProb, rebalanced.awayWinProb);
  const tightened = softenCoinflipDraw(favored.homeWinProb, favored.drawProb, favored.awayWinProb);
  const sharpened = sharpenProbabilities(tightened.homeWinProb, tightened.drawProb, tightened.awayWinProb);
  return finalizeProbabilitySet(sharpened.homeWinProb, sharpened.drawProb, sharpened.awayWinProb);
}

// --- Enhanced confidence scoring (5-tier) ---
function calculateEnhancedConfidence(
  homeWin: number, draw: number, awayWin: number,
  bsdConfidence: number,
) {
  const { strongest, probabilityGap, spread } = getConfidenceContext(homeWin, draw, awayWin);
  const score = calibrateConfidenceScore(strongest, probabilityGap, spread, draw, bsdConfidence);
  const guardrail = getFavoriteGuardrail(strongest, probabilityGap, draw);
  const clamped = Math.max(guardrail, score);
  const confidence = Math.min(92, Math.max(28, clamped));

  return { confidence, confidenceLevel: getConfidenceBand(confidence) };
}

function sharpenProbabilities(
  homeWinProb: number,
  drawProb: number,
  awayWinProb: number,
) {
  const values = [homeWinProb, drawProb, awayWinProb].map((value) => Math.max(value / 100, 0.01));
  const exponent = 1.16;
  const powered = values.map((value) => Math.pow(value, exponent));
  const total = powered.reduce((sum, value) => sum + value, 0);
  const rounded = powered.map((value) => Math.round((value / total) * 100));
  const drift = 100 - rounded.reduce((sum, value) => sum + value, 0);
  rounded[0] += drift;

  return finalizeProbabilitySet(rounded[0], rounded[1], rounded[2]);
}

function pickFirstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return undefined;
}

function normalizeDate(value: unknown): string | undefined {
  const raw = pickFirstString(value);
  if (!raw) return undefined;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? raw : parsed.toISOString();
}

function deriveExpectedGoals(
  homeWinProb: number,
  drawProb: number,
  awayWinProb: number,
  over25Prob: number,
  over35Prob: number,
  bttsProb: number,
) {
  const totalGoals =
    2.45 +
    ((over25Prob - 50) / 100) * 1.75 +
    ((over35Prob - 25) / 100) * 1.25 +
    ((bttsProb - 50) / 100) * 0.65 -
    ((drawProb - 28) / 100) * 0.22 +
    (Math.max(homeWinProb, awayWinProb) - 40) / 100 * 0.18;

  const homeShareBase = 0.5 + (homeWinProb - awayWinProb) / 200;
  const homeShare = Math.min(0.8, Math.max(0.2, homeShareBase));
  const boundedTotal = Math.min(5.1, Math.max(1.7, totalGoals));

  return {
    homeLambda: Math.min(3.6, Math.max(0.25, boundedTotal * homeShare)),
    awayLambda: Math.min(3.6, Math.max(0.2, boundedTotal * (1 - homeShare))),
  };
}

function calibrateGoalsMarkets(
  over25Prob: number,
  over35Prob: number,
  bttsProb: number,
  homeWinProb: number,
  drawProb: number,
  awayWinProb: number,
) {
  const strongestSide = Math.max(homeWinProb, awayWinProb);
  const sideGap = Math.abs(homeWinProb - awayWinProb);

  const calibratedOver25 = Math.round(Math.max(
    28,
    Math.min(
      82,
      over25Prob + (strongestSide - 45) * 0.25 - Math.max(0, drawProb - 28) * 0.35 + Math.max(0, sideGap - 10) * 0.12
    )
  ));

  const calibratedBTTS = Math.round(Math.max(
    24,
    Math.min(
      78,
      bttsProb + Math.min(6, Math.max(-6, calibratedOver25 - 52)) - Math.max(0, sideGap - 18) * 0.18
    )
  ));

  const calibratedOver35 = Math.round(Math.max(
    10,
    Math.min(
      65,
      over35Prob + (calibratedOver25 - 50) * 0.45 + (calibratedBTTS - 50) * 0.12
    )
  ));

  return {
    over25Prob: calibratedOver25,
    over35Prob: calibratedOver35,
    bttsProb: calibratedBTTS,
  };
}

function selectPredictedScore(
  topScores: { score: string; probability: number }[],
  predictedResult: string,
  fallback: string,
  totalExpectedGoals: number,
) {
  const matchingScores = topScores.filter(({ score }) => {
    const [home, away] = score.split('-').map(Number);
    if (!Number.isFinite(home) || !Number.isFinite(away)) return false;
    if (predictedResult === 'Home Win') return home > away;
    if (predictedResult === 'Away Win') return away > home;
    return home === away;
  });

  const ranked = [...matchingScores].sort((a, b) => {
    const [homeA, awayA] = a.score.split('-').map(Number);
    const [homeB, awayB] = b.score.split('-').map(Number);
    const totalGapA = Math.abs(homeA + awayA - totalExpectedGoals);
    const totalGapB = Math.abs(homeB + awayB - totalExpectedGoals);

    if (Math.abs(totalGapA - totalGapB) > 0.3) {
      return totalGapA - totalGapB;
    }

    return b.probability - a.probability;
  });

  return ranked[0]?.score || topScores[0]?.score || fallback;
}

// --- Poisson distribution helper ---
function poissonPmf(k: number, lambda: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let logP = -lambda + k * Math.log(lambda);
  for (let i = 2; i <= k; i++) logP -= Math.log(i);
  return Math.exp(logP);
}

function topCorrectScores(homeLambda: number, awayLambda: number, count = 3) {
  const scores: { score: string; prob: number }[] = [];
  for (let h = 0; h <= 6; h++) {
    for (let a = 0; a <= 6; a++) {
      scores.push({ score: `${h}-${a}`, prob: poissonPmf(h, homeLambda) * poissonPmf(a, awayLambda) });
    }
  }
  scores.sort((a, b) => b.prob - a.prob);
  return scores.slice(0, count).map(s => ({ score: s.score, probability: Math.round(s.prob * 100) }));
}

// --- Value detection ---
function detectValue(modelProb: number, impliedProb: number | null) {
  if (!impliedProb || impliedProb <= 0) return { isValue: false, edge: 0 };
  const edge = modelProb - impliedProb;
  return { isValue: edge > 5, edge: Math.round(edge * 10) / 10 };
}

// --- Upset scoring ---
function calculateUpsetScore(
  predictedResult: string,
  homeWin: number, awayWin: number,
  confidence: number,
) {
  const favourite = homeWin > awayWin ? 'Home Win' : 'Away Win';
  const underdog = favourite === 'Home Win' ? 'Away Win' : 'Home Win';
  const underdogProb = favourite === 'Home Win' ? awayWin : homeWin;

  if (predictedResult !== underdog) return { isUpset: false, upsetScore: 0 };
  if (underdogProb < 24) return { isUpset: false, upsetScore: 0 };

  const modelEdge = underdogProb / 100;
  const favouriteInstability = 1 - (Math.max(homeWin, awayWin) / 100);
  const probGap = Math.abs(homeWin - awayWin) / 100;

  const upsetScore = Math.round(
    (0.40 * modelEdge +
     0.25 * favouriteInstability +
     0.20 * (1 - probGap) +
     0.15 * (confidence < 50 ? 0.8 : 0.4)) * 100
  );

  return { isUpset: upsetScore >= 42, upsetScore: Math.min(100, upsetScore) };
}

// --- Pick of the Day scoring ---
function calculatePickScore(
  confidence: number,
  homeWin: number,
  draw: number,
  awayWin: number,
  xgAdv: number,
  over25Prob: number,
  bttsProb: number,
  isValue: boolean,
  isUpset: boolean,
) {
  const probs = [homeWin, draw, awayWin].sort((a, b) => b - a);
  const probGap = (probs[0] - probs[1]) / 100;
  const marketConviction = Math.max(probs[0], over25Prob * 0.95, bttsProb * 0.92) / 100;
  const valueBoost = isValue ? 0.08 : 0;
  const upsetPenalty = isUpset ? 0.05 : 0;
  return Math.round(
    (0.50 * (confidence / 100) +
     0.18 * probGap +
     0.10 * Math.min(1, confidence / 80) +
     0.10 * Math.min(1, xgAdv) +
     0.12 * marketConviction +
     valueBoost -
     upsetPenalty) * 100
  );
}

function getRecommendedMarket(
  predictedResult: string,
  homeWinProb: number,
  drawProb: number,
  awayWinProb: number,
  over25Prob: number,
  bttsProb: number,
  confidence: number,
  isValue: boolean,
  isUpset: boolean,
) {
  const marketOptions = [
    { label: predictedResult, score: Math.max(homeWinProb, drawProb, awayWinProb) + confidence * 0.35 },
    { label: 'Over 2.5', score: over25Prob + confidence * 0.22 },
    { label: 'BTTS Yes', score: bttsProb + confidence * 0.18 },
  ];

  if (isValue) marketOptions.push({ label: 'Value edge', score: confidence + 14 });
  if (isUpset) marketOptions.push({ label: 'Upset watch', score: confidence - 8 });

  return marketOptions.sort((a, b) => b.score - a.score)[0]?.label || predictedResult;
}

function getFixtureIdentity(prediction: Partial<EnhancedPrediction>) {
  if (prediction.fixtureId != null) return String(prediction.fixtureId);
  return [
    prediction.matchDate?.slice(0, 10) || 'unknown-date',
    prediction.homeTeam?.toLowerCase() || 'home',
    prediction.awayTeam?.toLowerCase() || 'away',
  ].join('::');
}

function dedupePredictions(predictions: EnhancedPrediction[]) {
  const bestByFixture = new Map<string, EnhancedPrediction>();

  for (const prediction of predictions) {
    const key = getFixtureIdentity(prediction);
    const existing = bestByFixture.get(key);

    if (!existing || (prediction.pickScore ?? 0) > (existing.pickScore ?? 0)) {
      bestByFixture.set(key, prediction);
    }
  }

  return Array.from(bestByFixture.values());
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  let forceRefresh = false;
  try {
    const body = asRecord(await req.json().catch(() => ({})));
    forceRefresh = body.force === true || body.time != null;
  } catch { /* ignore */ }

  try {
    if (!forceRefresh) {
      const { data: cached } = await supabase
        .from('cached_predictions')
        .select('predictions_data, fetched_at')
        .order('fetched_at', { ascending: false })
        .limit(1)
        .single();

      if (cached && (Date.now() - new Date(cached.fetched_at).getTime()) < CACHE_MAX_AGE_MS) {
        const predictions = Array.isArray(cached.predictions_data)
          ? cached.predictions_data as EnhancedPrediction[]
          : [];
        return new Response(JSON.stringify({ predictions, count: predictions.length, cached: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const API_KEY = Deno.env.get('BSD_API_KEY');
    if (!API_KEY) {
      return new Response(JSON.stringify({ error: 'BSD_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiHeaders = { 'Authorization': `Token ${API_KEY}` };

    let allResults: JsonRecord[] = [];
    let url: string | null = `${BASE}/predictions/`;

    while (url && allResults.length < 100) {
      const res = await fetch(url, { headers: apiHeaders });
      if (!res.ok) throw new Error(`BSD API error: ${res.status}`);
      const data = asRecord(await res.json());
      const results = Array.isArray(data.results)
        ? data.results.map((entry) => asRecord(entry))
        : [];
      allResults = allResults.concat(results);
      url = typeof data.next === 'string' && data.next ? data.next : null;
    }

    const filtered = allResults.filter((pred) => {
      const event = asRecord(pred.event);
      const league = asRecord(event.league);
      const leagueName = pickFirstString(league.name)?.toLowerCase() || '';
      return TARGET_LEAGUES.has(leagueName);
    });

    const predictions = dedupePredictions(
      filtered
        .map((pred) => mapEnhancedPrediction(pred, API_KEY))
        .filter((prediction) => prediction.homeTeam !== prediction.awayTeam)
        .sort((a, b) => (b.pickScore ?? 0) - (a.pickScore ?? 0))
    );

    // Save to cache
    await supabase.from('cached_predictions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('cached_predictions').insert({
      predictions_data: predictions,
      fetched_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ predictions, count: predictions.length, cached: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function mapEnhancedPrediction(pred: JsonRecord, apiKey: string): EnhancedPrediction {
  const event = asRecord(pred.event);
  const league = asRecord(event.league);
  const homeTeamObj = asRecord(event.home_team_obj);
  const awayTeamObj = asRecord(event.away_team_obj);
  const IMG_BASE = 'https://sports.bzzoiro.com/img';

  const homeTeamApiId = pickFirstString(homeTeamObj.api_id);
  const awayTeamApiId = pickFirstString(awayTeamObj.api_id);
  const leagueApiId = pickFirstString(league.api_id);
  const homeLogo = homeTeamApiId ? `${IMG_BASE}/team/${homeTeamApiId}/?token=${apiKey}` : undefined;
  const awayLogo = awayTeamApiId ? `${IMG_BASE}/team/${awayTeamApiId}/?token=${apiKey}` : undefined;
  const leagueLogo = leagueApiId ? `${IMG_BASE}/league/${leagueApiId}/?token=${apiKey}` : undefined;

  const normalizedProbabilities = normalizeProbabilitySet(
    pred.prob_home_win,
    pred.prob_draw,
    pred.prob_away_win,
  );
  const { homeWinProb, drawProb, awayWinProb } = calibrateProbabilitySet(
    normalizedProbabilities.homeWinProb,
    normalizedProbabilities.drawProb,
    normalizedProbabilities.awayWinProb,
    pred.odds_home,
    pred.odds_draw,
    pred.odds_away,
  );

  let predictedResult: string = 'Draw';
  if (pred.predicted_result === 'H') predictedResult = 'Home Win';
  else if (pred.predicted_result === 'A') predictedResult = 'Away Win';
  predictedResult = inferPredictedResult(predictedResult, homeWinProb, drawProb, awayWinProb);

  // BSD confidence
  const rawConf = asNumber(pred.confidence) ?? 0.5;
  const bsdConfidence = rawConf <= 1 ? Math.round(rawConf * 100) : Math.round(rawConf);

  // Enhanced confidence (5-tier)
  const { confidence, confidenceLevel } = calculateEnhancedConfidence(homeWinProb, drawProb, awayWinProb, bsdConfidence);

  // Poisson correct score
  const calibratedMarkets = calibrateGoalsMarkets(
    normalizePercent(pred.prob_over_25, 50),
    normalizePercent(pred.prob_over_35, 25),
    normalizePercent(pred.prob_btts_yes, 50),
    homeWinProb,
    drawProb,
    awayWinProb,
  );
  const over25Prob = calibratedMarkets.over25Prob;
  const over35Prob = calibratedMarkets.over35Prob;
  const bttsProb = calibratedMarkets.bttsProb;

  const derivedGoals = deriveExpectedGoals(
    homeWinProb,
    drawProb,
    awayWinProb,
    over25Prob,
    over35Prob,
    bttsProb,
  );

  const homeLambda = asNumber(
    pred.expected_home_goals ??
    pred.home_expected_goals ??
    pred.home_goals_expected ??
    pred.estimated_home_goals
  ) ?? derivedGoals.homeLambda;

  const awayLambda = asNumber(
    pred.expected_away_goals ??
    pred.away_expected_goals ??
    pred.away_goals_expected ??
    pred.estimated_away_goals
  ) ?? derivedGoals.awayLambda;

  const totalExpectedGoals = Math.round((homeLambda + awayLambda) * 100) / 100;
  const topScores = topCorrectScores(homeLambda, awayLambda, 5);
  const predictedScore = selectPredictedScore(
    topScores,
    predictedResult,
    pickFirstString(pred.most_likely_score, pred.correct_score, pred.score_prediction) || '1-1',
    totalExpectedGoals,
  );

  // Value detection (use implied odds if available)
  const oddsHome = asNumber(pred.odds_home);
  const oddsAway = asNumber(pred.odds_away);
  const oddsDraw = asNumber(pred.odds_draw);
  const impliedHomeOdds = oddsHome ? (1 / oddsHome) * 100 : null;
  const bestProb = Math.max(homeWinProb, drawProb, awayWinProb);
  const bestImplied = predictedResult === 'Home Win' ? impliedHomeOdds :
                      predictedResult === 'Away Win' ? (oddsAway ? (1 / oddsAway) * 100 : null) :
                      (oddsDraw ? (1 / oddsDraw) * 100 : null);
  const { isValue, edge } = detectValue(bestProb, bestImplied);

  // Upset scoring
  const { isUpset, upsetScore } = calculateUpsetScore(predictedResult, homeWinProb, awayWinProb, confidence);

  // Pick score
  const xgAdv = Math.abs(homeLambda - awayLambda) / 2;
  const pickScore = calculatePickScore(
    confidence,
    homeWinProb,
    drawProb,
    awayWinProb,
    xgAdv,
    over25Prob,
    bttsProb,
    isValue,
    isUpset,
  );
  const recommendedMarket = getRecommendedMarket(
    predictedResult,
    homeWinProb,
    drawProb,
    awayWinProb,
    over25Prob,
    bttsProb,
    confidence,
    isValue,
    isUpset,
  );

  // Reasoning
  const tips: string[] = [];
  if (pred.favorite_recommend) tips.push(`Favored: ${predictedResult}`);
  if (pred.over_25_recommend) tips.push('Over 2.5 recommended');
  if (pred.btts_recommend) tips.push('BTTS recommended');
  if (isValue) tips.push(`Value pick (${edge}% edge)`);
  if (isUpset) tips.push(`Upset potential (${upsetScore}%)`);
  const reasoning = tips.length > 0
    ? tips.join('. ') + '.'
    : `ML prediction: ${predictedResult} (${confidence}% confidence)`;

  const statusMap: Record<string, string> = {
    'notstarted': 'scheduled', 'inprogress': 'live', '1st_half': 'live',
    '2nd_half': 'live', 'halftime': 'halftime', 'finished': 'finished',
  };
  const status = statusMap[event.status || 'notstarted'] || 'scheduled';

  return {
    id: String(event.id || pred.id),
    fixtureId: event.api_id || event.id,
    league: pickFirstString(league.name, pred.league_name, event.competition_name) || 'Unknown',
    leagueCountry: pickFirstString(league.country, pred.league_country, event.country_name) || '',
    leagueLogo,
    homeTeam: pickFirstString(event.home_team, homeTeamObj?.name, pred.home_team_name, pred.home_team) || 'Home',
    awayTeam: pickFirstString(event.away_team, awayTeamObj?.name, pred.away_team_name, pred.away_team) || 'Away',
    homeLogo, awayLogo,
    matchDate: normalizeDate(event.event_date ?? pred.event_date ?? pred.commence_time),
    homeScore: asNumber(event.home_score ?? pred.home_score) ?? 0,
    awayScore: asNumber(event.away_score ?? pred.away_score) ?? 0,
    homeWinProb, drawProb, awayWinProb,
    predictedResult, predictedScore,
    confidence, confidenceLevel,
    over25Prob, over35Prob, bttsProb,
    bttsResult: bttsProb >= 50 ? 'Yes' : 'No',
    isUpset, upsetScore,
    upsetConfidence: isUpset ? upsetScore : undefined,
    riskLevel: isUpset ? (upsetScore > 60 ? 'High' : upsetScore > 40 ? 'Medium' : 'Low') as 'High' | 'Medium' | 'Low' : undefined,
    isValue, valueEdge: isValue ? edge : undefined,
    topScores,
    pickScore,
    totalGoalsExpected,
    recommendedMarket,
    reasoning,
    homeTeamScore: (homeWinProb / 100) * 0.7 + homeLambda / 4 * 0.3,
    awayTeamScore: (awayWinProb / 100) * 0.7 + awayLambda / 4 * 0.3,
    minute: asNumber(event.current_minute ?? pred.current_minute) ?? 0,
    status,
  };
}
