import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ISchedule, IScheduleBase, ITeam, IGameResults } from '../model/nhl.model';
import { TeamService } from '../service/team.service';
import { GameService } from '../service/game.service';
import { StorageService } from '../service/storage.service';
import { sortDivision, sortConference, sortNonConference } from '../common/sort';
import { PlayNHLGame } from '../shared/PlayNHLGame';

const SCHEDULE: IScheduleBase[] = [
  {'gameday': 'First Round', 'games': [3, 0, 11, 8, 7, 4, 15, 12, 2, 1, 10, 9, 6, 5, 14, 13]},
  {'gameday': 'Second Round', 'games': [1, 0, 9, 8, 5, 4, 13, 12]},
  {'gameday': 'Conference Championship', 'games': [4, 0, 12, 8]},
  {'gameday': 'Stanley Cup', 'games': [0, 8]}
];

@Injectable()
export class PlayoffService {
  PLAYOFF_SCHEDULE: ISchedule[] = [];
  GameDay: string[] = [];
  currentPlayoffGame: number = 0;
  currentPlayoffGameDay: string;
  EASTPlayoffTeams: number[] = [];
  WESTPlayoffTeams: number[] = [];
  PlayoffTeams: number[] = [];
  PlayoffBracket: number[] = new Array(30);
  StanleyCupChamp: number;

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

  loadPlayoffScheduleFromStorage() {
    this.currentPlayoffGame = 0;
    this.PLAYOFF_SCHEDULE = this.storageService.loadPlayoffScheduleFromLocalStorage() || [];
    this.PLAYOFF_SCHEDULE.forEach(game => {
      if (game.visitScore !== null) {
        this.currentPlayoffGame++;
      }
    });
    this.setCurrentPlayoffGame(this.currentPlayoffGame);
  }

  addToSchedule(playoffDay: string) {
    let counter: number = 0;
    SCHEDULE.forEach(day => {
      for (let i = 0; i < day.games.length; i++) {
        const nextPlayoffGame: ISchedule = {
          id: counter++,
          gameday: day.gameday,
          visitTeam: this.PlayoffTeams[day.games[i]],
          visitScore: null,
          homeTeam: this.PlayoffTeams[day.games[i + 1]],
          homeScore: null,
          period: null,
          gameResults: []
        };
        if (nextPlayoffGame.gameday === playoffDay) {
          this.PLAYOFF_SCHEDULE.push(nextPlayoffGame);
        }
        i++;
      }
    });
  }

  buildPlayoffSchedule(playoffDay: string) {
    console.log('[playoff.service] buildPlayoffSchedule() playoffDay: ' + playoffDay);
    this.loadPlayoffScheduleFromStorage();

    if (this.PLAYOFF_SCHEDULE.length < 1) {
      // console.log('[playoff.service] building');
      this.addToSchedule(playoffDay);

      console.log('[playoff.service] Playoff schedule built!');
      // console.table(this.PLAYOFF_SCHEDULE);
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

    this.addToSchedule(this.GameDay[++index]);
    if (this.currentPlayoffGame < this.PLAYOFF_SCHEDULE.length) {
      this.currentPlayoffGameDay = this.PLAYOFF_SCHEDULE[this.currentPlayoffGame].gameday;
      this.setCurrentPlayoffGameDay(this.currentPlayoffGameDay);
      console.log('[playoff.service] checkNextPlayoffRound() currentPlayoffGameDay: ' + this.currentPlayoffGameDay);

      if (index === 1 && this.PLAYOFF_SCHEDULE[7].period === 'F') {
        // console.log('[playoff.service] checkNextPlayoffRound() Second Round, check First Round results');
        if (this.PLAYOFF_SCHEDULE[0].visitScore > this.PLAYOFF_SCHEDULE[0].homeScore) {
          this.PLAYOFF_SCHEDULE[8].visitTeam = this.PLAYOFF_SCHEDULE[0].visitTeam;
        } else {
          this.PLAYOFF_SCHEDULE[8].homeTeam = this.PLAYOFF_SCHEDULE[0].homeTeam;
        }
        if (this.PLAYOFF_SCHEDULE[1].visitScore > this.PLAYOFF_SCHEDULE[1].homeScore) {
          this.PLAYOFF_SCHEDULE[9].visitTeam = this.PLAYOFF_SCHEDULE[1].visitTeam;
        } else {
          this.PLAYOFF_SCHEDULE[9].homeTeam = this.PLAYOFF_SCHEDULE[1].homeTeam;
        }
        if (this.PLAYOFF_SCHEDULE[2].visitScore > this.PLAYOFF_SCHEDULE[2].homeScore) {
          this.PLAYOFF_SCHEDULE[10].visitTeam = this.PLAYOFF_SCHEDULE[2].visitTeam;
        } else {
          this.PLAYOFF_SCHEDULE[10].homeTeam = this.PLAYOFF_SCHEDULE[2].homeTeam;
        }
        if (this.PLAYOFF_SCHEDULE[3].visitScore > this.PLAYOFF_SCHEDULE[3].homeScore) {
          this.PLAYOFF_SCHEDULE[11].visitTeam = this.PLAYOFF_SCHEDULE[3].visitTeam;
        } else {
          this.PLAYOFF_SCHEDULE[11].homeTeam = this.PLAYOFF_SCHEDULE[3].homeTeam;
        }
        if (this.PLAYOFF_SCHEDULE[4].visitScore > this.PLAYOFF_SCHEDULE[4].homeScore) {
          if (this.PLAYOFF_SCHEDULE[0].visitScore > this.PLAYOFF_SCHEDULE[0].homeScore) {
            this.PLAYOFF_SCHEDULE[8].homeTeam = this.PLAYOFF_SCHEDULE[4].visitTeam;
          } else {
            this.PLAYOFF_SCHEDULE[8].visitTeam = this.PLAYOFF_SCHEDULE[4].visitTeam;
          }
        } else {
          if (this.PLAYOFF_SCHEDULE[0].visitScore > this.PLAYOFF_SCHEDULE[0].homeScore) {
            this.PLAYOFF_SCHEDULE[8].homeTeam = this.PLAYOFF_SCHEDULE[4].homeTeam;
          } else {
            this.PLAYOFF_SCHEDULE[8].visitTeam = this.PLAYOFF_SCHEDULE[4].homeTeam;
          }
        }
        if (this.PLAYOFF_SCHEDULE[5].visitScore > this.PLAYOFF_SCHEDULE[5].homeScore) {
          if (this.PLAYOFF_SCHEDULE[1].visitScore > this.PLAYOFF_SCHEDULE[1].homeScore) {
            this.PLAYOFF_SCHEDULE[9].homeTeam = this.PLAYOFF_SCHEDULE[5].visitTeam;
          } else {
            this.PLAYOFF_SCHEDULE[9].visitTeam = this.PLAYOFF_SCHEDULE[5].visitTeam;
          }
        } else {
          if (this.PLAYOFF_SCHEDULE[1].visitScore > this.PLAYOFF_SCHEDULE[1].homeScore) {
            this.PLAYOFF_SCHEDULE[9].homeTeam = this.PLAYOFF_SCHEDULE[5].homeTeam;
          } else {
            this.PLAYOFF_SCHEDULE[9].visitTeam = this.PLAYOFF_SCHEDULE[5].homeTeam;
          }
        }
        if (this.PLAYOFF_SCHEDULE[6].visitScore > this.PLAYOFF_SCHEDULE[6].homeScore) {
          if (this.PLAYOFF_SCHEDULE[2].visitScore > this.PLAYOFF_SCHEDULE[2].homeScore) {
            this.PLAYOFF_SCHEDULE[10].homeTeam = this.PLAYOFF_SCHEDULE[6].visitTeam;
          } else {
            this.PLAYOFF_SCHEDULE[10].visitTeam = this.PLAYOFF_SCHEDULE[6].visitTeam;
          }
        } else {
          if (this.PLAYOFF_SCHEDULE[2].visitScore > this.PLAYOFF_SCHEDULE[2].homeScore) {
            this.PLAYOFF_SCHEDULE[10].homeTeam = this.PLAYOFF_SCHEDULE[6].homeTeam;
          } else {
            this.PLAYOFF_SCHEDULE[10].visitTeam = this.PLAYOFF_SCHEDULE[6].homeTeam;
          }
        }
        if (this.PLAYOFF_SCHEDULE[7].visitScore > this.PLAYOFF_SCHEDULE[7].homeScore) {
          if (this.PLAYOFF_SCHEDULE[3].visitScore > this.PLAYOFF_SCHEDULE[3].homeScore) {
            this.PLAYOFF_SCHEDULE[11].homeTeam = this.PLAYOFF_SCHEDULE[7].visitTeam;
          } else {
            this.PLAYOFF_SCHEDULE[11].visitTeam = this.PLAYOFF_SCHEDULE[7].visitTeam;
          }
        } else {
          if (this.PLAYOFF_SCHEDULE[3].visitScore > this.PLAYOFF_SCHEDULE[3].homeScore) {
            this.PLAYOFF_SCHEDULE[11].homeTeam = this.PLAYOFF_SCHEDULE[7].homeTeam;
          } else {
            this.PLAYOFF_SCHEDULE[11].visitTeam = this.PLAYOFF_SCHEDULE[7].homeTeam;
          }
        }
      }
      if (index === 2 && this.PLAYOFF_SCHEDULE[11].period === 'F') {
        // console.log('[playoff.service] checkNextPlayoffRound() Conference Round, check Second Round results');
        if ( (this.PLAYOFF_SCHEDULE[8].visitScore > this.PLAYOFF_SCHEDULE[8].homeScore)
          && (this.PLAYOFF_SCHEDULE[10].visitScore > this.PLAYOFF_SCHEDULE[10].homeScore) ) {
          // console.log('EAST both div UPSET');
          this.PLAYOFF_SCHEDULE[12].visitTeam = this.PLAYOFF_SCHEDULE[8].visitTeam;
          this.PLAYOFF_SCHEDULE[12].homeTeam = this.PLAYOFF_SCHEDULE[10].visitTeam;
        } else {
          // console.log('EAST NO UPSET?');
          this.PLAYOFF_SCHEDULE[12].visitTeam = this.PLAYOFF_SCHEDULE[8].homeTeam;
          this.PLAYOFF_SCHEDULE[12].homeTeam = this.PLAYOFF_SCHEDULE[10].homeTeam;
          if (this.PLAYOFF_SCHEDULE[8].visitScore > this.PLAYOFF_SCHEDULE[8].homeScore) {
            // console.log('EAST div UPSET 1');
            this.PLAYOFF_SCHEDULE[12].visitTeam = this.PLAYOFF_SCHEDULE[8].visitTeam;
          }
          if (this.PLAYOFF_SCHEDULE[10].visitScore > this.PLAYOFF_SCHEDULE[10].homeScore) {
            // console.log('EAST div UPSET 2');
            this.PLAYOFF_SCHEDULE[12].homeTeam = this.PLAYOFF_SCHEDULE[10].visitTeam;
          }
        }
        // Sort to have the correct home/visit
        if (sortConference(this.teamService.getTeamByIndex(this.PLAYOFF_SCHEDULE[12].visitTeam),
            this.teamService.getTeamByIndex(this.PLAYOFF_SCHEDULE[12].homeTeam)) === -1) {
          // console.log('Swapping East div champs');
          const temp = this.PLAYOFF_SCHEDULE[12].visitTeam;
          this.PLAYOFF_SCHEDULE[12].visitTeam = this.PLAYOFF_SCHEDULE[12].homeTeam;
          this.PLAYOFF_SCHEDULE[12].homeTeam = temp;
        }
        if ( (this.PLAYOFF_SCHEDULE[9].visitScore > this.PLAYOFF_SCHEDULE[9].homeScore)
          && (this.PLAYOFF_SCHEDULE[11].visitScore > this.PLAYOFF_SCHEDULE[11].homeScore) ) {
          // console.log('WEST both div UPSET');
          this.PLAYOFF_SCHEDULE[13].visitTeam = this.PLAYOFF_SCHEDULE[9].visitTeam;
          this.PLAYOFF_SCHEDULE[13].homeTeam = this.PLAYOFF_SCHEDULE[11].visitTeam;
        } else {
          // console.log('WEST NO UPSET?');
          this.PLAYOFF_SCHEDULE[13].visitTeam = this.PLAYOFF_SCHEDULE[9].homeTeam;
          this.PLAYOFF_SCHEDULE[13].homeTeam = this.PLAYOFF_SCHEDULE[11].homeTeam;
          if (this.PLAYOFF_SCHEDULE[9].visitScore > this.PLAYOFF_SCHEDULE[9].homeScore) {
            // console.log('WEST div UPSET 1');
            this.PLAYOFF_SCHEDULE[13].visitTeam = this.PLAYOFF_SCHEDULE[9].visitTeam;
          }
          if (this.PLAYOFF_SCHEDULE[11].visitScore > this.PLAYOFF_SCHEDULE[11].homeScore) {
            // console.log('WEST div UPSET 2');
            this.PLAYOFF_SCHEDULE[13].homeTeam = this.PLAYOFF_SCHEDULE[11].visitTeam;
          }
        }
        // Sort to have the correct home/visit
        if (sortConference(this.teamService.getTeamByIndex(this.PLAYOFF_SCHEDULE[13].visitTeam),
            this.teamService.getTeamByIndex(this.PLAYOFF_SCHEDULE[13].homeTeam)) === -1) {
          // console.log('Swapping West div champs');
          const temp = this.PLAYOFF_SCHEDULE[13].visitTeam;
          this.PLAYOFF_SCHEDULE[13].visitTeam = this.PLAYOFF_SCHEDULE[13].homeTeam;
          this.PLAYOFF_SCHEDULE[13].homeTeam = temp;
        }
      }
      if (index === 3 && this.PLAYOFF_SCHEDULE[13].period === 'F') {
        // console.log('[playoff.service] checkNextPlayoffRound() Stanley Cup, check Conference Round results');
        if (this.PLAYOFF_SCHEDULE[12].visitScore > this.PLAYOFF_SCHEDULE[12].homeScore) {
          // console.log('EAST UPSET conf game');
          this.PLAYOFF_SCHEDULE[14].visitTeam = this.PLAYOFF_SCHEDULE[12].visitTeam;
        } else {
          this.PLAYOFF_SCHEDULE[14].visitTeam = this.PLAYOFF_SCHEDULE[12].homeTeam;
        }
        if (this.PLAYOFF_SCHEDULE[13].visitScore > this.PLAYOFF_SCHEDULE[13].homeScore) {
          // console.log('WEST UPSET conf game');
          this.PLAYOFF_SCHEDULE[14].homeTeam = this.PLAYOFF_SCHEDULE[13].visitTeam;
        } else {
          this.PLAYOFF_SCHEDULE[14].homeTeam = this.PLAYOFF_SCHEDULE[13].homeTeam;
        }
        // Sort to have the correct home/visit
        if (sortNonConference(this.teamService.getTeamByIndex(this.PLAYOFF_SCHEDULE[14].visitTeam),
            this.teamService.getTeamByIndex(this.PLAYOFF_SCHEDULE[14].homeTeam)) === -1) {
          // console.log('Swapping conference champs');
          const temp = this.PLAYOFF_SCHEDULE[14].visitTeam;
          this.PLAYOFF_SCHEDULE[14].visitTeam = this.PLAYOFF_SCHEDULE[14].homeTeam;
          this.PLAYOFF_SCHEDULE[14].homeTeam = temp;
        }
      }
    }

    // console.log('[playoff.service] checkNextPlayoffRound() PLAYOFF_SCHEDULE:');
    // console.log(this.PLAYOFF_SCHEDULE);
    this.storageService.storePlayoffScheduleToLocalStorage(this.PLAYOFF_SCHEDULE);
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

  updatePlayoffBracket() {
    // console.log('[playoff.service] updatePlayoffBracket()');
    this.PLAYOFF_SCHEDULE.forEach(game => {
      if (game.id === 0 && this.PlayoffTeams.length > 0) {
        // console.log('[playoff.service] updatePlayoffBracket() Initializing Bracket');
        this.PlayoffBracket = [];
        this.PlayoffBracket[0] = this.PLAYOFF_SCHEDULE[0].visitTeam;
        this.PlayoffBracket[1] = this.PLAYOFF_SCHEDULE[0].homeTeam;
        this.PlayoffBracket[2] = this.PLAYOFF_SCHEDULE[1].visitTeam;
        this.PlayoffBracket[3] = this.PLAYOFF_SCHEDULE[1].homeTeam;
        this.PlayoffBracket[4] = this.PLAYOFF_SCHEDULE[2].visitTeam;
        this.PlayoffBracket[5] = this.PLAYOFF_SCHEDULE[2].homeTeam;
        this.PlayoffBracket[6] = this.PLAYOFF_SCHEDULE[3].visitTeam;
        this.PlayoffBracket[7] = this.PLAYOFF_SCHEDULE[3].homeTeam;
        this.PlayoffBracket[8] = this.PLAYOFF_SCHEDULE[4].visitTeam;
        this.PlayoffBracket[9] = this.PLAYOFF_SCHEDULE[4].homeTeam;
        this.PlayoffBracket[10] = this.PLAYOFF_SCHEDULE[5].visitTeam;
        this.PlayoffBracket[11] = this.PLAYOFF_SCHEDULE[5].homeTeam;
        this.PlayoffBracket[12] = this.PLAYOFF_SCHEDULE[6].visitTeam;
        this.PlayoffBracket[13] = this.PLAYOFF_SCHEDULE[6].homeTeam;
        this.PlayoffBracket[14] = this.PLAYOFF_SCHEDULE[7].visitTeam;
        this.PlayoffBracket[15] = this.PLAYOFF_SCHEDULE[7].homeTeam;
      }

      // console.log('[playoff.service] updatePlayoffBracket() game.id: ' + game.id);
      // console.log('[playoff.service] updatePlayoffBracket() PlayoffTeams:');
      // console.log(this.PlayoffTeams);

      if (game.period === 'F') {
        if (game.id === 0) {
          if (game.homeScore > game.visitScore) {
            this.PlayoffBracket[16] = game.homeTeam;
          } else {
            this.PlayoffBracket[16] = game.visitTeam;
          }
        }
        if (game.id === 1) {
          if (game.homeScore > game.visitScore) {
            this.PlayoffBracket[18] = game.homeTeam;
          } else {
            this.PlayoffBracket[18] = game.visitTeam;
          }
        }
        if (game.id === 2) {
          if (game.homeScore > game.visitScore) {
            this.PlayoffBracket[20] = game.homeTeam;
          } else {
            this.PlayoffBracket[20] = game.visitTeam;
          }
        }
        if (game.id === 3) {
          if (game.homeScore > game.visitScore) {
            this.PlayoffBracket[22] = game.homeTeam;
          } else {
            this.PlayoffBracket[22] = game.visitTeam;
          }
        }
        if (game.id === 4) {
          if (game.homeScore > game.visitScore) {
            this.PlayoffBracket[17] = game.homeTeam;
          } else {
            this.PlayoffBracket[17] = game.visitTeam;
          }
        }
        if (game.id === 5) {
          if (game.homeScore > game.visitScore) {
            this.PlayoffBracket[19] = game.homeTeam;
          } else {
            this.PlayoffBracket[19] = game.visitTeam;
          }
        }
        if (game.id === 6) {
          if (game.homeScore > game.visitScore) {
            this.PlayoffBracket[21] = game.homeTeam;
          } else {
            this.PlayoffBracket[21] = game.visitTeam;
          }
        }
        if (game.id === 7) {
          if (game.homeScore > game.visitScore) {
            this.PlayoffBracket[23] = game.homeTeam;
          } else {
            this.PlayoffBracket[23] = game.visitTeam;
          }
        }
        if (game.id === 8) {
          if (game.homeScore > game.visitScore) {
            this.PlayoffBracket[24] = game.homeTeam;
          } else {
            this.PlayoffBracket[24] = game.visitTeam;
          }
        }
        if (game.id === 9) {
          if (game.homeScore > game.visitScore) {
            this.PlayoffBracket[25] = game.homeTeam;
          } else {
            this.PlayoffBracket[25] = game.visitTeam;
          }
        }
        if (game.id === 10) {
          if (game.homeScore > game.visitScore) {
            this.PlayoffBracket[26] = game.homeTeam;
          } else {
            this.PlayoffBracket[26] = game.visitTeam;
          }
        }
        if (game.id === 11) {
          if (game.homeScore > game.visitScore) {
            this.PlayoffBracket[27] = game.homeTeam;
          } else {
            this.PlayoffBracket[27] = game.visitTeam;
          }
        }
        if (game.id === 12) {
          if (game.homeScore > game.visitScore) {
            this.PlayoffBracket[28] = game.homeTeam;
          } else {
            this.PlayoffBracket[28] = game.visitTeam;
          }
        }
        if (game.id === 13) {
          if (game.homeScore > game.visitScore) {
            this.PlayoffBracket[29] = game.homeTeam;
          } else {
            this.PlayoffBracket[29] = game.visitTeam;
          }
        }
        if (game.id === 14) {
          if (game.homeScore > game.visitScore) {
            this.StanleyCupChamp = game.homeTeam;
          } else {
            this.StanleyCupChamp = game.visitTeam;
          }
          this.setStanleyCupChamp(this.StanleyCupChamp);
        }
      }
    });

    this.setPlayoffBracket(this.PlayoffBracket);
  }

  getGameResults(id: number): Observable<IGameResults[]> {
    const subject = new Subject<IGameResults[]>();

    setTimeout(() => {subject.next(this.PLAYOFF_SCHEDULE.find(game => (game.id === id)).gameResults); subject.complete(); }, 0);
    return subject;
  }

  playGame(game: ISchedule, simFast: boolean) {
    const visitTeam = this.teamService.getTeamByIndex(game.visitTeam);
    const homeTeam = this.teamService.getTeamByIndex(game.homeTeam);
    console.log('[playoff.service] playGame() currentPlayoffGame: ' + this.currentPlayoffGame
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
      game.period = 'F';
      // if (game.visitScore > game.homeScore) {
      //   console.log('[playoff.service] playGame() Visitors Win');
      // } else {
      //   console.log('[playoff.service] playGame() Home Wins');
      // }

      this.updatePlayoffBracket();
      this.storageService.storePlayoffScheduleToLocalStorage(this.PLAYOFF_SCHEDULE);

      if (game.id === (this.PLAYOFF_SCHEDULE.length - 1)) {
        // console.log('[playoff.service] playGame() currentPlayoffGame: ' + this.currentPlayoffGame);
        // console.log('[playoff.service] playGame() Last game, time to build the next round');
        this.checkNextPlayoffRound();
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

        divisions
          .filter(division => division.indexOf('East') > -1 )
          .forEach((division, i) => {
            const thisDiv: ITeam[] = teamsArr.filter(team => (team.division === division));
            thisDiv.sort(sortDivision);
            if (i === 0) {
              EASTMetro = thisDiv.slice(0, 3);
              EASTOthers = thisDiv.slice(3);
            } else {
              EASTAtlantic = thisDiv.slice(0, 3);
              EASTOthers = EASTOthers.concat(thisDiv.slice(3));
            }
          });

        EASTOthers.sort(sortConference);

        if (sortDivision(EASTMetro[0], EASTAtlantic[0]) === 1) {
          // Atlantic is better, they get the #2 WC
          EASTMetro.push(EASTOthers[0]);
          EASTAtlantic.push(EASTOthers[1]);
        } else {
          // Metro is better, they get the #2 WC
          EASTMetro.push(EASTOthers[1]);
          EASTAtlantic.push(EASTOthers[0]);
        }

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

        divisions
          .filter(division => division.indexOf('West') > -1 )
          .forEach((division, i) => {
            const thisDiv: ITeam[] = teamsArr.filter(team => (team.division === division));
            thisDiv.sort(sortDivision);
            if (i === 0) {
              WESTCentral = thisDiv.slice(0, 3);
              WESTOthers = thisDiv.slice(3);
            } else {
              WESTPacific = thisDiv.slice(0, 3);
              WESTOthers = WESTOthers.concat(thisDiv.slice(3));
            }
          });

        WESTOthers.sort(sortConference);

        if (sortDivision(WESTCentral[0], WESTPacific[0]) === 1) {
          // Pacific is better, they get the #2 WC
          WESTCentral.push(WESTOthers[0]);
          WESTPacific.push(WESTOthers[1]);
        } else {
          // Central is better, they get the #2 WC
          WESTCentral.push(WESTOthers[1]);
          WESTPacific.push(WESTOthers[0]);
        }

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
    this.storageService.clearPlayoffScheduleFromStorage().subscribe(() => {
      // Do nothing here; wait for complete
    }, (err) => {
      console.error('[playoff.service] resetPlayoffs() clearPlayoffScheduleFromStorage() error: ' + err);
    }, () => {
      console.log('[playoff.service] resetPlayoffs() clearPlayoffScheduleFromStorage() complete');
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
