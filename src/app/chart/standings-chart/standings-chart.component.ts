import { Component, OnInit } from '@angular/core';
import { TeamService } from '@app/service/team.service';
import { ScheduleService } from '@app/service/schedule.service';
import { ITeam, ISchedule, IGameResults } from '@app/model/nhl.model';
import { Chart } from 'chart.js';
import { max } from 'rxjs/operators';

@Component({
  selector: 'app-standings-chart',
  templateUrl: './standings-chart.component.html',
  styleUrls: ['./standings-chart.component.scss']
})
export class StandingsChartComponent implements OnInit {
  chartView: string = '';
  divisions: string[] = [];
  teamsArr: ITeam[] = [];
  schedulesArr: ISchedule[][] = [];
  myChart: Chart = []; // This will hold our chart info
  chartStats = []; // This will contain the labels and data for the chart

  constructor(
    private teamService: TeamService,
    private scheduleService: ScheduleService
  ) { }

  ngOnInit() {
    // console.log('[standings-chart] ngOnInit()');
    // this.createChartObject('all');

    this.getAllTeamData();
  }

  getAllTeamData() {
    // get teams and schedules

    let retrieveCount = 0;
    this.teamService.getTeams().subscribe((data: ITeam[]) => {
      this.teamsArr = data;
      // console.log('[standings-chart] getAllTeamData() getTeams() SUCCESS');
    }, (err) => {
      console.error('[standings-chart] getAllTeamData() getTeams() error: ' + err);
    }, () => {
      this.teamsArr.forEach((team, idx) => {
        if (this.divisions.indexOf(team.division) < 0) {
          this.divisions.push(team.division);
        }
        this.scheduleService.getGamesForTeam(idx).subscribe((schedData: ISchedule[]) => {
          this.schedulesArr.push(schedData);
        }, (err) => {
          console.error('[standings-chart] getAllTeamData() getGamesForTeam() error: ' + err);
        }, () => {
          retrieveCount++;
          if (retrieveCount === this.teamsArr.length) {
            this.createChartObject(this.divisions[0]);
          }
        });
      });
    });
  }

  createChartObject(chartDivision: string): void {
    // console.log('[standings-chart] createChartObject()');
    this.chartView = chartDivision;

    let teamIndex: number;

    // Create chartStats object
    this.chartStats = [];
    if (typeof this.myChart.chart !== 'undefined') {
      this.myChart.chart.destroy();
    }

    this.teamsArr.forEach(team => {
      if (team.division === chartDivision || chartDivision === 'all') {

        const teamStats = [];
        teamIndex = this.teamsArr.findIndex(t => t.abbrev === team.abbrev);

        let teamPoints = 0;
        const teamSchedule: ISchedule[] = this.schedulesArr[teamIndex];
        teamSchedule.forEach((game, idx) => {
          if (game.period === 'F') {
            if (teamIndex === game.homeTeam) {
              if (game.homeScore > game.visitScore) {
                  teamPoints += 2;
              } else {
                if (game.overtime) {
                  teamPoints += 1;
                }
              }
            } else {
              if (game.visitScore > game.homeScore) {
                  teamPoints += 2;
              } else {
                if (game.overtime) {
                  teamPoints += 1;
                }
              }
            }
            // teamStats.push({ 'points': teamPoints, 'games': (idx + 1) });
            // teamStats.push(teamPoints);
          }
        });

        this.chartStats.push({
          label: team.name,
          abbrev: team.abbrev,
          points: team.points,
          data: teamStats,
          borderWidth: 3,
          pointRadius: 0,
          fill: false,
          borderColor: '#' + team.darkcolor,
          backgroundColor: '#' + team.lightcolor
        });
      }
    });

    console.log(this.chartStats);

    // Create chart object
    const canvas = <HTMLCanvasElement>document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    this.myChart = new Chart(ctx, {
      type: 'line',
      data: this.getChartDataObject(),
      options: {
        responsive: true,
        legend: {
          display: true,
          position: 'bottom'
        },
        elements: {
          point: {
            hitRadius: 12,
            hoverRadius: 2
          },
          line: {
            tension: 0
          }
        },
        layout: {
          padding: {
            left: 0,
            right: 30,
            top: 20,
            bottom: 0
          }
        }
      },
      plugins: [{
        afterUpdate: function(chart) {
          chart.config.data.datasets.forEach(ds => {
            for (const key of Object.keys(ds._meta)) {
              const dsMeta = ds._meta[key];
              if (ds.abbrev) {
                const img = new Image(20, 20);
                img.src = '/assets/images/' + ds.abbrev + '_LG.png';
                const len = (dsMeta.data.length - 1);
                if (len > -1) {
                  dsMeta.data[len]._model.pointStyle = img;
                }
              }
            }
          });
        }
      }]
    });
  }

  getChartDataObject(): any {
    // console.log('[standings-chart] getChartDataObject()');

    let _label: string [] = null;
    const _data = this.chartStats;

    const _gamesPlayed: number[] = this.chartStats.map(item => item.data.length);
    const _maxGames = Math.max(..._gamesPlayed);

    this.chartStats.forEach(item => {
      if (item.data.length >= _maxGames) {
        _label = item.data.map((_n, idx) => idx + 1);
      }
    });

    // calculate average
    const totPts = this.chartStats.reduce((a, b) => a + (b['points'] || 0), 0);
    const avg = totPts / this.chartStats.length;

    // Average Line
    _data.push({
      label: 'Average',
      data: Array.apply(null, new Array(_maxGames)).map(Number.prototype.valueOf, avg),
      fill: false,
      radius: 0,
      backgroundColor: 'rgba(0,0,0,0.1)'
    });

    return {
      labels: _label,
      datasets: _data
    };
  }
}
