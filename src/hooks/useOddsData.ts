import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { enrichPredictionsWithOdds, matchOddsToTeams } from "@/lib/oddsInsights";
import { LiveMatch, fetchOdds } from "@/services/liveDataService";
import { MatchPrediction } from "@/services/footballPredictionEngine";

export function useOddsData() {
  return useQuery({
    queryKey: ["odds-data"],
    queryFn: fetchOdds,
    staleTime: 60 * 1000,
    retry: 1,
  });
}

export function usePredictionsWithOdds(predictions: MatchPrediction[]) {
  const { data: odds = [], ...query } = useOddsData();

  const enrichedPredictions = useMemo(
    () => enrichPredictionsWithOdds(predictions, odds),
    [predictions, odds],
  );

  return {
    data: enrichedPredictions,
    odds,
    ...query,
  };
}

export function useLiveOddsMap(matches: LiveMatch[]) {
  const { data: odds = [], ...query } = useOddsData();

  const oddsMap = useMemo(() => {
    const next = new Map<string, ReturnType<typeof matchOddsToTeams>>();
    matches.forEach((match) => {
      next.set(match.id, matchOddsToTeams(match, odds));
    });
    return next;
  }, [matches, odds]);

  return {
    data: oddsMap,
    odds,
    ...query,
  };
}
