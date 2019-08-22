import { Component, Input, OnInit, DoCheck } from '@angular/core';
import { Router } from '@angular/router';
import { TeamService } from '../service/team.service';
import { ScheduleService } from '../service/schedule.service';
import { ITeam } from '../model/nhl.model';
import { sortDivision, sortDivisionByTotal } from '../common/sort';

@Component({
  selector: 'standings-division-expanded',
  templateUrl: './standings-division-expanded.component.html',
  styleUrls: ['./standings-division.component.scss']
})

export class StandingsDivisionExpandedComponent implements OnInit, DoCheck {
  @Input() division: string;
  teamsArr: ITeam[] = [];
  divisionTeams: ITeam[] = [];
  currentGame: number = 0;
  loading: boolean = true;

  constructor(
    private router: Router,
    private teamService: TeamService,
    private scheduleService: ScheduleService
  ) { }

  ngOnInit() {
    this.scheduleService.currentGame$.subscribe(data => this.currentGame = data);
  }

  ngDoCheck() {
    // console.log('[standings-div-exp] ngDoCheck() division: ' + this.division);
    // this.teamsArr = this.teamService.getTeams().map(teams => teams);
    // this.divisionTeams = this.getTeamsForDivision(this.division);

    if (this.loading) {
      this.teamService.getTeams().subscribe((data: ITeam[]) => {
        this.teamsArr = data;
        // console.log('[standings-div-exp] ngDoCheck() getTeams() SUCCESS');
        this.loading = false;
      }, (err) => {
        console.error('[standings-div-exp] ngDoCheck() getTeams() error: ' + err);
      });
    }

    if (this.currentGame > 0) {
      this.divisionTeams = this.teamService.getTeamsForDivision(this.division).sort(sortDivision);
    } else {
      this.divisionTeams = this.teamService.getTeamsForDivision(this.division).sort(sortDivisionByTotal);
    }
  }

  showTeam(abbrev: string) {
      this.router.navigate(['/teams/' + abbrev]);
  }
}