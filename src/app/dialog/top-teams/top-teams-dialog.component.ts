import { Component, OnInit, DoCheck, OnDestroy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatTabChangeEvent } from '@angular/material';

import { TeamService } from '../../service/team.service';
import { ITeam } from '../../model/nhl.model';
import { sortDivision, sortConference } from '../../common/sort';

@Component({
  selector: 'app-top-teams-dialog',
  templateUrl: './top-teams-dialog.component.html',
  styleUrls: ['./top-teams-dialog.component.scss']
})
export class TopTeamsDialogComponent implements OnInit, DoCheck, OnDestroy {

  constructor(
    private teamService: TeamService,
    public dialogRef: MatDialogRef<TopTeamsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {}

  tabIndex: number;
  divisions: string[] = [];
  teamsArr: ITeam[] = [];
  EASTDivLeaders: ITeam[] = [];
  EASTOthers: ITeam[] = [];
  EASTWildcard: ITeam[] = [];
  EASTHunt: ITeam[] = [];
  WESTDivLeaders: ITeam[] = [];
  WESTOthers: ITeam[] = [];
  WESTWildcard: ITeam[] = [];
  WESTHunt: ITeam[] = [];

  ngOnInit() {
    // this.teamsArr = this.teamService.getCurrentTeams().map(teams => teams);

    if (this.data) {
      this.tabIndex = this.data.tabIndex;
    } else {
      this.tabIndex = 0;
    }

    this.teamService.getTeams().subscribe((data: ITeam[]) => {
      this.teamsArr = data;
      // console.log('[navbar] ngOnInit() getCurrentTeams() SUCCESS');
    }, (err) => {
      console.error('[top-teams] ngOnInit() getTeams() error: ' + err);
    });
  }

  ngDoCheck() {
    if (this.teamsArr.length > 0) {
      this.EASTDivLeaders = [];
      this.EASTOthers = [];
      this.EASTWildcard = [];
      this.EASTHunt = [];

      this.WESTDivLeaders = [];
      this.WESTOthers = [];
      this.WESTWildcard = [];
      this.WESTHunt = [];

      this.teamsArr.forEach(team => {
        if (this.divisions.indexOf(team.division) < 0) {
          this.divisions.push(team.division);
        }
      });

      this.divisions
        .filter(division => division.indexOf('EAST') > -1)
        .forEach(division => {
          const thisDiv: ITeam[] = this.teamsArr.filter(team => (team.division === division));
          thisDiv.sort(sortDivision);
          this.EASTDivLeaders.push(thisDiv[0]);
          this.EASTOthers.push(thisDiv[1]);
          this.EASTOthers.push(thisDiv[2]);
          this.EASTOthers.push(thisDiv[3]);
        });

      this.EASTDivLeaders.sort(sortConference);
      this.EASTOthers.sort(sortConference);

      this.EASTWildcard.push(this.EASTOthers[0]);
      this.EASTWildcard.push(this.EASTOthers[1]);

      this.EASTHunt.push(this.EASTOthers[2]);
      this.EASTHunt.push(this.EASTOthers[3]);
      this.EASTHunt.push(this.EASTOthers[4]);
      this.EASTHunt.push(this.EASTOthers[5]);

      this.divisions
        .filter(division => division.indexOf('WEST') > -1)
        .forEach(division => {
          const thisDiv: ITeam[] = this.teamsArr.filter(team => (team.division === division));
          thisDiv.sort(sortDivision);
          this.WESTDivLeaders.push(thisDiv[0]);
          this.WESTOthers.push(thisDiv[1]);
          this.WESTOthers.push(thisDiv[2]);
          this.WESTOthers.push(thisDiv[3]);
        });

      this.WESTDivLeaders.sort(sortConference);
      this.WESTOthers.sort(sortConference);

      this.WESTWildcard.push(this.WESTOthers[0]);
      this.WESTWildcard.push(this.WESTOthers[1]);

      this.WESTHunt.push(this.WESTOthers[2]);
      this.WESTHunt.push(this.WESTOthers[3]);
      this.WESTHunt.push(this.WESTOthers[4]);
      this.WESTHunt.push(this.WESTOthers[5]);
    }
  }

  ngOnDestroy() {
    this.onClose();
  }

  tabClicked(event: MatTabChangeEvent) {
    this.tabIndex = event.index;
  }

  onClose(): void {
    this.dialogRef.close({ 'tabIndex': this.tabIndex });
  }
}
