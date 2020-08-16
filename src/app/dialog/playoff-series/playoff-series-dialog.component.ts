import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { TeamService } from '@app/service/team.service';
import { ITeam, ISchedule, IPlayoffSeries } from '@app/model/nhl.model';
import { PlayoffService } from '@app/service/playoff.service';
import { ResultsDialogComponent } from '@app/dialog/results/results-dialog.component';
import { MatchupDialogComponent } from '@app/dialog/matchup/matchup-dialog.component';

@Component({
  selector: 'app-playoff-series-dialog',
  templateUrl: './playoff-series-dialog.component.html',
  styleUrls: ['./playoff-series-dialog.component.scss']
})
export class PlayoffSeriesDialogComponent implements OnInit {
    teamsArr: ITeam[] = [];
    series: IPlayoffSeries;
    games: ISchedule[] = [];
    loading: boolean = true;
    odds: number = 0;

    dialogReturn: any;

    constructor(
      public dialogRef: MatDialogRef<PlayoffSeriesDialogComponent>,
      private teamService: TeamService,
      private playoffService: PlayoffService,
      @Inject(MAT_DIALOG_DATA) public data,
      public dialog: MatDialog
    ) { }

    ngOnInit() {
      // console.log('[playoff-series] ngOnInit() series id: ' + this.data.id);
      this.series = this.playoffService.getSeriesById(this.data.id);

      this.series.games.forEach(gameId => {
        this.games.push(this.playoffService.getGameById(gameId));
      });

      this.teamService.getTeams().subscribe((data: ITeam[]) => {
        this.teamsArr = data;
        // console.log('[playoff-series] ngOnInit() getTeams() SUCCESS');
        this.loading = false;
      }, (err) => {
        console.error('[playoff-series] ngOnInit() getTeams() error: ' + err);
      });
    }

    showSeriesStatus() {
      let statusTxt = '';
      const homeCity = this.teamService.getTeamByIndex(this.series.homeTeam).city;
      const visitCity = this.teamService.getTeamByIndex(this.series.visitTeam).city;
      const gamesPlayed = this.series.homeWins + this.series.visitWins;
      if (this.series.homeWins > this.series.visitWins) {
        if (this.series.homeWins === 4) {
          statusTxt = homeCity + ' wins ' + this.series.homeWins + ' to ' + this.series.visitWins;
        } else {
          statusTxt = homeCity + ' leads ' + this.series.homeWins + ' to ' + this.series.visitWins;
        }
      } else if  (this.series.homeWins < this.series.visitWins) {
        if (this.series.visitWins === 4) {
          statusTxt = visitCity + ' wins ' + this.series.visitWins + ' to ' + this.series.homeWins;
        } else {
          statusTxt = visitCity + ' leads ' + this.series.visitWins + ' to ' + this.series.homeWins;
        }
      } else {
        if (gamesPlayed > 0) {
          statusTxt = 'Series tied at ' + this.series.homeWins;
        } else {
          statusTxt = 'Series about to begin!';
        }
      }
      return statusTxt;
    }

    openResultsDialog(id: number, playoffs: boolean = false): void {
      const dialogRef = this.dialog.open(ResultsDialogComponent, {
        data: { id: id, playoffs: playoffs }
      });

      dialogRef.afterClosed().subscribe(result => {
        // console.log('The dialog was closed');
        this.dialogReturn = result;
      }, (err) => {
        console.error('[playoff-series] openResultsDialog() afterClosed() error: ' + err);
      });
    }

    openMatchupDialog(id: number, playoffs: boolean = false): void {
      const dialogRef = this.dialog.open(MatchupDialogComponent, {
        data: { id: id, playoffs: playoffs }
      });

      dialogRef.afterClosed().subscribe(result => {
        // console.log('The dialog was closed');
        this.dialogReturn = result;
      }, (err) => {
        console.error('[team-schedule] openMatchupDialog() afterClosed() error: ' + err);
      });
    }

    getResults(id: number, score: number) {
      // console.log('[playoff-series] getResults: ' + id);
      if (score === 0) {
        this.openMatchupDialog(id, true);
      } else {
        this.openResultsDialog(id, true);
      }
    }

    onClose(): void {
      this.dialogRef.close();
    }
  }
