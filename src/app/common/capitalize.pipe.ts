import { Pipe, PipeTransform } from '@angular/core';
import { stringToKeyValue } from '@angular/flex-layout/extended/typings/style/style-transforms';

@Pipe({
  name: 'capitalize'
})
export class CapitalizePipe implements PipeTransform {

  transform(value: string): string {
    const vals = value.split(' ');
    let retVal: string = '';

    vals.forEach(val => {
      val = val.charAt(0).toUpperCase() + val.substr(1).toLowerCase() + ' ';
      retVal += val;
    });
    return retVal.slice(0, -1);
  }
}
