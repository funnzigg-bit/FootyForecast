// FootyForecast — Shared match types
import { MatchStats } from '@/services/predictionEngine';

export interface MatchData {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo?: string;
  awayLogo?: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  status: 'live' | 'finished' | 'halftime' | 'scheduled';
  stats: MatchStats;
}
