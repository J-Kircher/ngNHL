import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TeamService } from '@app/service/team.service';
import { ITeam, ISchedule, IGameResults } from '@app/model/nhl.model';
import { ScheduleService } from '@app/service/schedule.service';
import { PlayoffService } from '@app/service/playoff.service';
import { getOddsText } from '@app/common/odds';

@Component({
  selector: 'app-results-dialog',
  templateUrl: './results-dialog.component.html',
  styleUrls: ['./results-dialog.component.scss']
})
export class ResultsDialogComponent implements OnInit {
  teamsArr: ITeam[] = [];
  modalGame: ISchedule;
  results: IGameResults[];
  loading: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<ResultsDialogComponent>,
    private teamService: TeamService,
    private scheduleService: ScheduleService,
    private playoffService: PlayoffService,
    @Inject(MAT_DIALOG_DATA) public data
  ) { }

  ngOnInit() {
    // console.log('[results] data: ' + this.data);
    if (this.data.playoffs) {
      this.modalGame = this.playoffService.getGameById(this.data.id);
    } else {
      this.modalGame = this.scheduleService.getGameById(this.data.id);
    }

    this.teamService.getTeams().subscribe((data: ITeam[]) => {
      this.teamsArr = data;
      this.results = this.modalGame.gameResults;
      this.loading = false;
    }, (err) => {
      console.error('[results] ngOnInit() getTeams() error: ' + err);
    });
  }

  getOdds() {
    // show saved game odds or calculate if there is none
    const visit = this.teamsArr[this.modalGame.visitTeam] ? this.teamsArr[this.modalGame.visitTeam].abbrev : '';
    const home = this.teamsArr[this.modalGame.homeTeam] ? this.teamsArr[this.modalGame.homeTeam].abbrev : '';
    return getOddsText(this.modalGame.spread, visit, home);
  }

  getPeriod(period: string) {
    switch (period) {
      case '1': return 'First period';
      case '2': return 'Second period';
      case '3': return 'Third period';
      case 'OT': return 'Overtime';
      default: return '?';
    }
  }

  whoScored(idx: number, team: string) {
    let visitScored = false;
    let homeScored = false;
    let returnClass = 'normal';

    if (this.results[idx].teamScored === this.modalGame.homeTeam) {
      homeScored = true;
    }

    if (this.results[idx].teamScored === this.modalGame.visitTeam) {
      visitScored = true;
    }

    if ((team === 'v' && visitScored) || (team === 'h' && homeScored)) {
      returnClass = 'bold';
    }

    return returnClass;
  }

  getGameScore(idx: number, team: string) {
    let visitScore = 0;
    let homeScore = 0;

    this.results.forEach((result, i) => {
      if (i <= idx) {
        if (result.teamScored === this.modalGame.homeTeam) {
          homeScore += result.goals;
        }
        if (result.teamScored === this.modalGame.visitTeam) {
          visitScore += result.goals;
        }
      }
    });

    return team === 'v' ? visitScore : homeScore;
  }

  getWinner() {
    if (this.modalGame.homeScore > this.modalGame.visitScore) {
      return this.teamsArr[this.modalGame.homeTeam].name;
    } else {
      return this.teamsArr[this.modalGame.visitTeam].name;
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
