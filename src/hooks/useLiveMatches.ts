import { useQuery } from "@tanstack/react-query";
import { fetchLiveMatches, LiveMatch } from "@/services/liveDataService";
import { runPredictions, PredictionResult, MatchStats } from "@/services/predictionEngine";

export function useLiveMatches(refetchInterval = 30000) {
  return useQuery({
    queryKey: ['live-matches'],
    queryFn: fetchLiveMatches,
    refetchInterval,
    staleTime: 10000,
    retry: 2,
  });
}

export function usePredictions(matches: LiveMatch[]) {
  const liveStats: MatchStats[] = matches
    .filter((m) => m.status === 'live')
    .map((m) => m.stats);

  const results = runPredictions(liveStats);
  const predMap = new Map<string, PredictionResult>();
  results.forEach((r) => predMap.set(r.matchId, r));
  return predMap;
}
