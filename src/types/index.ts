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
 * Representerer detaljert kampstatistikk for ett lag i en kamp.
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