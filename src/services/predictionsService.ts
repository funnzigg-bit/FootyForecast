import { supabase } from "@/integrations/supabase/client";
import { MatchPrediction } from "./footballPredictionEngine";
import { fetchOdds } from "./liveDataService";
import { recalibratePredictionsAgainstOdds } from "@/lib/predictionCalibration";

export async function fetchPredictions(): Promise<MatchPrediction[]> {
  const { data, error } = await supabase.functions.invoke('fetch-predictions');

  if (error) {
    console.error('Error fetching predictions:', error);
    throw new Error(error.message || 'Failed to fetch predictions');
  }

  const predictions = data?.predictions || [];

  try {
    const odds = await fetchOdds();
    return recalibratePredictionsAgainstOdds(predictions, odds);
  } catch (oddsError) {
    console.error("Error enriching predictions with odds:", oddsError);
    return predictions;
  }
}
