import { useQuery } from "@tanstack/react-query";
import { fetchPredictions } from "@/services/predictionsService";
import { MatchPrediction } from "@/services/footballPredictionEngine";

export function usePredictionsData() {
  return useQuery<MatchPrediction[]>({
    queryKey: ['predictions'],
    queryFn: fetchPredictions,
    staleTime: 15 * 60 * 1000,
    retry: 2,
  });
}
