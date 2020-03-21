import { Injectable } from '@angular/core';
import { ISchedule, ITeam, IPlayoffSeries } from '@app/model/nhl.model';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class StorageService {

  constructor() { }

  public loadScheduleFromLocalStorage(): ISchedule[] {
    // console.log('[storage.service] loadScheduleFromLocalStorage()');
    let config;

    try {
      const configText = localStorage.getItem('NHLfullSchedule');

      if (configText) {
        config = JSON.parse(configText);
      // } else {
      //   this.storeScheduleToLocalStorage(config);
      }
      // console.log('[storage.service] loadScheduleFromLocalStorage() SUCCESS');
    } catch (e) {
      console.warn('[storage.service] loadScheduleFromLocalStorage() Error reading from local storage');
    }
    return config;
  }

  public storeScheduleToLocalStorage(newNHLfullSchedule: ISchedule[]): void {
    // console.log('[storage.service] storeScheduleToLocalStorage()');
    try {
      const configText = JSON.stringify(newNHLfullSchedule);
      localStorage.setItem('NHLfullSchedule', configText);
    } catch (e) {
      console.warn('[storage.service] storeScheduleToLocalStorage() Error reading from local storage');
    }
  }

  public clearScheduleFromStorage(): Observable<boolean> {
    const subject = new Subject<boolean>();
    localStorage.removeItem('NHLfullSchedule');
    setTimeout(() => {
      subject.next(true);
      subject.complete();
    }, 50);
    return subject;
  }

  public loadTeamsFromLocalStorage(): ITeam[] {
    // console.log('[storage.service] loadTeamsFromLocalStorage()');
    let config;

    try {
      const configText = localStorage.getItem('NHLteams');

      if (configText) {
        config = JSON.parse(configText);
      // } else {
      //   this.storeTeamsToLocalStorage(config);
      }
      // console.log('[storage.service] loadTeamsFromLocalStorage() SUCCESS');
    } catch (e) {
      console.warn('[storage.service] loadTeamsFromLocalStorage() Error reading from local storage');
    }
    return config;
  }

  public storeTeamsToLocalStorage(newNHLteams: ITeam[]): void {
    // console.log('[storage.service] storeTeamsToLocalStorage()');
    try {
      const configText = JSON.stringify(newNHLteams);
      localStorage.setItem('NHLteams', configText);
    } catch (e) {
      console.warn('[storage.service] storeTeamsToLocalStorage() Error reading from local storage');
    }
  }

  public clearTeamsFromStorage(): Observable<boolean> {
    const subject = new Subject<boolean>();
    localStorage.removeItem('NHLteams');
    setTimeout(() => {
      subject.next(true);
      subject.complete();
    }, 50);
    return subject;
  }

  public loadPlayoffScheduleFromLocalStorage(): ISchedule[] {
    // console.log('[storage.service] loadPlayoffScheduleFromLocalStorage()');
    let config;

    try {
      const configText = localStorage.getItem('NHLplayoffSchedule');

      if (configText) {
        config = JSON.parse(configText);
      }
    } catch (e) {
      console.warn('[storage.service] loadPlayoffScheduleFromLocalStorage() Error reading from local storage');
    }
    return config;
  }

  public storePlayoffScheduleToLocalStorage(newNHLplayoffSchedule: ISchedule[]): void {
    // console.log('[storage.service] storePlayoffScheduleToLocalStorage()');
    try {
      const configText = JSON.stringify(newNHLplayoffSchedule);
      localStorage.setItem('NHLplayoffSchedule', configText);
    } catch (e) {
      console.warn('[storage.service] storePlayoffScheduleToLocalStorage() Error reading from local storage');
    }
  }

  public clearPlayoffsFromStorage(): Observable<boolean> {
    const subject = new Subject<boolean>();
    localStorage.removeItem('NHLplayoffSeries');
    localStorage.removeItem('NHLplayoffSchedule');
    setTimeout(() => {
      subject.next(true);
      subject.complete();
    }, 50);
    return subject;
  }

  public loadPlayoffSeriesFromLocalStorage(): IPlayoffSeries[] {
    // console.log('[storage.service] loadPlayoffSeriesFromLocalStorage()');
    let config;

    try {
      const configText = localStorage.getItem('NHLplayoffSeries');

      if (configText) {
        config = JSON.parse(configText);
      }
    } catch (e) {
      console.warn('[storage.service] loadPlayoffSeriesFromLocalStorage() Error reading from local storage');
    }
    return config;
  }

  public storePlayoffSeriesToLocalStorage(newNHLplayoffSeries: IPlayoffSeries[]): void {
    // console.log('[storage.service] storePlayoffSeriesToLocalStorage()');
    try {
      const configText = JSON.stringify(newNHLplayoffSeries);
      localStorage.setItem('NHLplayoffSeries', configText);
    } catch (e) {
      console.warn('[storage.service] storePlayoffSeriesToLocalStorage() Error reading from local storage');
    }
  }
}
