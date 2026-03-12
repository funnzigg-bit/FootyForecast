import { useEffect, useMemo, useState } from "react";
import { LiveMatch } from "@/services/liveDataService";
import { MatchPrediction } from "@/services/footballPredictionEngine";
import { PredictionResult } from "@/services/predictionEngine";
import { AppAlertItem, ProductSettings } from "@/types/userUtility";
import { isUpcomingPrediction } from "@/lib/predictionInsights";

function getStorageKey(userId?: string | null) {
  return `footyforecast:alerts:${userId ?? "guest"}`;
}

function getThresholds(alertStyle: ProductSettings["alertStyle"]) {
  if (alertStyle === "conservative") {
    return { liveSignal: 80, btts: 70, over25: 72, value: 6.5 };
  }
  if (alertStyle === "aggressive") {
    return { liveSignal: 68, btts: 60, over25: 62, value: 3.5 };
  }
  return { liveSignal: 74, btts: 65, over25: 67, value: 5 };
}

function toAlertId(type: AppAlertItem["type"], matchId: string) {
  return `${type}:${matchId}`;
}

export function useDerivedAlerts(
  userId: string | null | undefined,
  liveMatches: LiveMatch[],
  livePredictions: Map<string, PredictionResult>,
  preMatchPredictions: MatchPrediction[],
  watchedIds: Set<string>,
  settings: ProductSettings,
) {
  const [storedAlerts, setStoredAlerts] = useState<AppAlertItem[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) {
      setStoredAlerts([]);
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setStoredAlerts(parsed);
      }
    } catch {
      setStoredAlerts([]);
    }
  }, [userId]);

  const generatedAlerts = useMemo(() => {
    const thresholds = getThresholds(settings.alertStyle);
    const next: AppAlertItem[] = [];

    liveMatches.forEach((match) => {
      const prediction = livePredictions.get(match.id);

      if (watchedIds.has(match.id) && (match.status === "live" || match.status === "halftime")) {
        next.push({
          id: toAlertId("watched_match_live", match.id),
          type: "watched_match_live",
          matchId: match.id,
          title: `${match.homeTeam} vs ${match.awayTeam} is live`,
          message: `${match.league} has moved in-play at ${match.minute || 0}'.`,
          createdAt: new Date().toISOString(),
          severity: "info",
          league: match.league,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          probability: prediction?.probabilityScore,
        });
      }

      if (prediction && prediction.probabilityScore >= thresholds.liveSignal) {
        next.push({
          id: toAlertId("live_signal", match.id),
          type: "live_signal",
          matchId: match.id,
          title: `Live signal spike: ${match.homeTeam} vs ${match.awayTeam}`,
          message: `${prediction.probabilityScore}% live trigger with ${prediction.reasonSummary}`,
          createdAt: new Date().toISOString(),
          severity: prediction.probabilityScore >= thresholds.liveSignal + 8 ? "high" : "watch",
          league: match.league,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          probability: prediction.probabilityScore,
        });
      }
    });

    preMatchPredictions
      .filter((prediction) => isUpcomingPrediction(prediction))
      .slice(0, 30)
      .forEach((prediction) => {
        if ((prediction.valueEdge ?? prediction.odds?.predictedValueEdge ?? 0) >= thresholds.value) {
          next.push({
            id: toAlertId("value_edge", prediction.id),
            type: "value_edge",
            matchId: prediction.id,
            title: `Value edge: ${prediction.homeTeam} vs ${prediction.awayTeam}`,
            message: `${prediction.predictedResult} shows a ${(
              prediction.valueEdge ?? prediction.odds?.predictedValueEdge ?? 0
            ).toFixed(1)}% model edge over the market.`,
            createdAt: new Date().toISOString(),
            severity: "watch",
            league: prediction.league,
            homeTeam: prediction.homeTeam,
            awayTeam: prediction.awayTeam,
            probability: prediction.confidence,
          });
        }

        if (prediction.bttsProb >= thresholds.btts) {
          next.push({
            id: toAlertId("btts", prediction.id),
            type: "btts",
            matchId: prediction.id,
            title: `BTTS watch: ${prediction.homeTeam} vs ${prediction.awayTeam}`,
            message: `${prediction.bttsProb}% BTTS signal for ${prediction.league}.`,
            createdAt: new Date().toISOString(),
            severity: "info",
            league: prediction.league,
            homeTeam: prediction.homeTeam,
            awayTeam: prediction.awayTeam,
            probability: prediction.bttsProb,
          });
        }

        if (prediction.over25Prob >= thresholds.over25) {
          next.push({
            id: toAlertId("over25", prediction.id),
            type: "over25",
            matchId: prediction.id,
            title: `Goals angle: ${prediction.homeTeam} vs ${prediction.awayTeam}`,
            message: `${prediction.over25Prob}% over 2.5 signal with expected goals ${prediction.totalGoalsExpected?.toFixed(2) ?? "n/a"}.`,
            createdAt: new Date().toISOString(),
            severity: "info",
            league: prediction.league,
            homeTeam: prediction.homeTeam,
            awayTeam: prediction.awayTeam,
            probability: prediction.over25Prob,
          });
        }
      });

    return next;
  }, [liveMatches, livePredictions, preMatchPredictions, settings.alertStyle, watchedIds]);

  useEffect(() => {
    if (generatedAlerts.length === 0) return;

    setStoredAlerts((previous) => {
      const merged = new Map(previous.map((alert) => [alert.id, alert]));
      generatedAlerts.forEach((alert) => {
        if (!merged.has(alert.id)) {
          merged.set(alert.id, alert);
        }
      });

      const next = Array.from(merged.values())
        .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
        .slice(0, 60);

      localStorage.setItem(getStorageKey(userId), JSON.stringify(next));
      return next;
    });
  }, [generatedAlerts, userId]);

  return useMemo(() => ({
    alerts: storedAlerts,
    clearAlerts: () => {
      localStorage.removeItem(getStorageKey(userId));
      setStoredAlerts([]);
    },
  }), [storedAlerts, userId]);
}
