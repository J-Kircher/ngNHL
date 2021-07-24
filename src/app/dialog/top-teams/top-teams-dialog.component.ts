import { Component, OnInit, DoCheck, OnDestroy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';

import { TeamService } from '@app/service/team.service';
import { ITeam } from '@app/model/nhl.model';
import { sortDivision, sortConference } from '@app/common/sort';

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
  EASTMetro: ITeam[] = [];
  EASTAtlantic: ITeam[] = [];
  EASTOthers: ITeam[] = [];
  EASTHunt: ITeam[] = [];
  WESTCentral: ITeam[] = [];
  WESTPacific: ITeam[] = [];
  WESTOthers: ITeam[] = [];
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
      this.teamsArr.forEach(team => {
        if (this.divisions.indexOf(team.division) < 0) {
          this.divisions.push(team.division);
        }
      });

      this.divisions
        .filter(division => division.indexOf('East') > -1)
        .forEach((division, i) => {
          const thisDiv: ITeam[] = this.teamsArr.filter(team => (team.division === division));
          thisDiv.sort(sortDivision);
          if (i === 0) {
            this.EASTMetro = thisDiv.slice(0, 3);
            this.EASTOthers = thisDiv.slice(3);
          } else {
            this.EASTAtlantic = thisDiv.slice(0, 3);
            this.EASTOthers = this.EASTOthers.concat(thisDiv.slice(3));
          }
        });

      this.EASTOthers.sort(sortConference);

      if (sortDivision(this.EASTMetro[0], this.EASTAtlantic[0]) === 1) {
        // Atlantic is better, they get the #2 WC
        this.EASTMetro.push(this.EASTOthers[0]);
        this.EASTAtlantic.push(this.EASTOthers[1]);
      } else {
        // Metro is better, they get the #2 WC
        this.EASTMetro.push(this.EASTOthers[1]);
        this.EASTAtlantic.push(this.EASTOthers[0]);
      }

      this.EASTHunt = [];
      this.EASTHunt.push(this.EASTOthers[2]);
      this.EASTHunt.push(this.EASTOthers[3]);
      this.EASTHunt.push(this.EASTOthers[4]);
      this.EASTHunt.push(this.EASTOthers[5]);

      this.divisions
        .filter(division => division.indexOf('West') > -1)
        .forEach((division, i) => {
          const thisDiv: ITeam[] = this.teamsArr.filter(team => (team.division === division));
          thisDiv.sort(sortDivision);
          if (i === 0) {
            this.WESTCentral = thisDiv.slice(0, 3);
            this.WESTOthers = thisDiv.slice(3);
          } else {
            this.WESTPacific = thisDiv.slice(0, 3);
            this.WESTOthers = this.WESTOthers.concat(thisDiv.slice(3));
          }
        });

      this.WESTOthers.sort(sortConference);

      if (sortDivision(this.WESTCentral[0], this.WESTPacific[0]) === 1) {
        // Pacific is better, they get the #2 WC
        this.WESTCentral.push(this.WESTOthers[0]);
        this.WESTPacific.push(this.WESTOthers[1]);
      } else {
        // Central is better, they get the #2 WC
        this.WESTCentral.push(this.WESTOthers[1]);
        this.WESTPacific.push(this.WESTOthers[0]);
      }

      this.WESTHunt = [];
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
