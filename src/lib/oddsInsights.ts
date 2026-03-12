import { OddsEvent } from "@/services/liveDataService";
import { MatchOddsInsight, MatchPrediction, OddsSelectionInsight } from "@/services/footballPredictionEngine";

type TeamPair = {
  homeTeam: string;
  awayTeam: string;
  matchDate?: string;
};

type OutcomeSelection = {
  name: string;
  price: number;
  bookmaker: string;
};

function normalizeName(value: string) {
  return value
    .toLowerCase()
    .replace(/fc|cf|afc|sc|ac|club|deportivo|athletic|city|united/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function tokenizeName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function teamNameScore(left: string, right: string) {
  const leftNorm = normalizeName(left);
  const rightNorm = normalizeName(right);
  if (leftNorm === rightNorm) return 1;
  if (leftNorm.includes(rightNorm) || rightNorm.includes(leftNorm)) return 0.9;

  const leftTokens = tokenizeName(left);
  const rightTokens = new Set(tokenizeName(right));
  const overlap = leftTokens.filter((token) => rightTokens.has(token)).length;
  return overlap / Math.max(leftTokens.length, 1);
}

function dateDistanceHours(matchDate?: string, commenceTime?: string) {
  if (!matchDate || !commenceTime) return 0;
  const left = new Date(matchDate).getTime();
  const right = new Date(commenceTime).getTime();
  if (Number.isNaN(left) || Number.isNaN(right)) return 0;
  return Math.abs(left - right) / (1000 * 60 * 60);
}

function getOutcomeName(outcome: { name: string }, homeTeam: string, awayTeam: string) {
  if (outcome.name === homeTeam) return "home";
  if (outcome.name === awayTeam) return "away";
  if (outcome.name.toLowerCase() === "draw") return "draw";
  return null;
}

function toSelectionInsight(prices: OutcomeSelection[], normalizedProbability?: number): OddsSelectionInsight {
  if (prices.length === 0) {
    return {
      averageOdds: null,
      bestOdds: null,
      marketProbability: normalizedProbability ?? null,
      valueEdge: null,
    };
  }

  const averageOdds = prices.reduce((sum, selection) => sum + selection.price, 0) / prices.length;
  const best = prices.reduce((currentBest, selection) => (
    selection.price > currentBest.price ? selection : currentBest
  ));

  return {
    averageOdds: Number(averageOdds.toFixed(2)),
    bestOdds: best.price,
    bestBookmaker: best.bookmaker,
    marketProbability: normalizedProbability == null ? null : Number(normalizedProbability.toFixed(1)),
    valueEdge: null,
  };
}

function getH2HSelections(event: OddsEvent) {
  const home: OutcomeSelection[] = [];
  const draw: OutcomeSelection[] = [];
  const away: OutcomeSelection[] = [];

  for (const bookmaker of event.bookmakers ?? []) {
    const market = bookmaker.markets.find((entry) => entry.key === "h2h");
    if (!market) continue;

    for (const outcome of market.outcomes) {
      const key = getOutcomeName({ name: String(outcome.name) }, event.homeTeam, event.awayTeam);
      const price = typeof outcome.price === "number" ? outcome.price : Number(outcome.price);
      if (!key || !Number.isFinite(price)) continue;

      const selection = {
        name: String(outcome.name),
        price,
        bookmaker: bookmaker.title,
      };

      if (key === "home") home.push(selection);
      if (key === "draw") draw.push(selection);
      if (key === "away") away.push(selection);
    }
  }

  return { home, draw, away };
}

function getTotalsSelections(event: OddsEvent, point: number) {
  const over: OutcomeSelection[] = [];

  for (const bookmaker of event.bookmakers ?? []) {
    const market = bookmaker.markets.find((entry) => entry.key === "totals");
    if (!market) continue;

    for (const outcome of market.outcomes) {
      const price = typeof outcome.price === "number" ? outcome.price : Number(outcome.price);
      const name = String(outcome.name ?? "");
      const outcomePoint = typeof outcome.point === "number" ? outcome.point : Number(outcome.point);
      if (!Number.isFinite(price) || !Number.isFinite(outcomePoint) || outcomePoint !== point) continue;
      if (!name.toLowerCase().includes("over")) continue;

      over.push({
        name,
        price,
        bookmaker: bookmaker.title,
      });
    }
  }

  return over;
}

export function matchOddsToTeams(match: TeamPair, events: OddsEvent[]) {
  let bestMatch: OddsEvent | undefined;
  let bestScore = 0;

  for (const event of events) {
    const directScore =
      teamNameScore(match.homeTeam, event.homeTeam) * 0.55 +
      teamNameScore(match.awayTeam, event.awayTeam) * 0.45;
    const swappedScore =
      teamNameScore(match.homeTeam, event.awayTeam) * 0.55 +
      teamNameScore(match.awayTeam, event.homeTeam) * 0.45;
    const score = Math.max(directScore, swappedScore);

    if (score < 0.55) continue;

    const timePenalty = dateDistanceHours(match.matchDate, event.commenceTime) * 0.015;
    const finalScore = score - timePenalty;

    if (finalScore > bestScore) {
      bestScore = finalScore;
      bestMatch = event;
    }
  }

  return bestMatch;
}

function getPredictedSelection(prediction: MatchPrediction): "home" | "draw" | "away" {
  if (prediction.predictedResult === "Home Win") return "home";
  if (prediction.predictedResult === "Away Win") return "away";
  return "draw";
}

function getModelProbability(prediction: MatchPrediction, selection: "home" | "draw" | "away") {
  if (selection === "home") return prediction.homeWinProb;
  if (selection === "away") return prediction.awayWinProb;
  return prediction.drawProb;
}

export function buildOddsInsight(
  prediction: MatchPrediction,
  event?: OddsEvent,
): MatchOddsInsight | null {
  if (!event) return null;

  const selections = getH2HSelections(event);
  const rawImplied = {
    home: selections.home.length > 0 ? 100 / (selections.home.reduce((sum, selection) => sum + selection.price, 0) / selections.home.length) : 0,
    draw: selections.draw.length > 0 ? 100 / (selections.draw.reduce((sum, selection) => sum + selection.price, 0) / selections.draw.length) : 0,
    away: selections.away.length > 0 ? 100 / (selections.away.reduce((sum, selection) => sum + selection.price, 0) / selections.away.length) : 0,
  };
  const impliedTotal = rawImplied.home + rawImplied.draw + rawImplied.away || 1;
  const normalized = {
    home: (rawImplied.home / impliedTotal) * 100,
    draw: (rawImplied.draw / impliedTotal) * 100,
    away: (rawImplied.away / impliedTotal) * 100,
  };

  const predictedSelection = getPredictedSelection(prediction);
  const home = toSelectionInsight(selections.home, normalized.home);
  const draw = toSelectionInsight(selections.draw, normalized.draw);
  const away = toSelectionInsight(selections.away, normalized.away);

  home.valueEdge = home.marketProbability == null ? null : Number((prediction.homeWinProb - home.marketProbability).toFixed(1));
  draw.valueEdge = draw.marketProbability == null ? null : Number((prediction.drawProb - draw.marketProbability).toFixed(1));
  away.valueEdge = away.marketProbability == null ? null : Number((prediction.awayWinProb - away.marketProbability).toFixed(1));

  const over25Selections = getTotalsSelections(event, 2.5);
  const over35Selections = getTotalsSelections(event, 3.5);
  const over25 = over25Selections.length > 0 ? toSelectionInsight(over25Selections, null) : null;
  const over35 = over35Selections.length > 0 ? toSelectionInsight(over35Selections, null) : null;
  if (over25) over25.valueEdge = null;
  if (over35) over35.valueEdge = null;

  const predictedValueEdge =
    home.valueEdge == null && draw.valueEdge == null && away.valueEdge == null
      ? null
      : Number((getModelProbability(prediction, predictedSelection) - (
          predictedSelection === "home"
            ? (home.marketProbability ?? getModelProbability(prediction, "home"))
            : predictedSelection === "away"
            ? (away.marketProbability ?? getModelProbability(prediction, "away"))
            : (draw.marketProbability ?? getModelProbability(prediction, "draw"))
        )).toFixed(1));

  return {
    eventId: event.id,
    commenceTime: event.commenceTime,
    home,
    draw,
    away,
    over25,
    over35,
    predictedSelection,
    predictedValueEdge,
  };
}

export function enrichPredictionsWithOdds(predictions: MatchPrediction[], oddsEvents: OddsEvent[]) {
  return predictions.map((prediction) => {
    const event = matchOddsToTeams(prediction, oddsEvents);
    return {
      ...prediction,
      odds: buildOddsInsight(prediction, event),
    };
  });
}
