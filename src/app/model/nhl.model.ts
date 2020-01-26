export interface ITeam {
    city: string;
    name: string;
    abbrev: string;
    lightcolor: string;
    darkcolor: string;
    chartcolor: string;
    division: string;
    of: number;
    de: number;
    pp: number;
    pk: number;
    go: number;
    co: number;
    total?: number;
    wins?: number;
    losses?: number;
    otl?: number;
    points?: number;
    gf?: number;
    ga?: number;
    homewins?: number;
    homelosses?: number;
    visitwins?: number;
    visitlosses?: number;
    divwins?: number;
    divlosses?: number;
    confwins?: number;
    conflosses?: number;
    othwins?: number;
    othlosses?: number;
}

export interface NHLCalendar {
  month: number;
  year: number;
}

export interface IScheduleBase {
  gameday: string;
  games: number[];
}

export interface ISchedule {
  id: number;
  gameday: string;
  visitTeam: number;
  visitScore: number;
  visitRecord?: string;
  homeTeam: number;
  homeScore: number;
  homeRecord?: string;
  period: string;
  spread?: number;
  overtime?: boolean;
  gameResults: IGameResults[];
}

export interface IGameResults {
  teamScored: number;
  period: string;
  goals: number;
}

export interface IPlayoffSeries {
  id: number;
  gameday: string;
  visitTeam: number;
  visitWins: number;
  visitRecord?: string;
  homeTeam: number;
  homeWins: number;
  homeRecord?: string;
  games: number[];
}
