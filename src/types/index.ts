// src/types/index.ts

/**
 * Representerer en kamp, enten kommende eller spilt.
 * Matcher Fixture-entiteten fra backend.
 */
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

/**
 * Representerer detaljert lag-statistikk for én kamp.
 * Matcher MatchStatisticsDto fra backend.
 */
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

/**
 * NY TYPE: Representerer detaljert spillerstatistikk for én kamp.
 * Matcher PlayerMatchStatisticsDto fra backend.
 */
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


/**
 * Representerer et verdispill i oddsanalysen.
 * Matcher ValueBetDto fra backend.
 */
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

/**
 * Generisk grensesnitt for paginerte responser fra Spring Boot.
 */
export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // Nåværende side (0-indeksert)
}

export interface MatchOdds {
  bookmakerName: string;
  homeOdds: number;
  drawOdds: number;
  awayOdds: number;
}


export interface UpcomingFixtureWithOdds {
  fixtureId: number;
  date: string;
  homeTeamName: string;
  awayTeamName: string;
  leagueName: string;
  hasOdds: boolean;
  odds: MatchOdds[]; 
}