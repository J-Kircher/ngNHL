import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { MatTableDataSource } from '@angular/material';
import { TeamService } from '@app/service/team.service';
import { PlayoffService } from '@app/service/playoff.service';
import { ITeam } from '@app/model/nhl.model';

@Component({
  selector: 'team-details', // This html tag is not necessary since we will be navigating to this
  templateUrl: './team-details.component.html',
  styleUrls: ['./team-details.component.scss']
})

export class TeamDetailsComponent implements OnInit {
  team: ITeam;
  teamIdx: number;
  total: number;
  StanleyCupChamp: number;
  attColumns: string[] = [];
  statsColumns: string[] = [];
  dataSource = new MatTableDataSource();

  constructor(
    private teamService: TeamService,
    private playoffService: PlayoffService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.params.forEach((params: Params) => {
      this.teamIdx = this.teamService.getTeamIndex(params['abbrev']);
      this.team = this.teamService.getTeam(params['abbrev']);
      this.total = this.team.of + this.team.de + this.team.pp + this.team.pk + this.team.go + this.team.co;
    });
    this.playoffService.StanleyCupChamp$.subscribe(data => this.StanleyCupChamp = data);
    this.attColumns = ['of', 'de', 'pp', 'pk', 'go', 'co', 'total'];
    this.statsColumns = ['wins', 'losses', 'gf', 'ga'];
    this.dataSource = new MatTableDataSource([this.team]);
    window.scrollTo(0, 0);
  }
}
