import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TeamService } from '@app/service/team.service';
import { ScheduleService } from '@app/service/schedule.service';
import { PlayoffService } from '@app/service/playoff.service';
import { ITeam, ISchedule, IGameResults } from '@app/model/nhl.model';
import { MatchupDialogComponent } from '@app/dialog/matchup/matchup-dialog.component';
import { ResultsDialogComponent } from '@app/dialog/results/results-dialog.component';
import { listAnimation } from '@app/shared/animations';

@Component ({
  selector: 'team-schedule',
  templateUrl: './team-schedule.component.html',
  styleUrls: ['./team-schedule.component.scss'],
  animations: [listAnimation]
})

export class TeamScheduleComponent implements OnInit {
  team: ITeam;
  teamsArr: ITeam[] = [];
  teamIndex: number;
  teamSchedule: ISchedule[];
  postseason: boolean = false;
  playoffSchedule: ISchedule[];
  loading: boolean = true;
  GameDay: string[] = [];

  dialogReturn: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private teamService: TeamService,
    private scheduleService: ScheduleService,
    private playoffService: PlayoffService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.scheduleService.endOfSeason$.subscribe(data => this.postseason = data);
    this.route.params.forEach((params: Params) => {
      this.team = this.teamService.getTeam(params['abbrev']);
      // console.log('[team-schedule] ngOnInit() team: ' + this.team.city + ' ' + this.team.name);
      // this.teamsArr = this.teamService.getTeams().map(teams => teams);

      this.teamService.getTeams().subscribe((teamData: ITeam[]) => {
        this.teamsArr = teamData;
        // console.log('[team-schedule] ngOnInit() getTeams() SUCCESS');

        this.teamIndex = this.teamsArr.findIndex(team => team.abbrev === this.team.abbrev);
        this.scheduleService.getGamesForTeam(this.teamIndex).subscribe((schedData: ISchedule[]) => {
          this.teamSchedule = schedData;
          // console.table(this.teamSchedule);
        }, (err) => {
          console.error('[team-schedule] ngOnInit() getGamesForTeam() error: ' + err);
        }, () => {
          // console.log('[team-schedule] ngOnInit() getGamesForTeam() COMPLETE');
          this.playoffService.getGamesForTeam(this.teamIndex, this.postseason).subscribe((playSchedData: ISchedule[]) => {
            this.playoffSchedule = playSchedData;
            let lastDay = '';
            this.GameDay = [];
            this.playoffSchedule.forEach(day => {
              if (lastDay !== day.gameday) {
                lastDay = day.gameday;
                this.GameDay.push(day.gameday);
              }
            });
            this.loading = false;
          }, (err) => {
            console.error('[team-schedule] ngOnInit() playoff getGamesForTeam() error: ' + err);
          }, () => {
            // console.log('[team-schedule] ngOnInit() playoff getGamesForTeam() COMPLETE');
          });
        });
      }, (err) => {
        console.error('[team-schedule] ngOnInit() getTeams() error: ' + err);
      });
    });
  }

  getOpponent(game: ISchedule): ITeam {
    if (game.visitTeam === this.teamIndex) {
      // console.log('[team-schedule] getOpponent() visit: ' + game.visitTeam);
      return this.teamsArr[game.homeTeam];
    }
    if (game.homeTeam === this.teamIndex) {
      // console.log('[team-schedule] getOpponent() home: ' + game.homeTeam);
      return this.teamsArr[game.visitTeam];
    }
  }

  showTeam(abbrev: string) {
    // showTeam(getOpponent(score).abbrev)
    // routing to the same component - TeamDetails needs to subscribe to the route paramaters;
    this.router.navigate(['/teams/' + abbrev]);
  }

  getGamesForDay(day: string) {
    return this.playoffSchedule.filter(_ => _.gameday === day);
  }

  openResultsDialog(id: number, playoffs: boolean = false): void {
    const dialogRef = this.dialog.open(ResultsDialogComponent, {
      data: { id: id, playoffs: playoffs }
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed');
      this.dialogReturn = result;
    }, (err) => {
      console.error('[team-schedule] openResultsDialog() afterClosed() error: ' + err);
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

  getMatchup(id: number, playoffs: boolean = false) {
    // console.log('[team-schedule] getMatchup: ' + id);

    const service = playoffs ? this.playoffService : this.scheduleService;

    service.getGameResults(id).subscribe((results: IGameResults[]) => {
      if (results.length) {
        this.openResultsDialog(id, playoffs);
      } else {
        this.openMatchupDialog(id, playoffs);
      }
    });
  }
}
