import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { ISchedule, IScheduleBase, ITeam, IGameResults, IPlayoffSeries } from '@app/model/nhl.model';
import { TeamService } from '@app/service/team.service';
import { GameService } from '@app/service/game.service';
import { StorageService } from '@app/service/storage.service';
import { sortDivision, sortConference, sortNonConference } from '@app/common/sort';
import { PlayNHLGame } from '@app/shared/PlayNHLGame';

const SCHEDULE: IScheduleBase[] = [
  {'gameday': 'First Round', 'games': [3, 0, 11, 8, 7, 4, 15, 12, 2, 1, 10, 9, 6, 5, 14, 13]},
  {'gameday': 'Second Round', 'games': []}, // 8 teams/4 series
  {'gameday': 'Conference Championship', 'games': []}, // 4 teams/2 series
  {'gameday': 'Stanley Cup', 'games': []} // 2 teams/1 series
];

@Injectable()
export class PlayoffService {
  PLAYOFF_SCHEDULE: ISchedule[] = [];
  PLAYOFF_SERIES: IPlayoffSeries[] = [];
  GameDay: string[] = [];
  currentPlayoffGame: number = 0;
  currentPlayoffGameDay: string;
  EASTPlayoffTeams: number[] = [];
  WESTPlayoffTeams: number[] = [];
  PlayoffTeams: number[] = [];
  PlayoffBracket: number[] = new Array(30);
  StanleyCupChamp: number;
  playoffTabIndex: number = 0;

  // Observable sources
  private currentPlayoffGameSource = new BehaviorSubject<number>(0);
  private currentPlayoffGameDaySource = new BehaviorSubject<string>('');
  private GameDaySource = new BehaviorSubject<string[]>([]);
  private PlayoffBracketSource = new BehaviorSubject<number[]>(new Array(22));
  private StanleyCupChampSource = new BehaviorSubject<number>(null);

  // Observable streams
  currentPlayoffGame$ = this.currentPlayoffGameSource.asObservable();
  currentPlayoffGameDay$ = this.currentPlayoffGameDaySource.asObservable();
  GameDay$ = this.GameDaySource.asObservable();
  PlayoffBracket$ = this.PlayoffBracketSource.asObservable();
  StanleyCupChamp$ = this.StanleyCupChampSource.asObservable();

  constructor(
    private teamService: TeamService,
    private gameService: GameService,
    private storageService: StorageService
  ) { }

  // Service message commands
  setCurrentPlayoffGame(data: number) {
    // console.log('[playoff.service] setPlayoffcurrentPlayoffGame() data: ' + data);
    this.currentPlayoffGameSource.next(data);
  }
  setCurrentPlayoffGameDay(data: string) {
    // console.log('[playoff.service] setPlayoffcurrentPlayoffGameDay() data: ' + data);
    this.currentPlayoffGameDaySource.next(data);
  }
  setGameDay(data: string[]) {
    // console.log('[playoff.service] setGameDay() data: ' + data);
    this.GameDaySource.next(data);
  }
  setPlayoffBracket(data: number[]) {
    // console.log('[playoff.service] setGameDay() data: ' + data);
    this.PlayoffBracketSource.next(data);
  }
  setStanleyCupChamp(data: number) {
    // console.log('[playoff.service] setStanleyCupChamp() data: ' + data);
    this.StanleyCupChampSource.next(data);
  }

  getPlayoffTabIndex() {
    return this.playoffTabIndex;
  }

  setPlayoffTabIndex(idx: number) {
    this.playoffTabIndex = idx;
  }

  loadPlayoffScheduleFromStorage() {
    this.currentPlayoffGame = 0;
    this.PLAYOFF_SERIES = this.storageService.loadPlayoffSeriesFromLocalStorage() || [];
    this.PLAYOFF_SCHEDULE = this.storageService.loadPlayoffScheduleFromLocalStorage() || [];
    this.PLAYOFF_SCHEDULE.forEach(game => {
      if (game.period !== 'F' && game.period !== null) {
        this.resetIncompleteGame(game);
      }
      if (game.visitScore !== null) {
        this.currentPlayoffGame++;
      }
    });
    this.setCurrentPlayoffGame(this.currentPlayoffGame);
  }

  resetIncompleteGame(game: ISchedule) {
    game.visitScore = null;
    game.visitRecord = null;
    game.homeScore = null,
    game.homeRecord = null;
    game.period = null;
    game.spread = null;
    game.overtime = null;
    game.gameResults = [];
  }

  addtoSeries(playoffDay: string) {
    // console.log('[playoff.service] addtoSeries() playoffDay: ' + playoffDay);
    const isFirstRound = playoffDay === 'First Round';
    const round = SCHEDULE.find(_ => _.gameday === playoffDay);
    if (round) {
      let seriesCounter = this.PLAYOFF_SERIES.length;
      for (let i = 0; i < round.games.length; i++) {
        const vTeamIdx = isFirstRound ? this.PlayoffTeams[round.games[i]] : round.games[i];
        const vTeam = this.teamService.getTeamByIndex(vTeamIdx);
        const hTeamIdx = isFirstRound ? this.PlayoffTeams[round.games[i + 1]] : round.games[i + 1];
        const hTeam = this.teamService.getTeamByIndex(hTeamIdx);
        const nextPlayoffGame: IPlayoffSeries = {
          id: seriesCounter++,
          gameday: round.gameday,
          visitTeam: vTeamIdx,
          visitWins: 0,
          visitRecord: vTeam.wins + '-' + vTeam.losses + '-' + vTeam.otl,
          homeTeam: hTeamIdx,
          homeWins: 0,
          homeRecord: hTeam.wins + '-' + hTeam.losses + '-' + hTeam.otl,
          games: []
        };
        if (nextPlayoffGame.gameday === playoffDay) {
          // console.log('[playoff.service] addtoSeries() Pushing game to PLAYOFF_SERIES');
          this.PLAYOFF_SERIES.push(nextPlayoffGame);
        }
        i++;
      }
      this.PLAYOFF_SERIES.forEach(series => {
        if (series.visitWins === 0 && series.homeWins === 0) {
          const playoffGame = this.addToSchedule(series);
          series.games.push(playoffGame);
        }
      });
    }
  }

  addToSchedule(series: IPlayoffSeries): number {
    // console.log('[playoff.service] addToSchedule() ' + series.gameday + ', ' + series.visitTeam + ' at ' + series.homeTeam);
    const seriesGameNo = series.homeWins + series.visitWins;
    // console.log('[playoff.service] addToSchedule() seriesGameNo: ' + seriesGameNo);
    const vTeam = [2, 3, 5].includes(seriesGameNo) ? series.homeTeam : series.visitTeam;
    const hTeam = [2, 3, 5].includes(seriesGameNo) ? series.visitTeam : series.homeTeam;
    const playoffGame = this.PLAYOFF_SCHEDULE.length;
    const nextPlayoffGame: ISchedule = {
      id: playoffGame,
      gameday: series.gameday,
      visitTeam: vTeam,
      visitScore: null,
      homeTeam: hTeam,
      homeScore: null,
      period: null,
      gameResults: []
    };
    this.PLAYOFF_SCHEDULE.push(nextPlayoffGame);
    return(playoffGame);
  }

  buildPlayoffSchedule(playoffDay: string) {
    console.log('[playoff.service] buildPlayoffSchedule() playoffDay: ' + playoffDay);
    this.loadPlayoffScheduleFromStorage();

    if (this.PLAYOFF_SCHEDULE.length < 1) {
      // console.log('[playoff.service] building');
      this.addtoSeries(playoffDay);

      console.log('[playoff.service] Playoff schedule built!');
      // console.table(this.PLAYOFF_SCHEDULE);
      this.storageService.storePlayoffSeriesToLocalStorage(this.PLAYOFF_SERIES);
      this.storageService.storePlayoffScheduleToLocalStorage(this.PLAYOFF_SCHEDULE);
    }

    if (this.currentPlayoffGame < this.PLAYOFF_SCHEDULE.length) {
      this.currentPlayoffGameDay = this.PLAYOFF_SCHEDULE[this.currentPlayoffGame].gameday;
      this.setCurrentPlayoffGameDay(this.currentPlayoffGameDay);
      // console.log('[playoff.service] buildPlayoffSchedule() 1 currentPlayoffGameDay: ' + this.currentPlayoffGameDay);
    } else {
      this.currentPlayoffGameDay = this.PLAYOFF_SCHEDULE[this.currentPlayoffGame - 1].gameday;
      this.setCurrentPlayoffGameDay(this.currentPlayoffGameDay);
      // console.log('[playoff.service] buildPlayoffSchedule() 2 currentPlayoffGameDay: ' + this.currentPlayoffGameDay);
      this.checkNextPlayoffRound();
    }
    this.updatePlayoffBracket();
  }

  checkNextPlayoffRound() {
    // console.log('[playoff.service] checkNextPlayoffRound() check for more rounds or season over');
    this.currentPlayoffGameDay = this.PLAYOFF_SCHEDULE[this.currentPlayoffGame - 1].gameday;
    let index = this.GameDay.findIndex(day => day === this.currentPlayoffGameDay);

    const swap = (obj, a, b) => {
      // console.log('SWAP: a=' + a + ', b=' + b);
      const temp = obj[a]; obj[a] = obj[b]; obj[b] = temp;
      return obj;
    };

    // Adjust results BEFORE adding to series
    if (index === 0) {
      const nextRound = index + 1;
      SCHEDULE[nextRound].games = [];
      // console.log('[playoff.service] checkNextPlayoffRound() Second Round, checking First Round results, creating matchups');
      // Add the next games to SCHEDULE[nextRound]
      // Find series winners and push to SCHEDULE[nextRound].games
      this.PLAYOFF_SERIES.forEach(series => {
        if (series.gameday === this.currentPlayoffGameDay) {
          const winner = series.homeWins === 4 ? series.homeTeam : series.visitTeam;
          // console.log('Adding winner: (' + winner + ')' + this.teamService.getTeamByIndex(winner).name);
          SCHEDULE[nextRound].games.push(winner);
        }
      });
      // Move division teams to adjacent spots
      swap(SCHEDULE[nextRound].games, 1, 4);
      swap(SCHEDULE[nextRound].games, 4, 2);
      swap(SCHEDULE[nextRound].games, 3, 5);
      swap(SCHEDULE[nextRound].games, 5, 6);

      // Sort to have the correct home/visit
      if (sortConference(this.teamService.getTeamByIndex(SCHEDULE[nextRound].games[0]),
        this.teamService.getTeamByIndex(SCHEDULE[nextRound].games[1])) === -1) {
        // console.log('Swapping East Metro');
        swap(SCHEDULE[nextRound].games, 0, 1);
      }
      if (sortConference(this.teamService.getTeamByIndex(SCHEDULE[nextRound].games[2]),
        this.teamService.getTeamByIndex(SCHEDULE[nextRound].games[3])) === -1) {
        // console.log('Swapping West Central');
        swap(SCHEDULE[nextRound].games, 2, 3);
      }
      if (sortConference(this.teamService.getTeamByIndex(SCHEDULE[nextRound].games[4]),
        this.teamService.getTeamByIndex(SCHEDULE[nextRound].games[5])) === -1) {
        // console.log('Swapping East Atlantic');
        swap(SCHEDULE[nextRound].games, 4, 5);
      }
      if (sortConference(this.teamService.getTeamByIndex(SCHEDULE[nextRound].games[6]),
        this.teamService.getTeamByIndex(SCHEDULE[nextRound].games[7])) === -1) {
        // console.log('Swapping West Pacific');
        swap(SCHEDULE[nextRound].games, 6, 7);
      }
    }
    if (index === 1) {
      const nextRound = index + 1;
      SCHEDULE[nextRound].games = [];
      // console.log('[playoff.service] checkNextPlayoffRound() Conference Round, checking Second Round results, creating matchups');
      // Add the next games to SCHEDULE[nextRound]
      // Find series winners and push to SCHEDULE[nextRound].games
      this.PLAYOFF_SERIES.forEach(series => {
        if (series.gameday === this.currentPlayoffGameDay) {
          const winner = series.homeWins === 4 ? series.homeTeam : series.visitTeam;
          // console.log('Adding winner: (' + winner + ')' + this.teamService.getTeamByIndex(winner).name);
          SCHEDULE[nextRound].games.push(winner);
        }
      });
      // Move division teams to adjacent spots
      swap(SCHEDULE[nextRound].games, 1, 2);

      // Sort to have the correct home/visit
      if (sortConference(this.teamService.getTeamByIndex(SCHEDULE[nextRound].games[0]),
        this.teamService.getTeamByIndex(SCHEDULE[nextRound].games[1])) === -1) {
        // console.log('Swapping East Conference');
        swap(SCHEDULE[nextRound].games, 0, 1);
      }
      if (sortConference(this.teamService.getTeamByIndex(SCHEDULE[nextRound].games[2]),
        this.teamService.getTeamByIndex(SCHEDULE[nextRound].games[3])) === -1) {
        // console.log('Swapping West Conference');
        swap(SCHEDULE[nextRound].games, 2, 3);
      }
    }
    if (index === 2) {
      const nextRound = index + 1;
      SCHEDULE[nextRound].games = [];
      // console.log('[playoff.service] checkNextPlayoffRound() Stanley Cup, check Conference Round results, creating matchups');
      // Add the next games to SCHEDULE[nextRound]
      // Find series winners and push to SCHEDULE[nextRound].games
      this.PLAYOFF_SERIES.forEach(series => {
        if (series.gameday === this.currentPlayoffGameDay) {
          const winner = series.homeWins === 4 ? series.homeTeam : series.visitTeam;
          // console.log('Adding winner: (' + winner + ')' + this.teamService.getTeamByIndex(winner).name);
          SCHEDULE[nextRound].games.push(winner);
        }
      });

      // Sort to have the correct home/visit
      if (sortConference(this.teamService.getTeamByIndex(SCHEDULE[nextRound].games[0]),
        this.teamService.getTeamByIndex(SCHEDULE[nextRound].games[1])) === -1) {
        // console.log('Swapping Stanley Cup');
        swap(SCHEDULE[nextRound].games, 0, 1);
      }
    }

    this.addtoSeries(this.GameDay[++index]);
    // console.log('[playoff.service] checkNextPlayoffRound() addToSeries Complete!');
    if (this.currentPlayoffGame < this.PLAYOFF_SCHEDULE.length) {
      this.currentPlayoffGameDay = this.PLAYOFF_SCHEDULE[this.currentPlayoffGame].gameday;
      this.setCurrentPlayoffGameDay(this.currentPlayoffGameDay);
      // console.log('[playoff.service] checkNextPlayoffRound() currentPlayoffGameDay: ' + this.currentPlayoffGameDay);
    }

    // console.log('[playoff.service] checkNextPlayoffRound() PLAYOFF_SCHEDULE:');
    // console.log(this.PLAYOFF_SCHEDULE);
    this.storageService.storePlayoffSeriesToLocalStorage(this.PLAYOFF_SERIES);
    this.storageService.storePlayoffScheduleToLocalStorage(this.PLAYOFF_SCHEDULE);
  }

  getSeriesById(id: number): IPlayoffSeries {
    return this.PLAYOFF_SERIES.find(series => series.id === id);
  }

  getSeriesForDay(searchTerm: string): IPlayoffSeries[] {
    // console.log('[playoff.service] getSeriesForDay() searchTerm: ' + searchTerm);
    return this.PLAYOFF_SERIES.filter(day => day.gameday === searchTerm);
  }

  getGamesForDay(searchTerm: string): ISchedule[] {
    // console.log('[playoff.service] getGamesForDay() searchTerm: ' + searchTerm);
    return this.PLAYOFF_SCHEDULE.filter(day => day.gameday === searchTerm);
  }

  getGamesForTeam(team: number, postseason: boolean): Observable<ISchedule[]> {
    // console.log('[playoff.service] getGamesForTeam() team: ' + team);
    const subject = new Subject<ISchedule[]>();

    if ((this.PLAYOFF_SCHEDULE.length < 1) && (postseason)) {
      this.initPlayoffs();
    }

    setTimeout(() => {
      subject.next(this.PLAYOFF_SCHEDULE.filter(game => ((game.visitTeam === team) || (game.homeTeam === team)))); subject.complete();
    }, 0);
    return subject;
  }

  getGameById(id: number): ISchedule {
    return this.PLAYOFF_SCHEDULE.find(game => game.id === id);
  }

  getGameResults(id: number): Observable<IGameResults[]> {
    const subject = new Subject<IGameResults[]>();

    setTimeout(() => {subject.next(this.PLAYOFF_SCHEDULE.find(game => (game.id === id)).gameResults); subject.complete(); }, 0);
    return subject;
  }

  getSeriesIdxForPlayoffGame(playoffGame: number): number {
    return this.PLAYOFF_SERIES.findIndex(series => {
      const seriesIdx = series.games.findIndex(game => game === playoffGame);
      return seriesIdx >= 0 ? true : false;
    });
  }

  getSeriesGameIdxForPlayoffGame(playoffGame: number): number {
    let gameNo = 0;
    this.PLAYOFF_SERIES.find(_ => {
      gameNo = _.games.findIndex(game => game === playoffGame);
      return gameNo >= 0 ? true : false;
    });
    return ++gameNo;
  }

  updatePlayoffBracket() {
    // console.log('[playoff.service] updatePlayoffBracket()');
    this.PLAYOFF_SERIES.forEach(series => {
      if (series.id === 0 && this.PlayoffTeams.length > 0) {
        // console.log('[playoff.service] updatePlayoffBracket() Initializing Bracket');
        this.PlayoffBracket = [];
        this.PlayoffBracket[0] = this.PLAYOFF_SERIES[0].visitTeam;
        this.PlayoffBracket[1] = this.PLAYOFF_SERIES[0].homeTeam;
        this.PlayoffBracket[2] = this.PLAYOFF_SERIES[1].visitTeam;
        this.PlayoffBracket[3] = this.PLAYOFF_SERIES[1].homeTeam;
        this.PlayoffBracket[4] = this.PLAYOFF_SERIES[2].visitTeam;
        this.PlayoffBracket[5] = this.PLAYOFF_SERIES[2].homeTeam;
        this.PlayoffBracket[6] = this.PLAYOFF_SERIES[3].visitTeam;
        this.PlayoffBracket[7] = this.PLAYOFF_SERIES[3].homeTeam;
        this.PlayoffBracket[8] = this.PLAYOFF_SERIES[4].visitTeam;
        this.PlayoffBracket[9] = this.PLAYOFF_SERIES[4].homeTeam;
        this.PlayoffBracket[10] = this.PLAYOFF_SERIES[5].visitTeam;
        this.PlayoffBracket[11] = this.PLAYOFF_SERIES[5].homeTeam;
        this.PlayoffBracket[12] = this.PLAYOFF_SERIES[6].visitTeam;
        this.PlayoffBracket[13] = this.PLAYOFF_SERIES[6].homeTeam;
        this.PlayoffBracket[14] = this.PLAYOFF_SERIES[7].visitTeam;
        this.PlayoffBracket[15] = this.PLAYOFF_SERIES[7].homeTeam;
      }

      if (series.visitWins === 4 || series.homeWins === 4) {
        if (series.id === 0) {
          if (series.homeWins > series.visitWins) {
            this.PlayoffBracket[16] = series.homeTeam;
          } else {
            this.PlayoffBracket[16] = series.visitTeam;
          }
        }
        if (series.id === 1) {
          if (series.homeWins > series.visitWins) {
            this.PlayoffBracket[18] = series.homeTeam;
          } else {
            this.PlayoffBracket[18] = series.visitTeam;
          }
        }
        if (series.id === 2) {
          if (series.homeWins > series.visitWins) {
            this.PlayoffBracket[20] = series.homeTeam;
          } else {
            this.PlayoffBracket[20] = series.visitTeam;
          }
        }
        if (series.id === 3) {
          if (series.homeWins > series.visitWins) {
            this.PlayoffBracket[22] = series.homeTeam;
          } else {
            this.PlayoffBracket[22] = series.visitTeam;
          }
        }
        if (series.id === 4) {
          if (series.homeWins > series.visitWins) {
            this.PlayoffBracket[17] = series.homeTeam;
          } else {
            this.PlayoffBracket[17] = series.visitTeam;
          }
        }
        if (series.id === 5) {
          if (series.homeWins > series.visitWins) {
            this.PlayoffBracket[19] = series.homeTeam;
          } else {
            this.PlayoffBracket[19] = series.visitTeam;
          }
        }
        if (series.id === 6) {
          if (series.homeWins > series.visitWins) {
            this.PlayoffBracket[21] = series.homeTeam;
          } else {
            this.PlayoffBracket[21] = series.visitTeam;
          }
        }
        if (series.id === 7) {
          if (series.homeWins > series.visitWins) {
            this.PlayoffBracket[23] = series.homeTeam;
          } else {
            this.PlayoffBracket[23] = series.visitTeam;
          }
        }
        if (series.id === 8) {
          if (series.homeWins > series.visitWins) {
            this.PlayoffBracket[24] = series.homeTeam;
          } else {
            this.PlayoffBracket[24] = series.visitTeam;
          }
        }
        if (series.id === 9) {
          if (series.homeWins > series.visitWins) {
            this.PlayoffBracket[25] = series.homeTeam;
          } else {
            this.PlayoffBracket[25] = series.visitTeam;
          }
        }
        if (series.id === 10) {
          if (series.homeWins > series.visitWins) {
            this.PlayoffBracket[26] = series.homeTeam;
          } else {
            this.PlayoffBracket[26] = series.visitTeam;
          }
        }
        if (series.id === 11) {
          if (series.homeWins > series.visitWins) {
            this.PlayoffBracket[27] = series.homeTeam;
          } else {
            this.PlayoffBracket[27] = series.visitTeam;
          }
        }
        if (series.id === 12) {
          if (series.homeWins > series.visitWins) {
            this.PlayoffBracket[28] = series.homeTeam;
          } else {
            this.PlayoffBracket[28] = series.visitTeam;
          }
        }
        if (series.id === 13) {
          if (series.homeWins > series.visitWins) {
            this.PlayoffBracket[29] = series.homeTeam;
          } else {
            this.PlayoffBracket[29] = series.visitTeam;
          }
        }
        if (series.id === 14) {
          if (series.homeWins > series.visitWins) {
            this.StanleyCupChamp = series.homeTeam;
          } else {
            this.StanleyCupChamp = series.visitTeam;
          }
          this.setStanleyCupChamp(this.StanleyCupChamp);
        }
      }
    });
    this.setPlayoffBracket(this.PlayoffBracket);
  }

  playGame(game: ISchedule, simFast: boolean) {
    const currentGame = this.currentPlayoffGame;
    const visitTeam = this.teamService.getTeamByIndex(game.visitTeam);
    const homeTeam = this.teamService.getTeamByIndex(game.homeTeam);
    console.log('[playoff.service] playGame() currentPlayoffGame: ' + currentGame
      + ', ' + visitTeam.city + ' at ' + homeTeam.city);

    PlayNHLGame.playNHLGame(game, visitTeam, homeTeam, simFast).subscribe((gameData: ISchedule) => {
      // console.log('[playoff.service] playGame() playing Game');
      this.gameService.setGameActive(true);
      game = gameData;
    }, (err) => {
      console.error('[playoff.service] playGame() playNHLGame error: ' + err);
    }, () => {
      // console.log('[playoff.service] playGame() playNHLGame over');
      this.gameService.setGameActive(false);
      const overtime = game.period === 'OT';
      game.overtime = overtime;
      game.period = 'F';

      const series: IPlayoffSeries = this.PLAYOFF_SERIES[this.getSeriesIdxForPlayoffGame(currentGame)];
      const seriesGameNo = series.homeWins + series.visitWins;
      if (game.visitScore > game.homeScore) {
        if ([2, 3, 5].includes(seriesGameNo)) {
          // console.log('[playoff.service] playGame() Favorite Wins');
          series.homeWins++;
        } else {
          // console.log('[playoff.service] playGame() Underdog Wins');
          series.visitWins++;
        }
      } else {
        if ([2, 3, 5].includes(seriesGameNo)) {
          // console.log('[playoff.service] playGame() Underdog Wins');
          series.visitWins++;
        } else {
          // console.log('[playoff.service] playGame() Favorite Wins');
          series.homeWins++;
        }
      }

      let seriesOver: boolean = false;
      if (series.visitWins === 4 || series.homeWins === 4) {
        // console.log('[playoff.service] playGame() Series is OVER!');
        this.updatePlayoffBracket();
        seriesOver = true;
      } else {
        // Series not over, add a game to the playoff schedule
        // console.log('[playoff.service] playGame() Series not over, add another game');
        const playoffGame = this.addToSchedule(series);
        series.games.push(playoffGame);
      }
      this.storageService.storePlayoffSeriesToLocalStorage(this.PLAYOFF_SERIES);
      this.storageService.storePlayoffScheduleToLocalStorage(this.PLAYOFF_SCHEDULE);

      if (seriesOver) {
        if (game.id === (this.PLAYOFF_SCHEDULE.length - 1)) {
          // console.log('[playoff.service] playGame() currentPlayoffGame: ' + this.currentPlayoffGame);
          console.log('[playoff.service] playGame() Last game, time to build the next round');
          this.checkNextPlayoffRound();
        }
      }
    });
  }

  playPlayoffGame(simFast: boolean): boolean {
    // console.log('[playoff.service] playPlayoffGame() curr:' + this.currentPlayoffGame + ' len:' + this.PLAYOFF_SCHEDULE.length);
    if (this.currentPlayoffGame < this.PLAYOFF_SCHEDULE.length) {
      this.setCurrentPlayoffGame(this.currentPlayoffGame);

      this.currentPlayoffGameDay = this.PLAYOFF_SCHEDULE[this.currentPlayoffGame].gameday;
      // console.log('[playoff.service] playPlayoffGame() currentPlayoffGameDay: ' + this.currentPlayoffGameDay);
      this.setCurrentPlayoffGameDay(this.currentPlayoffGameDay);

      this.playGame(this.PLAYOFF_SCHEDULE[this.currentPlayoffGame], simFast);
      this.currentPlayoffGame++;
      return true;
    } else {
      console.log('[playoff.service] playPlayoffGame() Season Over');
      return false;
    }
  }

  initPlayoffs() {
    if (this.PLAYOFF_SCHEDULE.length > 0) {
      // console.log('[playoff.service] initPlayoffs() Playoff schedule built');
    } else {
      // console.log('[playoff.service] initPlayoffs() Building playoff schedule');
      this.GameDay = SCHEDULE.map(s => s.gameday);
      this.setGameDay(this.GameDay);
      this.buildPlayoffSchedule(this.GameDay[0]);
    }
  }

  getPlayoffTeams(): Observable<number[]> {
    const subject = new Subject<number[]>();

    if (this.PlayoffTeams.length) {
      // console.log('[playoff.service] getPlayoffTeams() Have Playoff Teams');
      subject.next(this.PlayoffTeams);
      subject.complete();
    } else {
      // console.log('[playoff.service] getPlayoffTeams() Need to build Playoff Teams');
      this.getEASTPlayoffTeams();
      this.getWESTPlayoffTeams();
      setTimeout(() => {
        this.PlayoffTeams = this.EASTPlayoffTeams.concat(this.WESTPlayoffTeams);
        subject.next(this.PlayoffTeams);
        // console.log('[playoff.service] getPlayoffTeams() Built Playoff Teams!');
        this.updatePlayoffBracket();
        subject.complete();
      }, 0);
    }

    setTimeout(() => { subject.next(this.PlayoffTeams); }, 0);
    return subject;
  }

  getEASTPlayoffTeams() {
    if (this.EASTPlayoffTeams.length) {
      // console.log('[playoff.service] getEASTPlayoffTeams() EASTPlayoffTeams already BUILT');
    } else {
      // console.log('[playoff.service] getEASTPlayoffTeams() Need to build EASTPlayoffTeams');
      const divisions: string[] = [];
      let teamsArr: ITeam[] = [];
      let EASTMetro: ITeam [] = [];
      let EASTAtlantic: ITeam [] = [];
      let EASTOthers: ITeam [] = [];

      this.EASTPlayoffTeams = [];

      this.teamService.getTeams().subscribe((data: ITeam[]) => {
        teamsArr = data;
        // console.log('[playoffs.service-east] ngOnInit() getTeams() SUCCESS');

        teamsArr.forEach(team => {
          if (divisions.indexOf(team.division) < 0) {
            divisions.push(team.division);
          }
        });

        // Covid - Only intradivision
        divisions
          .filter(division => division.indexOf('East') > -1 )
          .forEach((division, i) => {
            const thisDiv: ITeam[] = teamsArr.filter(team => (team.division === division));
            thisDiv.sort(sortDivision);
            if (i === 0) {
              EASTMetro = thisDiv.slice(0, 4); // Covid EASTMetro = thisDiv.slice(0, 3);
              EASTOthers = thisDiv.slice(4); // Covid EASTOthers = thisDiv.slice(3);
            } else {
              EASTAtlantic = thisDiv.slice(0, 4); // Covid EASTAtlantic = thisDiv.slice(0, 3);
              EASTOthers = EASTOthers.concat(thisDiv.slice(4)); // Covid EASTOthers = EASTOthers.concat(thisDiv.slice(3));
            }
          });

        // Suspended for 2020-21 Season (56-game covid shortened)
        // EASTOthers.sort(sortConference);

        // if (sortDivision(EASTMetro[0], EASTAtlantic[0]) === 1) {
        //   // Atlantic is better, they get the #2 WC
        //   EASTMetro.push(EASTOthers[0]);
        //   EASTAtlantic.push(EASTOthers[1]);
        // } else {
        //   // Metro is better, they get the #2 WC
        //   EASTMetro.push(EASTOthers[1]);
        //   EASTAtlantic.push(EASTOthers[0]);
        // }

        this.EASTPlayoffTeams.push(this.teamService.getTeamIndex(EASTMetro[0].abbrev));
        this.EASTPlayoffTeams.push(this.teamService.getTeamIndex(EASTMetro[1].abbrev));
        this.EASTPlayoffTeams.push(this.teamService.getTeamIndex(EASTMetro[2].abbrev));
        this.EASTPlayoffTeams.push(this.teamService.getTeamIndex(EASTMetro[3].abbrev));
        this.EASTPlayoffTeams.push(this.teamService.getTeamIndex(EASTAtlantic[0].abbrev));
        this.EASTPlayoffTeams.push(this.teamService.getTeamIndex(EASTAtlantic[1].abbrev));
        this.EASTPlayoffTeams.push(this.teamService.getTeamIndex(EASTAtlantic[2].abbrev));
        this.EASTPlayoffTeams.push(this.teamService.getTeamIndex(EASTAtlantic[3].abbrev));
        // console.table(this.EASTPlayoffTeams);
      });
    }
  }

  getWESTPlayoffTeams() {
    if (this.WESTPlayoffTeams.length) {
      // console.log('[playoff.service] getWESTPlayoffTeams() WESTPlayoffTeams already BUILT');
    } else {
      // console.log('[playoff.service] getWESTPlayoffTeams() Need to build WESTPlayoffTeams');
      const divisions: string[] = [];
      let teamsArr: ITeam[] = [];
      let WESTCentral: ITeam [] = [];
      let WESTPacific: ITeam [] = [];
      let WESTOthers: ITeam [] = [];

      this.WESTPlayoffTeams = [];

      this.teamService.getTeams().subscribe((data: ITeam[]) => {
        teamsArr = data;
        // console.log('[playoffs.service-west] ngOnInit() getTeams() SUCCESS');

        teamsArr.forEach(team => {
          if (divisions.indexOf(team.division) < 0) {
            divisions.push(team.division);
          }
        });

        // Covid - Only intradivision
        divisions
          .filter(division => division.indexOf('West') > -1 )
          .forEach((division, i) => {
            const thisDiv: ITeam[] = teamsArr.filter(team => (team.division === division));
            thisDiv.sort(sortDivision);
            if (i === 0) {
              WESTCentral = thisDiv.slice(0, 4); // Covid WESTCentral = thisDiv.slice(0, 3);
              WESTOthers = thisDiv.slice(4); // Covid WESTOthers = thisDiv.slice(3);
            } else {
              WESTPacific = thisDiv.slice(0, 4); // Covid WESTPacific = thisDiv.slice(0, 3);
              WESTOthers = WESTOthers.concat(thisDiv.slice(4)); // Covid WESTOthers = WESTOthers.concat(thisDiv.slice(3));
            }
          });

        // Suspended for 2020-21 Season (56-game covid shortened)
        // WESTOthers.sort(sortConference);

        // if (sortDivision(WESTCentral[0], WESTPacific[0]) === 1) {
        //   // Pacific is better, they get the #2 WC
        //   WESTCentral.push(WESTOthers[0]);
        //   WESTPacific.push(WESTOthers[1]);
        // } else {
        //   // Central is better, they get the #2 WC
        //   WESTCentral.push(WESTOthers[1]);
        //   WESTPacific.push(WESTOthers[0]);
        // }

        this.WESTPlayoffTeams.push(this.teamService.getTeamIndex(WESTCentral[0].abbrev));
        this.WESTPlayoffTeams.push(this.teamService.getTeamIndex(WESTCentral[1].abbrev));
        this.WESTPlayoffTeams.push(this.teamService.getTeamIndex(WESTCentral[2].abbrev));
        this.WESTPlayoffTeams.push(this.teamService.getTeamIndex(WESTCentral[3].abbrev));
        this.WESTPlayoffTeams.push(this.teamService.getTeamIndex(WESTPacific[0].abbrev));
        this.WESTPlayoffTeams.push(this.teamService.getTeamIndex(WESTPacific[1].abbrev));
        this.WESTPlayoffTeams.push(this.teamService.getTeamIndex(WESTPacific[2].abbrev));
        this.WESTPlayoffTeams.push(this.teamService.getTeamIndex(WESTPacific[3].abbrev));
        // console.table(this.WESTPlayoffTeams);
      });
    }
  }

  resetPlayoffs() {
    console.log('[playoff.service] resetPlayoffs() Playoffs RESET!');
    this.storageService.clearPlayoffsFromStorage().subscribe(() => {
      // Do nothing here; wait for complete
    }, (err) => {
      console.error('[playoff.service] resetPlayoffs() clearPlayoffsFromStorage() error: ' + err);
    }, () => {
      console.log('[playoff.service] resetPlayoffs() clearPlayoffsFromStorage() complete');
      this.PLAYOFF_SERIES = [];
      this.PLAYOFF_SCHEDULE = [];
      this.currentPlayoffGame = 0;
      this.currentPlayoffGameDay = '';
      this.EASTPlayoffTeams = [];
      this.WESTPlayoffTeams = [];
      this.PlayoffTeams = [];
      this.StanleyCupChamp = null;
      this.setCurrentPlayoffGame(this.currentPlayoffGame);
      this.setCurrentPlayoffGameDay(this.currentPlayoffGameDay);
      this.setStanleyCupChamp(this.StanleyCupChamp);
    });
  }
}
