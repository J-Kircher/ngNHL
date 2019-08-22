import { Component, Input, OnInit } from '@angular/core';
import { TeamService } from '../service/team.service';
import { ITeam, ISchedule } from '../model/nhl.model';
import { calculateOdds } from '../common/odds';

@Component({
  selector: 'show-score',
  templateUrl: './show-score.component.html',
  styleUrls: ['./show-score.component.scss']
})

export class ShowScoreComponent implements OnInit {
  @Input() score: ISchedule;
  teamsArr: ITeam[] = [];
  loading: boolean = true;
  odds: number = 0;

  constructor(
    private teamService: TeamService
  ) { }

  ngOnInit() {
    // console.log('[show-score] ngOnInit()');
    // console.table(this.score);

    this.teamService.getTeams().subscribe((data: ITeam[]) => {
      this.teamsArr = data;
      // console.log('[show-score] ngOnInit() getTeams() SUCCESS');
      this.loading = false;
      // this.odds = calculateOdds(this.teamsArr[this.score.visitTeam], this.teamsArr[this.score.homeTeam]);
    }, (err) => {
      console.error('[show-score] ngOnInit() getTeams() error: ' + err);
    });
  }

  showPeriod() {
    return !['F', 'OT'].includes(this.score.period);
  }
}