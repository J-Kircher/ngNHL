import { Component, Input, OnInit } from '@angular/core';
import { TeamService } from '../service/team.service';
import { ITeam, IPlayoffSeries } from '../model/nhl.model';
import { calculateOdds } from '../common/odds';

@Component({
  selector: 'show-series',
  templateUrl: './show-series.component.html',
  styleUrls: ['./show-series.component.scss']
})
export class ShowSeriesComponent implements OnInit {
  @Input() series: IPlayoffSeries;
  teamsArr: ITeam[] = [];
  loading: boolean = true;
  odds: number = 0;

  constructor(
    private teamService: TeamService
  ) { }

  ngOnInit() {
    // console.log('[show-series] ngOnInit()');
    // console.table(this.series);

    this.teamService.getTeams().subscribe((data: ITeam[]) => {
      this.teamsArr = data;
      // console.log('[show-series] ngOnInit() getTeams() SUCCESS');
      this.loading = false;
      // this.odds = calculateOdds(this.teamsArr[this.series.visitTeam], this.teamsArr[this.series.homeTeam]);
    }, (err) => {
      console.error('[show-series] ngOnInit() getTeams() error: ' + err);
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
}
