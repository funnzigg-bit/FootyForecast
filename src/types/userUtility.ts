import { PredictionSortMetric } from "@/lib/predictionInsights";

export type OddsDisplayPreference = "average" | "best";

export interface ProductSettings {
  fullName: string;
  timezone: string;
  preferredLeagues: string[];
  alertChannel: "telegram" | "email" | "both";
  alertStyle: "conservative" | "balanced" | "aggressive";
  oddsDisplay: OddsDisplayPreference;
  defaultPredictionSort: PredictionSortMetric;
}

export interface AppAlertItem {
  id: string;
  type: "live_signal" | "watched_match_live" | "value_edge" | "btts" | "over25";
  matchId: string;
  title: string;
  message: string;
  createdAt: string;
  severity: "info" | "watch" | "high";
  league?: string;
  homeTeam?: string;
  awayTeam?: string;
  probability?: number;
}
