import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { ISchedule, ITeam } from '../model/nhl.model';
import { calculateOdds } from '../common/odds';

export class PlayNHLGame {

  // Called by services (schedule.service and playoff.service)
  static playNHLGame(game: ISchedule, vTeam: ITeam, hTeam: ITeam, simFast: boolean): Observable<ISchedule> {
    // console.log('[PlayNHLGame] playNHLGame() started');

    const timeout = simFast ? 10 : 500;
    const subject = new Subject<ISchedule>();
    const gameCounter = 9;
    const gameMax = 11;
    const self = this;

    game.visitScore = 0;
    game.homeScore = 0;

    game.visitRecord = vTeam.wins + '-' + vTeam.losses + '-' + vTeam.otl;
    game.homeRecord = hTeam.wins + '-' + hTeam.losses + '-' + hTeam.otl;

    game.spread = calculateOdds(vTeam, hTeam);

    (function theLoop (i) {
      setTimeout(() => {
        let period = 'X';
        switch (i) {
          case 0: case 1: case 2: period = '1'; break;
          case 3: case 4: case 5: period = '2'; break;
          case 6: case 7: case 8: period = '3'; break;
          case 9: case 10: case 11: period = 'OT'; break;
          default: return 'U';
        }
        const score: number = self.generateNHLScore(self, game, vTeam, hTeam, i, period);
        // console.log('[PlayNHLGame] playNHLGame() score: ' + score);

        game.period = period;

        if (score > 0) {
          // console.log('[PlayNHLGame] playNHLGame() HOME scored: ' + score);
          game.homeScore += score;
          game.gameResults.push({ teamScored: game.homeTeam, period: period, goals: score });
        }

        if (score < 0) {
          const vScore = (score * -1);
          // console.log('[PlayNHLGame] playNHLGame() VISIT scored: ' + vScore);
          game.visitScore += vScore;
          game.gameResults.push({ teamScored: game.visitTeam, period: period, goals: vScore });
        }

        i++;
        if ((i < gameCounter) || ((i < gameMax) && (game.visitScore === game.homeScore))) {
          if (i >= gameCounter) {
            // console.log('[PlayNHLGame] playNHLGame() Game: ' + game.id + ' - OVERTIME! (' + gameCounter + ')');
          }
          theLoop(i);
        } else {
          if (game.visitScore === game.homeScore) {
            // console.log('[PlayNHLGame] playNHLGame() Game: ' + game.id + ' - FORECD OVERTIME!');
            game.homeScore += 3;
            game.gameResults.push({ teamScored: game.homeTeam, period: 'OT', goals: 1 });
          }
          // console.log('[PlayNHLGame] playNHLGame() game over');
          subject.complete();
        }
      }, timeout);
    })(0);

    setTimeout(() => { subject.next(game); }, 0);
    return subject;
  }

  // Called internally by playNHLGame
  static generateNHLScore(self: any, game: ISchedule, vTeam: ITeam, hTeam: ITeam, gameCounter: number, period: string): number {
    // console.log('[PlayNHLGame] generateNHLScore() gameCounter: ' + gameCounter);

    switch (gameCounter) {
      case 0: return this.determineScore (self, game.homeScore, hTeam.of, game.visitScore, vTeam.de, period);
      case 1: return this.determineScore (self, game.homeScore, hTeam.de, game.visitScore, vTeam.of, period);
      case 2: return this.determineScore (self, game.homeScore, hTeam.pp, game.visitScore, vTeam.pk, period);
      case 3: return this.determineScore (self, game.homeScore, hTeam.pk, game.visitScore, vTeam.pp, period);
      case 4: return this.determineScore (self, game.homeScore, hTeam.go, game.visitScore, vTeam.go, period);
      case 5: return this.determineScore (self, game.homeScore, hTeam.of, game.visitScore, vTeam.de, period);
      case 6: return this.determineScore (self, game.homeScore, hTeam.de, game.visitScore, vTeam.of, period);
      case 7: return this.determineScore (self, game.homeScore, hTeam.pp, game.visitScore, vTeam.pk, period);
      case 8: return this.determineScore (self, game.homeScore, hTeam.go, game.visitScore, vTeam.go, period);
      case 9: return this.determineScore (self, game.homeScore, hTeam.go, game.visitScore, vTeam.go, period);
      case 10: return this.determineScore (self, game.homeScore, hTeam.co, game.visitScore, vTeam.co, period);
      case 11: return 1;
      default: console.log('generateNHLScore() Error - Invalid gameCounter: ' + gameCounter);
    }
  }

  // Called internally by generateNHLScore
  static determineScore(self: any, homeScore: number, homeAttrib: number,
      visitScore: number, visitAttrib: number, period: string): number {

    let difference = 0;

    // console.log('[PlayNHLGame] determineScore() homeAttrib: ' + homeAttrib +  ', visitAttrib: ' + visitAttrib);
    // homeAttrib -= 3;
    // visitAttrib -= 3;

    const Try1 = (homeAttrib <= 0) ? 0 : Math.floor(Math.random() * homeAttrib);
    const Try2 = (visitAttrib <= 0) ? 0 : Math.floor(Math.random() * visitAttrib);
    // console.log('[PlayNHLGame] determineScore() Try1: ' + Try1 +  ', Try2: ' + Try2);

    if (Try1 !== Try2) {
      difference = Math.abs(Try1 - Try2);
      // console.log('[PlayNHLGame] determineScore() difference: ' + difference);
      if (difference > 1) {
        if (Try1 > Try2) {
          return 1;
        } else {
          return -1;
        }
      }
      return 0;
    }
  }
}
