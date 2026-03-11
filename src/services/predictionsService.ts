import { supabase } from "@/integrations/supabase/client";
import { MatchPrediction } from "./footballPredictionEngine";

export async function fetchPredictions(): Promise<MatchPrediction[]> {
  const { data, error } = await supabase.functions.invoke('fetch-predictions');

  if (error) {
    console.error('Error fetching predictions:', error);
    throw new Error(error.message || 'Failed to fetch predictions');
  }

  return data?.predictions || [];
}
