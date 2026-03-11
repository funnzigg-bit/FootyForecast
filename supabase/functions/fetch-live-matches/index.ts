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

function normalizeIncidentType(value: unknown): 'goal' | 'card' | 'substitution' | 'var' | 'penalty' | 'other' {
  const raw = pickFirstString(value)?.toLowerCase() || '';
  if (raw.includes('goal')) return 'goal';
  if (raw.includes('card')) return 'card';
  if (raw.includes('sub')) return 'substitution';
  if (raw.includes('var')) return 'var';
  if (raw.includes('pen')) return 'penalty';
  return 'other';
}

function normalizeCardType(value: unknown): 'yellow' | 'red' | undefined {
  const raw = pickFirstString(value)?.toLowerCase() || '';
  if (raw.includes('red')) return 'red';
  if (raw.includes('yellow')) return 'yellow';
  return undefined;
}

function normalizeIncidents(event: Record<string, unknown>, homeTeam: string, awayTeam: string) {
  const incidentSources = [
    event.incidents,
    event.events,
    event.timeline,
    event.match_events,
  ];

  const rawIncidents = incidentSources.find((source) => Array.isArray(source));
  if (!Array.isArray(rawIncidents)) return [];

  return rawIncidents
    .map((incident) => {
      if (!incident || typeof incident !== 'object') return null;
      const record = incident as Record<string, unknown>;
      const minute = asNumber(record.minute ?? record.match_time ?? record.elapsed ?? record.time, -1);
      if (minute < 0) return null;

      const teamName = pickFirstString(
        record.team_name,
        typeof record.team === 'object' && record.team ? (record.team as Record<string, unknown>).name as string : undefined,
        record.team,
      );
      const side = pickFirstString(record.team_side, record.side);
      const inferredIsHome =
        typeof record.is_home === 'boolean'
          ? record.is_home
          : side === 'home'
          ? true
          : side === 'away'
          ? false
          : teamName
          ? teamName === homeTeam
            ? true
            : teamName === awayTeam
            ? false
            : undefined
          : undefined;

      const type = normalizeIncidentType(record.type ?? record.event_type ?? record.kind ?? record.name);
      const cardType = normalizeCardType(record.card_type ?? record.card ?? record.detail);
      const playerName = pickFirstString(
        record.player_name,
        record.player,
        typeof record.player === 'object' && record.player ? (record.player as Record<string, unknown>).name as string : undefined,
        record.scorer_name,
      );
      const description = pickFirstString(record.description, record.text, record.detail);

      return {
        minute,
        type,
        cardType,
        playerName,
        isHome: inferredIsHome,
        teamName,
        description,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a!.minute - b!.minute));
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

    const matches = results.map((event: Record<string, unknown>) => {
      const league = (event.league as Record<string, unknown> | undefined) || {};
      const homeTeamObj = (event.home_team_obj as Record<string, unknown> | undefined) || {};
      const awayTeamObj = (event.away_team_obj as Record<string, unknown> | undefined) || {};
      const liveStats = (event.live_stats as Record<string, unknown> | undefined) || {};

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

      const homeStats = (liveStats.home as Record<string, unknown> | undefined) || {};
      const awayStats = (liveStats.away as Record<string, unknown> | undefined) || {};

      const homePoss = homeStats.ball_possession ?? 50;
      const awayPoss = awayStats.ball_possession ?? 50;
      const homeTeam = pickFirstString(event.home_team, homeTeamObj?.name, event.home_team_name) || 'Home';
      const awayTeam = pickFirstString(event.away_team, awayTeamObj?.name, event.away_team_name) || 'Away';
      const incidents = normalizeIncidents(event, homeTeam, awayTeam);

      return {
        id: String(event.id),
        fixtureId: event.api_id || event.id,
        league: pickFirstString(league.name, event.competition_name, event.league_name) || 'Unknown',
        leagueLogo: league.api_id ? `${IMG_BASE}/league/${league.api_id}/?token=${API_KEY}` : undefined,
        leagueCountry: pickFirstString(league.country, event.country_name) || '',
        homeTeam,
        awayTeam,
        homeLogo,
        awayLogo,
        homeScore: asNumber(event.home_score),
        awayScore: asNumber(event.away_score),
        minute,
        status,
        incidents,
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
