// FootyForecast — Enhanced Prediction Engine Types

export interface TeamData {
  name: string;
  xG: number;
  xGA: number;
  shotsOnTarget: number;
  recentForm: number;
  homeAdvantage: number;
  headToHead: number;
  possessionEfficiency: number;
  conversionRate: number;
  defensiveErrors: number;
}

export interface CorrectScorePrediction {
  score: string;
  probability: number;
}

export interface MatchPrediction {
  id: string;
  fixtureId?: number | string;
  league: string;
  leagueCountry?: string;
  leagueLogo?: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo?: string;
  awayLogo?: string;
  matchDate: string;
  homeScore: number;
  awayScore: number;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  predictedResult: 'Home Win' | 'Draw' | 'Away Win';
  predictedScore: string;
  confidence: number;
  confidenceLevel: 'elite' | 'high' | 'medium' | 'low' | 'very_risky';
  over25Prob: number;
  over35Prob: number;
  bttsProb: number;
  bttsResult: 'Yes' | 'No';
  isUpset: boolean;
  upsetScore?: number;
  upsetConfidence?: number;
  riskLevel?: 'Low' | 'Medium' | 'High';
  isValue?: boolean;
  valueEdge?: number;
  topScores?: CorrectScorePrediction[];
  pickScore?: number;
  totalGoalsExpected?: number;
  recommendedMarket?: string;
  reasoning: string;
  homeTeamScore: number;
  awayTeamScore: number;
  minute?: number;
  status?: 'live' | 'scheduled' | 'finished' | 'halftime';
  isLive?: boolean;
}

export interface GoalsMarketPrediction {
  matchId: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  over25Prob: number;
  over35Prob: number;
  bttsProb: number;
  totalGoalsExpected: number;
  category: 'high_scoring' | 'low_scoring' | 'balanced';
}

// Confidence band helpers
export function getConfidenceLabel(level: string): string {
  switch (level) {
    case 'elite': return 'Elite';
    case 'high': return 'High';
    case 'medium': return 'Medium';
    case 'low': return 'Low';
    case 'very_risky': return 'Very Risky';
    default: return level;
  }
}

export function getConfidenceLevel(confidence: number): 'elite' | 'high' | 'medium' | 'low' | 'very_risky' {
  if (confidence >= 85) return 'elite';
  if (confidence >= 75) return 'high';
  if (confidence >= 60) return 'medium';
  if (confidence >= 45) return 'low';
  return 'very_risky';
}

export function calculateConfidence(homeWin: number, draw: number, awayWin: number): number {
  const probs = [homeWin, draw, awayWin].sort((a, b) => b - a);
  const gap = probs[0] - probs[1];
  const modelAgreement = probs[0] > 50 ? 1.2 : 0.9;
  return Math.round(Math.min(100, Math.max(30, gap * 1.8 * modelAgreement + 35)));
}

// Legacy compatibility
export function predictMatch(home: TeamData, away: TeamData) {
  const diff = (home.xG - away.xG) * 2;
  const homeWin = Math.round(Math.min(90, Math.max(10, 50 + diff * 20)));
  const awayWin = Math.round(Math.min(90, Math.max(10, 50 - diff * 20)));
  const draw = 100 - homeWin - awayWin;
  return { homeWin, draw, awayWin, over25: 50, over35: 25, btts: 50, predictedScore: '1-1', totalExpectedGoals: 2.5 };
}
