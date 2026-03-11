import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const BASE = 'https://sports.bzzoiro.com/api';

function pickFirstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const API_KEY = Deno.env.get('BSD_API_KEY');
  if (!API_KEY) {
    return new Response(JSON.stringify({ error: 'BSD_API_KEY not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const apiHeaders = { 'Authorization': `Token ${API_KEY}` };
  const IMG_BASE = 'https://sports.bzzoiro.com/img';

  try {
    const res = await fetch(`${BASE}/live/`, { headers: apiHeaders });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`BSD live API error [${res.status}]: ${errText}`);
    }

    const data = await res.json();
    const results = data.results || [];
    console.log(`Live matches from BSD: ${results.length}`);

    const matches = results.map((event: any) => {
      const league = event.league || {};
      const homeTeamObj = event.home_team_obj;
      const awayTeamObj = event.away_team_obj;
      const liveStats = event.live_stats;

      const homeLogo = homeTeamObj?.api_id
        ? `${IMG_BASE}/team/${homeTeamObj.api_id}/?token=${API_KEY}`
        : undefined;
      const awayLogo = awayTeamObj?.api_id
        ? `${IMG_BASE}/team/${awayTeamObj.api_id}/?token=${API_KEY}`
        : undefined;

      const minute = event.current_minute || 0;

      const statusMap: Record<string, string> = {
        'inprogress': 'live',
        '1st_half': 'live',
        '2nd_half': 'live',
        'halftime': 'halftime',
        'finished': 'finished',
        'notstarted': 'scheduled',
      };
      const status = statusMap[event.status] || 'live';

      const homeStats = liveStats?.home || {};
      const awayStats = liveStats?.away || {};

      const homePoss = homeStats.ball_possession ?? 50;
      const awayPoss = awayStats.ball_possession ?? 50;

      return {
        id: String(event.id),
        fixtureId: event.api_id || event.id,
        league: pickFirstString(league.name, event.competition_name, event.league_name) || 'Unknown',
        leagueLogo: league.api_id ? `${IMG_BASE}/league/${league.api_id}/?token=${API_KEY}` : undefined,
        leagueCountry: pickFirstString(league.country, event.country_name) || '',
        homeTeam: pickFirstString(event.home_team, homeTeamObj?.name, event.home_team_name) || 'Home',
        awayTeam: pickFirstString(event.away_team, awayTeamObj?.name, event.away_team_name) || 'Away',
        homeLogo,
        awayLogo,
        homeScore: asNumber(event.home_score),
        awayScore: asNumber(event.away_score),
        minute,
        status,
        stats: {
          matchId: String(event.id),
          minute,
          homeShots: asNumber(homeStats.total_shots),
          awayShots: asNumber(awayStats.total_shots),
          homeShotsOnTarget: asNumber(homeStats.shots_on_target),
          awayShotsOnTarget: asNumber(awayStats.shots_on_target),
          homeCorners: asNumber(homeStats.corner_kicks),
          awayCorners: asNumber(awayStats.corner_kicks),
          homeDangerousAttacks: asNumber(homeStats.dangerous_attacks, asNumber(homeStats.total_shots) * 8),
          awayDangerousAttacks: asNumber(awayStats.dangerous_attacks, asNumber(awayStats.total_shots) * 8),
          homePossession: homePoss,
          awayPossession: awayPoss,
          homeRedCards: asNumber(homeStats.red_cards),
          awayRedCards: asNumber(awayStats.red_cards),
          homeYellowCards: asNumber(homeStats.yellow_cards),
          awayYellowCards: asNumber(awayStats.yellow_cards),
          homeXg: asNumber(homeStats.expected_goals),
          awayXg: asNumber(awayStats.expected_goals),
          momentumHome: homePoss,
          momentumAway: awayPoss,
          homeScore: asNumber(event.home_score),
          awayScore: asNumber(event.away_score),
          isLive: status === 'live',
        },
      };
    });

    return new Response(JSON.stringify({ matches, count: matches.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error fetching live matches:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
