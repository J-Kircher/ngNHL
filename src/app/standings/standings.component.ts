import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { TeamService } from '@app/service/team.service';
import { ITeam } from '@app/model/nhl.model';
import { StandingsDialogComponent } from '@app/dialog/standings/standings-dialog.component';

@Component({
  selector: 'standings',
  templateUrl: './standings.component.html',
  styleUrls: ['./standings.component.scss']
})

export class StandingsComponent implements OnInit {
  divisions: string[] = [];
  teamsArr: ITeam[] = [];
  loading: boolean = true;
  dialogReturn: any;

  constructor(
    public dialog: MatDialog,
    private teamService: TeamService
  ) { }

  ngOnInit() {
    // console.log('[standings] ngOnInit()');

    // this.teamsArr = this.teamService.getTeams().map(teams => teams);

    // this.divisions = ['AFC West', 'NFC West', 'AFC South', 'NFC South', 'AFC North', 'NFC North', 'AFC East', 'NFC East'];

    this.teamService.getTeams().subscribe((data: ITeam[]) => {
      this.teamsArr = data;
      // console.log('[standings] ngOnInit() getTeams() SUCCESS');

      this.teamsArr.forEach(team => {
        if (this.divisions.indexOf(team.division) < 0) {
          this.divisions.push(team.division);
        }
      });

      this.loading = false;
      window.scrollTo(0, 0);
    }, (err) => {
      console.error('[standings] ngOnInit() getTeams() error: ' + err);
    });
  }

  openStatsDialog(): void {
    const dialogRef = this.dialog.open(StandingsDialogComponent, {
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed');
      this.dialogReturn = result;
    });
  }

  openStats() {
    // this.childModal.show();
    this.openStatsDialog();
  }
}
