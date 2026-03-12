import { MatchPrediction } from "@/services/footballPredictionEngine";

const DAY_MS = 24 * 60 * 60 * 1000;

function toDate(value?: string) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isUpcomingPrediction(prediction: MatchPrediction, now = new Date()) {
  if (prediction.status && prediction.status !== "scheduled") return false;
  const matchDate = toDate(prediction.matchDate);
  return matchDate ? matchDate.getTime() >= now.getTime() - DAY_MS : true;
}

export function isPredictionToday(prediction: MatchPrediction, now = new Date()) {
  const matchDate = toDate(prediction.matchDate);
  if (!matchDate) return false;
  return matchDate.toDateString() === now.toDateString();
}

export function getPredictionPriority(prediction: MatchPrediction) {
  const resultStrength = Math.max(prediction.homeWinProb, prediction.drawProb, prediction.awayWinProb);
  const goalsStrength = Math.max(prediction.over25Prob, prediction.bttsProb);
  const valueBoost = prediction.isValue ? Math.min(10, prediction.valueEdge ?? 0) : 0;
  const upsetPenalty = prediction.isUpset ? Math.min(10, (prediction.upsetScore ?? 0) * 0.1) : 0;
  const freshnessBoost = prediction.status === "live" ? 6 : prediction.status === "scheduled" ? 4 : 0;

  return Math.round(
    (prediction.pickScore ?? prediction.confidence) * 0.42 +
    prediction.confidence * 0.22 +
    resultStrength * 0.18 +
    goalsStrength * 0.10 +
    valueBoost +
    freshnessBoost -
    upsetPenalty
  );
}

export function getStrongestWinProbability(prediction: MatchPrediction) {
  return Math.max(prediction.homeWinProb, prediction.drawProb, prediction.awayWinProb);
}

export function getMarketLabel(prediction: MatchPrediction) {
  if (prediction.recommendedMarket) return prediction.recommendedMarket;

  const resultStrength = getStrongestWinProbability(prediction);
  if (resultStrength >= prediction.over25Prob && resultStrength >= prediction.bttsProb) {
    return prediction.predictedResult;
  }
  if (prediction.over25Prob >= prediction.bttsProb) return "Over 2.5";
  return "BTTS Yes";
}

export function getPredictionAngle(prediction: MatchPrediction) {
  const signals: string[] = [];

  if (prediction.confidence >= 80) signals.push("strong model confidence");
  if ((prediction.valueEdge ?? 0) >= 6) signals.push("clear value edge");
  if (prediction.over25Prob >= 70) signals.push("high-goal setup");
  if (prediction.bttsProb >= 65) signals.push("both teams likely to score");
  if ((prediction.upsetScore ?? 0) >= 45) signals.push("volatile underdog angle");

  return signals.slice(0, 2).join(" · ") || prediction.reasoning;
}

export function getScorelineLean(prediction: MatchPrediction) {
  const scores = prediction.topScores?.slice(0, 2).map((score) => `${score.score} (${score.probability}%)`) || [];
  return scores.length > 0 ? scores.join(" / ") : prediction.predictedScore;
}

export function getFixtureSortTimestamp(
  prediction: Pick<MatchPrediction, "matchDate" | "status">,
  now = new Date(),
) {
  const matchDate = toDate(prediction.matchDate);

  if (matchDate) return matchDate.getTime();
  if (prediction.status === "live" || prediction.status === "halftime") {
    return now.getTime() - 60 * 1000;
  }

  return Number.POSITIVE_INFINITY;
}

export function sortPredictionsByKickoff(predictions: MatchPrediction[], now = new Date()) {
  return [...predictions].sort(
    (a, b) => getFixtureSortTimestamp(a, now) - getFixtureSortTimestamp(b, now)
  );
}

export type PredictionSortMetric = "date" | "win_probability" | "confidence" | "btts" | "over25" | "priority";

export function sortPredictionsByMetric(
  predictions: MatchPrediction[],
  metric: PredictionSortMetric,
  direction: "asc" | "desc" = "desc",
  now = new Date(),
) {
  const ordered = metric === "date"
    ? sortPredictionsByKickoff(predictions, now)
    : [...predictions].sort((a, b) => {
        const diff =
          metric === "win_probability"
            ? getStrongestWinProbability(b) - getStrongestWinProbability(a)
            : metric === "confidence"
            ? b.confidence - a.confidence
            : metric === "btts"
            ? b.bttsProb - a.bttsProb
            : metric === "over25"
            ? b.over25Prob - a.over25Prob
            : getPredictionPriority(b) - getPredictionPriority(a);
        return diff;
      });

  return direction === "asc" ? [...ordered].reverse() : ordered;
}

export function rankPredictions(predictions: MatchPrediction[]) {
  return [...predictions].sort((a, b) => getPredictionPriority(b) - getPredictionPriority(a));
}

export function uniquePredictionsByFixture(predictions: MatchPrediction[]) {
  const bestByFixture = new Map<string, MatchPrediction>();

  for (const prediction of predictions) {
    const key = String(prediction.fixtureId ?? `${prediction.matchDate ?? "unknown"}-${prediction.homeTeam}-${prediction.awayTeam}`);
    const existing = bestByFixture.get(key);

    if (!existing || getPredictionPriority(prediction) > getPredictionPriority(existing)) {
      bestByFixture.set(key, prediction);
    }
  }

  return Array.from(bestByFixture.values());
}
