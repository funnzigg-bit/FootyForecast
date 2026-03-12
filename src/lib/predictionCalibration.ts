import { MatchPrediction } from "@/services/footballPredictionEngine";
import { OddsEvent } from "@/services/liveDataService";
import { buildOddsInsight, matchOddsToTeams } from "@/lib/oddsInsights";

type ResultKey = "home" | "draw" | "away";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeThreeWay(home: number, draw: number, away: number) {
  const values = [Math.max(home, 1), Math.max(draw, 1), Math.max(away, 1)];
  const total = values.reduce((sum, value) => sum + value, 0);
  const rounded = values.map((value) => Math.round((value / total) * 100));
  const drift = 100 - rounded.reduce((sum, value) => sum + value, 0);
  rounded[0] += drift;

  return {
    homeWinProb: rounded[0],
    drawProb: rounded[1],
    awayWinProb: rounded[2],
  };
}

function blendThreeWay(model: MatchPrediction, market?: MatchPrediction["odds"]) {
  if (!market) {
    return normalizeThreeWay(model.homeWinProb, model.drawProb, model.awayWinProb);
  }

  const marketHome = market.home.marketProbability ?? model.homeWinProb;
  const marketDraw = market.draw.marketProbability ?? model.drawProb;
  const marketAway = market.away.marketProbability ?? model.awayWinProb;
  const marketStrongest = Math.max(marketHome, marketAway);
  const sideGap = Math.abs(marketHome - marketAway);
  const marketWeight =
    marketStrongest >= 68 || sideGap >= 28 ? 0.76 :
    marketStrongest >= 58 || sideGap >= 18 ? 0.68 :
    0.58;

  const base = {
    home: model.homeWinProb * (1 - marketWeight) + marketHome * marketWeight,
    draw: model.drawProb * (1 - marketWeight) + marketDraw * marketWeight,
    away: model.awayWinProb * (1 - marketWeight) + marketAway * marketWeight,
  };

  const strongest = Math.max(base.home, base.draw, base.away);
  const favoriteBoost =
    strongest >= 74 ? 10 :
    strongest >= 66 ? 7 :
    strongest >= 58 ? 4 : 0;
  const favoriteIsHome = base.home >= base.away;

  const adjusted = strongest >= 58 && Math.abs(base.home - base.away) >= 12
    ? {
        home: favoriteIsHome ? base.home + favoriteBoost : Math.max(5, base.home - favoriteBoost * 0.7),
        draw: Math.max(10, base.draw - favoriteBoost * 0.45),
        away: favoriteIsHome ? Math.max(5, base.away - favoriteBoost * 0.85) : base.away + favoriteBoost,
      }
    : base;

  return normalizeThreeWay(adjusted.home, adjusted.draw, adjusted.away);
}

function reshapeThreeWay(homeWinProb: number, drawProb: number, awayWinProb: number) {
  const strongest = Math.max(homeWinProb, awayWinProb);
  const gap = Math.abs(homeWinProb - awayWinProb);
  const favoriteIsHome = homeWinProb >= awayWinProb;

  if (strongest >= 43 && gap >= 12) {
    const drawTax =
      drawProb >= 33 ? 7 :
      drawProb >= 29 ? 5 :
      3;
    const favoriteBoost =
      strongest >= 60 ? drawTax + 3 :
      strongest >= 52 ? drawTax + 2 :
      strongest >= 47 ? drawTax + 1 :
      drawTax;

    const adjustedHome = favoriteIsHome
      ? homeWinProb + favoriteBoost
      : Math.max(6, homeWinProb - Math.max(2, drawTax - 1));
    const adjustedAway = favoriteIsHome
      ? Math.max(6, awayWinProb - Math.max(2, Math.round(favoriteBoost * 0.45)))
      : awayWinProb + favoriteBoost;
    const adjustedDraw = Math.max(14, drawProb - drawTax);

    return normalizeThreeWay(adjustedHome, adjustedDraw, adjustedAway);
  }

  if (strongest >= 50 && gap >= 14) {
    const boost =
      strongest >= 64 ? 8 :
      strongest >= 56 ? 5 :
      3;
    const adjustedHome = favoriteIsHome ? homeWinProb + boost : Math.max(6, homeWinProb - boost * 0.75);
    const adjustedAway = favoriteIsHome ? Math.max(6, awayWinProb - boost * 0.85) : awayWinProb + boost;
    const adjustedDraw = Math.max(12, drawProb - boost * 0.45);
    return normalizeThreeWay(adjustedHome, adjustedDraw, adjustedAway);
  }

  if (gap <= 6 && drawProb > 30) {
    return normalizeThreeWay(homeWinProb + 2, drawProb - 4, awayWinProb + 2);
  }

  return normalizeThreeWay(homeWinProb, drawProb, awayWinProb);
}

function getPredictedResult(homeWinProb: number, drawProb: number, awayWinProb: number) {
  const strongest = Math.max(homeWinProb, drawProb, awayWinProb);
  if (strongest === drawProb) return "Draw";
  if (strongest === awayWinProb) return "Away Win";
  return "Home Win";
}

function marketResultKey(result: MatchPrediction["predictedResult"]): ResultKey {
  if (result === "Home Win") return "home";
  if (result === "Away Win") return "away";
  return "draw";
}

function calibrateGoalMarkets(prediction: MatchPrediction, recalibrated: ReturnType<typeof normalizeThreeWay>, odds?: MatchPrediction["odds"]) {
  const strongest = Math.max(recalibrated.homeWinProb, recalibrated.awayWinProb);
  const gap = Math.abs(recalibrated.homeWinProb - recalibrated.awayWinProb);
  const over25Market = odds?.over25?.averageOdds ? clamp((100 / odds.over25.averageOdds), 22, 82) : null;
  const over35Market = odds?.over35?.averageOdds ? clamp((100 / odds.over35.averageOdds), 8, 60) : null;

  const over25 = clamp(
    (prediction.over25Prob * 0.56) +
    ((over25Market ?? prediction.over25Prob) * 0.44) +
    Math.max(0, strongest - 58) * 0.22 -
    Math.max(0, prediction.drawProb - 28) * 0.2,
    28,
    84,
  );

  const bttsBase =
    prediction.bttsProb * 0.78 +
    Math.min(14, Math.max(-10, over25 - 50)) * 0.32 -
    Math.max(0, gap - 24) * 0.1 +
    Math.min(recalibrated.homeWinProb, recalibrated.awayWinProb) * 0.18;

  const btts = clamp(bttsBase, 24, 79);
  const over35 = clamp(
    prediction.over35Prob * 0.58 +
    (over35Market ?? prediction.over35Prob) * 0.42 +
    Math.max(0, over25 - 58) * 0.5,
    10,
    68,
  );

  return {
    over25Prob: Math.round(over25),
    over35Prob: Math.round(over35),
    bttsProb: Math.round(btts),
  };
}

function deriveExpectedGoals(
  homeWinProb: number,
  drawProb: number,
  awayWinProb: number,
  over25Prob: number,
  over35Prob: number,
  bttsProb: number,
) {
  const strongest = Math.max(homeWinProb, awayWinProb);
  const total =
    2.45 +
    (over25Prob - 50) * 0.028 +
    (over35Prob - 25) * 0.02 +
    (bttsProb - 50) * 0.012 -
    (drawProb - 26) * 0.015 +
    Math.max(0, strongest - 54) * 0.006;

  const boundedTotal = clamp(total, 1.9, 4.9);
  const shareBase = 0.5 + (homeWinProb - awayWinProb) / 180;
  let homeShare = clamp(shareBase, 0.18, 0.82);

  let homeLambda = boundedTotal * homeShare;
  let awayLambda = boundedTotal * (1 - homeShare);

  if (bttsProb >= 62) {
    homeLambda = Math.max(homeLambda, 0.95);
    awayLambda = Math.max(awayLambda, 0.85);
  } else if (bttsProb <= 44) {
    if (homeLambda >= awayLambda) awayLambda = Math.min(awayLambda, 0.65);
    else homeLambda = Math.min(homeLambda, 0.65);
  }

  const adjustedTotal = homeLambda + awayLambda;
  if (adjustedTotal !== boundedTotal) {
    const rescale = boundedTotal / adjustedTotal;
    homeLambda *= rescale;
    awayLambda *= rescale;
  }

  homeShare = homeLambda / (homeLambda + awayLambda);

  return {
    totalExpectedGoals: Number((homeLambda + awayLambda).toFixed(2)),
    homeLambda: Number(homeLambda.toFixed(2)),
    awayLambda: Number(awayLambda.toFixed(2)),
    homeTeamScore: homeShare,
    awayTeamScore: 1 - homeShare,
  };
}

function poissonPmf(k: number, lambda: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let logP = -lambda + k * Math.log(lambda);
  for (let i = 2; i <= k; i += 1) logP -= Math.log(i);
  return Math.exp(logP);
}

function generateTopScores(homeLambda: number, awayLambda: number) {
  const scores: Array<{ score: string; probability: number }> = [];

  for (let home = 0; home <= 6; home += 1) {
    for (let away = 0; away <= 6; away += 1) {
      scores.push({
        score: `${home}-${away}`,
        probability: poissonPmf(home, homeLambda) * poissonPmf(away, awayLambda),
      });
    }
  }

  return scores
    .sort((left, right) => right.probability - left.probability)
    .slice(0, 10);
}

function fixtureHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function getPreferredScores(
  predictedResult: MatchPrediction["predictedResult"],
  totalExpectedGoals: number,
  bttsProb: number,
  over25Prob: number,
) {
  const bttsLikely = bttsProb >= 52;
  const highGoals = totalExpectedGoals >= 3.25 || over25Prob >= 62;
  const mediumGoals = totalExpectedGoals >= 2.45 || over25Prob >= 50;

  if (predictedResult === "Home Win") {
    if (bttsLikely && highGoals) return ["3-1", "2-1", "3-2", "4-1", "2-2"];
    if (bttsLikely) return ["2-1", "1-1", "3-1", "2-2", "1-0"];
    if (highGoals) return ["3-0", "2-0", "4-0", "3-1", "1-0"];
    if (mediumGoals) return ["2-0", "1-0", "2-1", "3-0", "1-1"];
    return ["1-0", "2-0", "1-1", "2-1", "0-0"];
  }

  if (predictedResult === "Away Win") {
    if (bttsLikely && highGoals) return ["1-3", "1-2", "2-3", "1-4", "2-2"];
    if (bttsLikely) return ["1-2", "1-1", "1-3", "2-2", "0-1"];
    if (highGoals) return ["0-3", "0-2", "0-4", "1-3", "0-1"];
    if (mediumGoals) return ["0-2", "0-1", "1-2", "0-3", "1-1"];
    return ["0-1", "0-2", "1-1", "1-2", "0-0"];
  }

  if (bttsLikely && highGoals) return ["2-2", "1-1", "3-3", "2-1", "1-2"];
  if (bttsLikely || mediumGoals) return ["1-1", "2-2", "0-0", "2-1", "1-2"];
  return ["0-0", "1-1", "1-0", "0-1", "2-0"];
}

function pickScoreline(
  scores: Array<{ score: string; probability: number }>,
  predictedResult: MatchPrediction["predictedResult"],
  over25Prob: number,
  bttsProb: number,
  totalExpectedGoals: number,
  homeLambda: number,
  awayLambda: number,
  fixtureKey: string,
) {
  const targetBtts = bttsProb >= 50 ? "Yes" : "No";
  const targetOver25 = over25Prob >= 52;
  const preferredScores = getPreferredScores(predictedResult, totalExpectedGoals, bttsProb, over25Prob);
  const preferredIndex = new Map(preferredScores.map((score, index) => [score, index]));
  const seed = fixtureHash(fixtureKey);

  const ranked = scores
    .map((entry) => {
      const [home, away] = entry.score.split("-").map(Number);
      const totalGoals = home + away;
      const result =
        home > away ? "Home Win" :
        away > home ? "Away Win" :
        "Draw";
      const btts = home > 0 && away > 0 ? "Yes" : "No";
      const over25 = totalGoals >= 3;

      let shapeBias = 0;
      const preferredRank = preferredIndex.get(entry.score);
      if (preferredRank != null) {
        shapeBias += 16 - preferredRank * 3;
      }
      if (predictedResult !== "Draw" && totalExpectedGoals >= 2.35 && totalGoals <= 1) {
        shapeBias -= 10;
      }
      if (predictedResult === "Draw" && totalExpectedGoals >= 2.9 && totalGoals <= 2) {
        shapeBias -= 6;
      }
      if (targetBtts === "Yes" && (home === 0 || away === 0)) {
        shapeBias -= 8;
      }
      if (targetBtts === "No" && home > 0 && away > 0) {
        shapeBias -= 6;
      }
      if (targetOver25 && totalGoals <= 2) {
        shapeBias -= 7;
      }
      if (!targetOver25 && totalGoals >= 4) {
        shapeBias -= 6;
      }
      if (predictedResult === "Home Win" && targetBtts === "No") {
        if (home === 2 && away === 0 && homeLambda >= 1.45) shapeBias += 7;
        if (home === 3 && away === 0 && homeLambda >= 1.9) shapeBias += 5;
        if (home === 1 && away === 0 && totalExpectedGoals >= 2.15) shapeBias -= 3;
      }
      if (predictedResult === "Away Win" && targetBtts === "No") {
        if (home === 0 && away === 2 && awayLambda >= 1.45) shapeBias += 7;
        if (home === 0 && away === 3 && awayLambda >= 1.9) shapeBias += 5;
        if (home === 0 && away === 1 && totalExpectedGoals >= 2.15) shapeBias -= 3;
      }
      if (predictedResult === "Home Win" && targetBtts === "Yes" && home === 2 && away === 1 && homeLambda >= 1.45) {
        shapeBias += 5;
      }
      if (predictedResult === "Away Win" && targetBtts === "Yes" && home === 1 && away === 2 && awayLambda >= 1.45) {
        shapeBias += 5;
      }
      const deterministicTiebreak = ((seed + home * 13 + away * 17) % 7) * 0.12;

      const score =
        entry.probability * 100 +
        (result === predictedResult ? 8 : -6) +
        (btts === targetBtts ? 5 : -3) +
        (over25 === targetOver25 ? 5 : -4) -
        Math.abs(totalGoals - totalExpectedGoals) * 3.6 +
        shapeBias +
        deterministicTiebreak;

      return { score: entry.score, probability: entry.probability, rank: score };
    })
    .sort((left, right) => right.rank - left.rank);

  return ranked[0]?.score ?? "1-1";
}

function getConfidence(homeWinProb: number, drawProb: number, awayWinProb: number, market?: MatchPrediction["odds"]) {
  const sorted = [homeWinProb, drawProb, awayWinProb].sort((left, right) => right - left);
  const strongest = sorted[0];
  const gap = sorted[0] - sorted[1];
  const marketAgreement = market
    ? Math.max(
        0,
        18 - Math.abs(homeWinProb - (market.home.marketProbability ?? homeWinProb)) -
        Math.abs(awayWinProb - (market.away.marketProbability ?? awayWinProb)) * 0.4
      )
    : 6;

  let confidence = strongest * 0.72 + gap * 0.82 + Math.max(0, 28 - drawProb) * 0.24 + marketAgreement;

  if (strongest >= 72 && gap >= 24) confidence = Math.max(confidence, 80);
  else if (strongest >= 64 && gap >= 16) confidence = Math.max(confidence, 68);
  else if (strongest >= 56 && gap >= 10) confidence = Math.max(confidence, 56);

  const rounded = Math.round(clamp(confidence, 35, 90));
  const confidenceLevel =
    rounded >= 84 ? "elite" :
    rounded >= 70 ? "high" :
    rounded >= 55 ? "medium" :
    rounded >= 40 ? "low" :
    "very_risky";

  return { confidence: rounded, confidenceLevel };
}

function getRecommendedMarket(prediction: MatchPrediction) {
  const strongestResult = Math.max(prediction.homeWinProb, prediction.drawProb, prediction.awayWinProb);
  const best = [
    { label: prediction.predictedResult, score: strongestResult + prediction.confidence * 0.35 },
    { label: "Over 2.5", score: prediction.over25Prob + prediction.confidence * 0.24 },
    { label: "BTTS Yes", score: prediction.bttsProb + prediction.confidence * 0.18 },
  ].sort((left, right) => right.score - left.score)[0];

  return best?.label ?? prediction.predictedResult;
}

function getReasoning(prediction: MatchPrediction) {
  const notes: string[] = [];

  if (prediction.odds?.predictedValueEdge != null && prediction.odds.predictedValueEdge >= 4) {
    notes.push(`market edge +${prediction.odds.predictedValueEdge.toFixed(1)}%`);
  }
  if (prediction.over25Prob >= 66) notes.push("strong goals setup");
  if (prediction.bttsProb >= 60) notes.push("both teams likely to score");
  if (Math.max(prediction.homeWinProb, prediction.awayWinProb) >= 64) notes.push("clear favourite profile");

  return notes.length > 0
    ? notes.slice(0, 2).join(" · ")
    : prediction.reasoning;
}

export function recalibratePredictionsAgainstOdds(predictions: MatchPrediction[], oddsEvents: OddsEvent[]) {
  return predictions.map((prediction) => {
    const matchedEvent = matchOddsToTeams(prediction, oddsEvents);
    const odds = buildOddsInsight(prediction, matchedEvent);
    const blended = blendThreeWay(prediction, odds ?? undefined);
    const recalibrated = reshapeThreeWay(blended.homeWinProb, blended.drawProb, blended.awayWinProb);
    const markets = calibrateGoalMarkets(prediction, recalibrated, odds ?? undefined);
    const expectedGoals = deriveExpectedGoals(
      recalibrated.homeWinProb,
      recalibrated.drawProb,
      recalibrated.awayWinProb,
      markets.over25Prob,
      markets.over35Prob,
      markets.bttsProb,
    );
    const scoreCandidates = generateTopScores(expectedGoals.homeLambda, expectedGoals.awayLambda);
    const predictedResult = getPredictedResult(
      recalibrated.homeWinProb,
      recalibrated.drawProb,
      recalibrated.awayWinProb,
    );
    const predictedScore = pickScoreline(
      scoreCandidates,
      predictedResult,
      markets.over25Prob,
      markets.bttsProb,
      expectedGoals.totalExpectedGoals,
      expectedGoals.homeLambda,
      expectedGoals.awayLambda,
      `${prediction.homeTeam}-${prediction.awayTeam}-${prediction.matchDate ?? ""}`,
    );
    const topScores = scoreCandidates.slice(0, 5).map((entry) => ({
      score: entry.score,
      probability: Number((entry.probability * 100).toFixed(1)),
    }));
    const { confidence, confidenceLevel } = getConfidence(
      recalibrated.homeWinProb,
      recalibrated.drawProb,
      recalibrated.awayWinProb,
      odds ?? undefined,
    );
    const resultKey = marketResultKey(predictedResult);
    const resultSelection =
      resultKey === "home" ? odds?.home :
      resultKey === "away" ? odds?.away :
      odds?.draw;
    const valueEdge = resultSelection?.valueEdge ?? prediction.valueEdge ?? 0;
    const isValue = valueEdge >= 3;
    const underdogMarketProb = odds
      ? Math.min(odds.home.marketProbability ?? 100, odds.away.marketProbability ?? 100)
      : 0;
    const isUpset =
      odds != null &&
      ((predictedResult === "Home Win" && (odds.home.marketProbability ?? 0) < (odds.away.marketProbability ?? 100)) ||
      (predictedResult === "Away Win" && (odds.away.marketProbability ?? 0) < (odds.home.marketProbability ?? 100)));
    const upsetScore = isUpset ? Math.round(Math.max(42, 100 - underdogMarketProb + confidence * 0.18)) : 0;

    const nextPrediction: MatchPrediction = {
      ...prediction,
      homeWinProb: recalibrated.homeWinProb,
      drawProb: recalibrated.drawProb,
      awayWinProb: recalibrated.awayWinProb,
      predictedResult,
      predictedScore,
      confidence,
      confidenceLevel,
      over25Prob: markets.over25Prob,
      over35Prob: markets.over35Prob,
      bttsProb: markets.bttsProb,
      bttsResult: markets.bttsProb >= 55 ? "Yes" : "No",
      totalGoalsExpected: expectedGoals.totalExpectedGoals,
      topScores,
      homeTeamScore: Number(expectedGoals.homeTeamScore.toFixed(2)),
      awayTeamScore: Number(expectedGoals.awayTeamScore.toFixed(2)),
      isValue,
      valueEdge,
      isUpset,
      upsetScore,
      odds: odds ?? null,
    };

    nextPrediction.recommendedMarket = getRecommendedMarket(nextPrediction);
    nextPrediction.reasoning = getReasoning(nextPrediction);
    nextPrediction.pickScore = Math.round(
      nextPrediction.confidence * 0.45 +
      Math.max(nextPrediction.homeWinProb, nextPrediction.drawProb, nextPrediction.awayWinProb) * 0.2 +
      Math.max(nextPrediction.over25Prob, nextPrediction.bttsProb) * 0.12 +
      Math.max(0, valueEdge) * 1.4
    );

    return nextPrediction;
  });
}
