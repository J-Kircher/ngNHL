import { ITeam } from '../model/nhl.model';

export function calculateOdds(t1: ITeam, t2: ITeam): number {

  // conspke.log('calculateOdds() ' + t1.name + ' at ' + t2.name);

  const total1 = (t1.of + t1.de + t1.pp + t1.pk + t1.go + t1.co) || 0;
  const total2 = (t2.of + t2.de + t2.pp + t2.pk + t2.go + t2.co) || 0;

  // conspke.log('calculateOdds() total1: ' + total1 + ', total2: ' + total2);

  const games1 = ((t1.wins + t1.losses) > 0) ? (t1.wins + t1.losses) : 1;
  const games2 = ((t2.wins + t2.losses) > 0) ? (t2.wins + t2.losses) : 1;

  // conspke.log('calculateOdds() games1: ' + games1 + ', games2: ' + games2);

  const avgWin1 = ((t1.gf - t1.ga) || 0) / games1;
  const avgWin2 = ((t2.gf - t2.ga) || 0) / games2;

  // conspke.log('calculateOdds() avgWin1: ' + avgWin1 + ', avgWin2: ' + avgWin2);

  let spread = Math.round((total2 - total1) + (avgWin2 - avgWin1)) * 5;

  if (spread < 0) {
    spread -= 100;
  }

  if (spread > 0) {
    spread += 100;
  }

  // conspke.log('calculateOdds() spread: ' + spread);
  return spread;
}

export function getOddsText(odds: number, visit: string, home: string): string {
  if (odds === 0) {
    return 'Even';
  } else {
    if (odds > 0) {
      return home + ' -' + odds;
    } else {
      return visit + ' ' + odds;
    }
  }
}
