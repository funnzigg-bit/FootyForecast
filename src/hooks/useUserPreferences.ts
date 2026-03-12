import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ProductSettings } from "@/types/userUtility";
import { PredictionSortMetric } from "@/lib/predictionInsights";

const DEFAULT_SETTINGS: ProductSettings = {
  fullName: "",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  preferredLeagues: [],
  alertChannel: "both",
  alertStyle: "balanced",
  oddsDisplay: "average",
  defaultPredictionSort: "date",
};

function getLocalSettingsKey(userId?: string | null) {
  return `footyforecast:product-settings:${userId ?? "guest"}`;
}

function readLocalSettings(userId?: string | null) {
  const raw = localStorage.getItem(getLocalSettingsKey(userId));
  if (!raw) return {};

  try {
    return JSON.parse(raw) as Partial<ProductSettings>;
  } catch {
    return {};
  }
}

function writeLocalSettings(userId: string | null | undefined, value: Partial<ProductSettings>) {
  const current = readLocalSettings(userId);
  localStorage.setItem(getLocalSettingsKey(userId), JSON.stringify({ ...current, ...value }));
}

export function useUserPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["user-preferences", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (!user?.id) return DEFAULT_SETTINGS;

      const [{ data: preference }, { data: profile }] = await Promise.all([
        supabase.from("user_preferences").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
      ]);

      const local = readLocalSettings(user.id);

      return {
        ...DEFAULT_SETTINGS,
        fullName: profile?.full_name ?? user.user_metadata?.full_name ?? "",
        timezone: preference?.timezone ?? profile?.timezone ?? DEFAULT_SETTINGS.timezone,
        preferredLeagues: preference?.preferred_leagues ?? [],
        alertChannel: preference?.alert_channel ?? DEFAULT_SETTINGS.alertChannel,
        alertStyle: preference?.alert_style ?? DEFAULT_SETTINGS.alertStyle,
        oddsDisplay: local.oddsDisplay ?? DEFAULT_SETTINGS.oddsDisplay,
        defaultPredictionSort: (local.defaultPredictionSort as PredictionSortMetric | undefined) ?? DEFAULT_SETTINGS.defaultPredictionSort,
      } satisfies ProductSettings;
    },
    initialData: DEFAULT_SETTINGS,
  });

  const saveMutation = useMutation({
    mutationFn: async (nextSettings: ProductSettings) => {
      if (!user?.id) {
        writeLocalSettings(undefined, nextSettings);
        return nextSettings;
      }

      await Promise.all([
        supabase.from("profiles").upsert({
          user_id: user.id,
          full_name: nextSettings.fullName,
          timezone: nextSettings.timezone,
        }, { onConflict: "user_id" }),
        supabase.from("user_preferences").upsert({
          user_id: user.id,
          timezone: nextSettings.timezone,
          preferred_leagues: nextSettings.preferredLeagues,
          alert_channel: nextSettings.alertChannel,
          alert_style: nextSettings.alertStyle,
        }, { onConflict: "user_id" }),
      ]);

      writeLocalSettings(user.id, {
        oddsDisplay: nextSettings.oddsDisplay,
        defaultPredictionSort: nextSettings.defaultPredictionSort,
      });

      return nextSettings;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user-preferences", user?.id], data);
    },
  });

  return useMemo(() => ({
    settings: query.data ?? DEFAULT_SETTINGS,
    isLoading: query.isLoading,
    saveSettings: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  }), [query.data, query.isLoading, saveMutation.isPending, saveMutation.mutateAsync]);
}
