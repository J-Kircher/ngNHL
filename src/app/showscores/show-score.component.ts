import { Component, Input, OnInit } from '@angular/core';
import { TeamService } from '../service/team.service';
import { PlayoffService } from '../service/playoff.service';
import { ITeam, ISchedule } from '../model/nhl.model';

@Component({
  selector: 'show-score',
  templateUrl: './show-score.component.html',
  styleUrls: ['./show-score.component.scss']
})

export class ShowScoreComponent implements OnInit {
  @Input() score: ISchedule;
  teamsArr: ITeam[] = [];
  loading: boolean = true;
  seriesGameNo: number = 0;

  constructor(
    private teamService: TeamService,
    private playoffService: PlayoffService
  ) { }

  ngOnInit() {
    // console.log('[show-score] ngOnInit()');
    // console.table(this.score);

    this.teamService.getTeams().subscribe((data: ITeam[]) => {
      this.teamsArr = data;
      // console.log('[show-score] ngOnInit() getTeams() SUCCESS');
      this.loading = false;
      this.seriesGameNo = this.playoffService.getSeriesGameIdxForPlayoffGame(this.score.id);
    }, (err) => {
      console.error('[show-score] ngOnInit() getTeams() error: ' + err);
    });
  }

  showPeriod() {
    return !['F', 'OT'].includes(this.score.period);
  }

  showPlayoffGame() {
    const playoffRounds = [ 'First Round', 'Second Round', 'Conference Championship', 'Stanley Cup' ];
    return playoffRounds.includes(this.score.gameday);
  }
}
