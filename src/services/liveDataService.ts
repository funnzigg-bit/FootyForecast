// GoalPulse AI — Live Data Service
// Fetches real match data from edge functions

import { supabase } from "@/integrations/supabase/client";
import { MatchStats } from "./predictionEngine";

export interface LiveIncident {
  minute: number;
  type: 'goal' | 'card' | 'substitution' | 'var' | 'penalty' | 'other';
  cardType?: 'yellow' | 'red';
  playerName?: string;
  isHome?: boolean;
  teamName?: string;
  description?: string;
}

export interface LiveMatch {
  id: string;
  fixtureId: number;
  league: string;
  leagueLogo?: string;
  leagueCountry?: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo?: string;
  awayLogo?: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  status: 'live' | 'finished' | 'halftime' | 'scheduled';
  stats: MatchStats;
  incidents?: LiveIncident[];
}

export interface OddsEvent {
  id: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  bookmakers: {
    key: string;
    title: string;
    markets: {
      key: string;
      outcomes: { name: string; price: number }[];
    }[];
  }[];
}

export async function fetchLiveMatches(): Promise<LiveMatch[]> {
  const { data, error } = await supabase.functions.invoke('fetch-live-matches');

  if (error) {
    console.error('Error fetching live matches:', error);
    throw new Error(error.message || 'Failed to fetch live matches');
  }

  return data?.matches || [];
}

export async function fetchOdds(): Promise<OddsEvent[]> {
  const { data, error } = await supabase.functions.invoke('fetch-odds');

  if (error) {
    console.error('Error fetching odds:', error);
    throw new Error(error.message || 'Failed to fetch odds');
  }

  return data?.odds || [];
}

// Match odds to live matches by team name similarity
export function matchOddsToFixture(
  match: LiveMatch,
  odds: OddsEvent[]
): OddsEvent | undefined {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
  const homeNorm = normalize(match.homeTeam);
  const awayNorm = normalize(match.awayTeam);

  return odds.find((o) => {
    const oh = normalize(o.homeTeam);
    const oa = normalize(o.awayTeam);
    return (
      (oh.includes(homeNorm) || homeNorm.includes(oh)) &&
      (oa.includes(awayNorm) || awayNorm.includes(oa))
    );
  });
}
