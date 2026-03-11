// GoalPulse AI — Prediction Engine
// Rule-based scoring system with 12 factors

export interface MatchStats {
  matchId: string;
  minute: number;
  homeShots: number;
  awayShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
  homeCorners: number;
  awayCorners: number;
  homeDangerousAttacks: number;
  awayDangerousAttacks: number;
  homePossession: number;
  awayPossession: number;
  homeRedCards: number;
  awayRedCards: number;
  homeYellowCards: number;
  awayYellowCards: number;
  homeXg: number;
  awayXg: number;
  momentumHome: number;
  momentumAway: number;
  homeScore: number;
  awayScore: number;
  isLive: boolean;
}

export interface PredictionResult {
  matchId: string;
  probabilityScore: number;
  rawScore: number;
  activeSignals: string[];
  confidence: 'low' | 'medium' | 'high' | 'very_high';
  triggerStatus: boolean;
  reasonSummary: string;
  factorBreakdown: Record<string, number>;
  goalWindow: string;
}

// Factor calculation functions
function minuteFactor(minute: number): number {
  // Higher weight in second half, peaks 60-80
  if (minute < 25) return 2;
  if (minute < 45) return 5;
  if (minute < 60) return 8;
  if (minute < 75) return 12;
  if (minute < 85) return 14;
  return 10; // drops slightly in injury time
}

function shotsFactor(stats: MatchStats): number {
  const totalShots = stats.homeShots + stats.awayShots;
  const perMinute = totalShots / Math.max(stats.minute, 1);
  // High shot rate = attacking game
  if (perMinute > 0.4) return 10;
  if (perMinute > 0.3) return 7;
  if (perMinute > 0.2) return 4;
  return 2;
}

function shotsOnTargetFactor(stats: MatchStats): number {
  const totalSOT = stats.homeShotsOnTarget + stats.awayShotsOnTarget;
  const perMinute = totalSOT / Math.max(stats.minute, 1);
  if (perMinute > 0.2) return 14;
  if (perMinute > 0.12) return 10;
  if (perMinute > 0.08) return 6;
  return 2;
}

function dangerousAttacksFactor(stats: MatchStats): number {
  const total = stats.homeDangerousAttacks + stats.awayDangerousAttacks;
  const perMinute = total / Math.max(stats.minute, 1);
  if (perMinute > 2.0) return 12;
  if (perMinute > 1.5) return 8;
  if (perMinute > 1.0) return 5;
  return 2;
}

function cornersFactor(stats: MatchStats): number {
  const total = stats.homeCorners + stats.awayCorners;
  const perMinute = total / Math.max(stats.minute, 1);
  if (perMinute > 0.2) return 8;
  if (perMinute > 0.12) return 5;
  return 2;
}

function possessionTrendFactor(stats: MatchStats): number {
  // Imbalanced possession suggests attacking pressure
  const diff = Math.abs(stats.homePossession - stats.awayPossession);
  if (diff > 25) return 6;
  if (diff > 15) return 4;
  return 2;
}

function gameStateFactor(stats: MatchStats): number {
  const scoreDiff = Math.abs(stats.homeScore - stats.awayScore);
  // Tied games or 1-goal difference = more likely to see goals
  if (scoreDiff === 0 && stats.minute > 60) return 10;
  if (scoreDiff === 0) return 6;
  if (scoreDiff === 1 && stats.minute > 70) return 12; // trailing team pushes
  if (scoreDiff === 1) return 5;
  return 2;
}

function redCardFactor(stats: MatchStats): number {
  const totalReds = stats.homeRedCards + stats.awayRedCards;
  if (totalReds > 0) return 8; // numerical advantage creates chances
  return 0;
}

function momentumFactor(stats: MatchStats): number {
  const maxMomentum = Math.max(stats.momentumHome, stats.momentumAway);
  if (maxMomentum > 75) return 10;
  if (maxMomentum > 60) return 6;
  return 2;
}

function xgFactor(stats: MatchStats): number {
  const totalXg = stats.homeXg + stats.awayXg;
  const xgPerMinute = totalXg / Math.max(stats.minute, 1);
  if (xgPerMinute > 0.04) return 12;
  if (xgPerMinute > 0.025) return 8;
  if (xgPerMinute > 0.015) return 4;
  return 1;
}

function oddsFactor(): number {
  // In demo mode, return moderate factor
  return 4;
}

function preMatchFactor(): number {
  // In demo mode, return moderate factor
  return 3;
}

function slowdownPenalty(stats: MatchStats): number {
  // If very few shots recently, penalize
  const totalShots = stats.homeShots + stats.awayShots;
  if (stats.minute > 30 && totalShots < 4) return 8;
  return 0;
}

function staleDataPenalty(stats: MatchStats): number {
  if (!stats.isLive) return 20;
  return 0;
}

// Signal detection
function detectSignals(stats: MatchStats): string[] {
  const signals: string[] = [];
  const totalSOT = stats.homeShotsOnTarget + stats.awayShotsOnTarget;
  const totalDA = stats.homeDangerousAttacks + stats.awayDangerousAttacks;
  const maxMomentum = Math.max(stats.momentumHome, stats.momentumAway);
  const totalXg = stats.homeXg + stats.awayXg;

  if (totalSOT / Math.max(stats.minute, 1) > 0.12) signals.push('shots_on_target_spike');
  if (totalDA / Math.max(stats.minute, 1) > 1.5) signals.push('dangerous_attacks_spike');
  if (maxMomentum > 70) signals.push('momentum_increase');
  if (totalXg / Math.max(stats.minute, 1) > 0.03) signals.push('xg_spike');
  if (stats.minute > 75 && (totalSOT > 8 || totalDA > 100)) signals.push('late_game_pressure');
  if (stats.homeRedCards > 0 || stats.awayRedCards > 0) signals.push('red_card_advantage');

  return signals;
}

function getConfidence(score: number): 'low' | 'medium' | 'high' | 'very_high' {
  if (score >= 75) return 'very_high';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function getGoalWindow(score: number): string {
  if (score >= 80) return 'Next 5 minutes';
  if (score >= 65) return 'Next 10 minutes';
  if (score >= 50) return 'Watchlist';
  return 'Low probability';
}

function generateReasonSummary(signals: string[], stats: MatchStats): string {
  const parts: string[] = [];
  if (signals.includes('shots_on_target_spike')) parts.push('high shots on target rate');
  if (signals.includes('dangerous_attacks_spike')) parts.push('rising dangerous attacks');
  if (signals.includes('momentum_increase')) parts.push('strong momentum shift');
  if (signals.includes('xg_spike')) parts.push('elevated xG');
  if (signals.includes('late_game_pressure')) parts.push('late-game attacking pressure');
  if (signals.includes('red_card_advantage')) parts.push('numerical advantage from red card');

  if (parts.length === 0) return 'No significant signals detected.';

  const prefix = stats.minute > 70
    ? 'Late in the match, '
    : stats.minute > 45
    ? 'In the second half, '
    : '';

  return `${prefix}${parts.join(' and ')} suggest strong attacking pressure.`;
}

// Main prediction function
export function calculatePrediction(stats: MatchStats): PredictionResult {
  const factors: Record<string, number> = {
    minute: minuteFactor(stats.minute),
    shots: shotsFactor(stats),
    shots_on_target: shotsOnTargetFactor(stats),
    dangerous_attacks: dangerousAttacksFactor(stats),
    corners: cornersFactor(stats),
    possession_trend: possessionTrendFactor(stats),
    game_state: gameStateFactor(stats),
    red_card: redCardFactor(stats),
    momentum: momentumFactor(stats),
    xg: xgFactor(stats),
    odds: oddsFactor(),
    pre_match: preMatchFactor(),
  };

  const rawScore = Object.values(factors).reduce((sum, v) => sum + v, 0)
    - slowdownPenalty(stats)
    - staleDataPenalty(stats);

  const probabilityScore = Math.max(0, Math.min(100, Math.round(rawScore * 0.78)));
  const activeSignals = detectSignals(stats);
  const confidence = getConfidence(probabilityScore);
  const goalWindow = getGoalWindow(probabilityScore);

  // Alert trigger rule
  const triggerStatus =
    stats.minute >= 25 &&
    stats.minute <= 88 &&
    probabilityScore >= 62 &&
    activeSignals.length >= 2 &&
    stats.isLive;

  const reasonSummary = generateReasonSummary(activeSignals, stats);

  return {
    matchId: stats.matchId,
    probabilityScore,
    rawScore,
    activeSignals,
    confidence,
    triggerStatus,
    reasonSummary,
    factorBreakdown: factors,
    goalWindow,
  };
}

// Batch process all matches
export function runPredictions(allStats: MatchStats[]): PredictionResult[] {
  return allStats.map(calculatePrediction);
}
