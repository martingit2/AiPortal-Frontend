// src/types/index.ts

export interface Fixture {
  id: number;
  date: string;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamName: string;
  awayTeamName: string;
  goalsHome: number | null;
  goalsAway: number | null;
  leagueId: number;
  season: number;
  status: string;
}

export interface MatchStat {
  teamName: string;
  shotsOnGoal: number;
  shotsOffGoal: number;
  totalShots: number;
  blockedShots: number;
  shotsInsideBox: number;
  shotsOutsideBox: number;
  fouls: number;
  cornerKicks: number;
  offsides: number;
  ballPossession: string;
  yellowCards: number;
  redCards: number;
  goalkeeperSaves: number;
  totalPasses: number;
  passesAccurate: number;
  passesPercentage: string;
}

export interface PlayerMatchStat {
  playerId: number;
  playerName: string;
  teamId: number;
  minutesPlayed: number;
  rating: string | null;
  captain: boolean;
  substitute: boolean;
  shotsTotal: number;
  shotsOnGoal: number;
  goalsTotal: number;
  assists: number;
  passesTotal: number;
  passesKey: number;
}

// NY: Detaljert struktur for et enkelt odds-valg
export interface OddDetail {
  name: string;
  odds: number;
  handicap?: string;
  points?: string;
}

// Oppdatert for å reflektere den nye DTO-en
export interface MatchOdds {
  bookmakerName: string;
  betName: string;
  odds: OddDetail[]; // Bruker den nye, detaljerte typen
}

// Oppdatert for å reflektere den nye DTO-en
export interface UpcomingFixtureWithOdds {
  fixtureId: number;
  date: string;
  homeTeamName: string;
  awayTeamName: string;
  leagueName: string;
  hasOdds: boolean;
  odds: MatchOdds[];
}

export interface ValueBet {
  fixtureId: number;
  homeTeamName: string;
  awayTeamName: string;
  fixtureDate: string;
  marketHomeOdds: number;
  marketDrawOdds: number;
  marketAwayOdds: number;
  bookmakerName: string;
  aracanixHomeOdds: number;
  aracanixDrawOdds: number;
  aracanixAwayOdds: number;
  valueHome: number;
  valueDraw: number;
  valueAway: number;
  marketDescription: string | null;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
}

export interface HeadToHeadStats {
  matchesPlayed: number;
  team1Wins: number;
  team2Wins: number;
  draws: number;
  avgTotalGoals: number;
}

export interface AnalysisModel {
  id: number;
  modelName: string;
  marketType: string;
  accuracy: number;
  logLoss: number;
  classificationReport: string;
  featureImportances: string; // JSON-streng
  trainingTimestamp: string;
}