import { Component, OnInit, AfterContentInit } from '@angular/core';
import { NHLCalendar, ISchedule } from '@app/model/nhl.model';
import { ScheduleService } from '@app/service/schedule.service';
import { ScheduleDayService } from '@app/service/schedule.day.service';

@Component({
  selector: 'schedule-calendar',
  templateUrl: './schedule-calendar.component.html',
  styleUrls: ['./schedule-calendar.component.scss']
})

export class ScheduleCalenderComponent implements OnInit, AfterContentInit {
  NHLCalendarArr: NHLCalendar[] = [];
  gameDay: string;
  gamesArr: ISchedule[] = [];
  scheduleYear: number = 2019;

  constructor(
    private scheduleService: ScheduleService,
    private scheduleDayService: ScheduleDayService
  ) { }

  ngOnInit() {
    // console.log('[schedule-calendar] ngOnInit() scheduleYear: ' + this.scheduleYear);
    const nextYear = this.scheduleYear + 1;
    this.NHLCalendarArr = [
      { month: 10, year: this.scheduleYear },
      { month: 11, year: this.scheduleYear },
      { month: 12, year: this.scheduleYear },
      { month: 1, year: nextYear },
      { month: 2, year: nextYear },
      { month: 3, year: nextYear },
      { month: 4, year: nextYear },
    ];
    this.scheduleService.currentGameDay$.subscribe(data => this.gameDay = data);
  }

  ngAfterContentInit() {
    // console.log('[schedule-calendar] ngAfterContentInit()');
    this.getGamesForDay(this.gameDay);
  }

  getGamesForDay(gameDay: string) {
    // console.log('[schedule-calendar] getGamesForDay() gameDay: ' + gameDay);
    this.gamesArr = this.scheduleService.getGamesForDay(gameDay);
    if (this.gamesArr.length > 0) {
      // console.log('[schedule-calendar] getGamesForDay() calling setScheduleDay()');
      this.scheduleDayService.setScheduleDay(gameDay, this.gamesArr);
    }
  }
}
