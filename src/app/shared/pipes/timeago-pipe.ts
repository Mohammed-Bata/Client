import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeago'
})
export class TimeagoPipe implements PipeTransform {

  transform(value: string | Date | undefined | null): string {
    if (!value) return '';

    const date = new Date(value);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 29) return 'Just now';
    
    const intervals: { [key: string]: number } = {
      'year': 31536000,
      'month': 2592000,
      'week': 604800,
      'day': 86400,
      'hour': 3600,
      'minute': 60,
      'second': 1
    };

    for (const name in intervals) {
      const counter = Math.floor(seconds / intervals[name]);
      if (counter > 0) {
        return counter === 1 ? `1 ${name} ago` : `${counter} ${name}s ago`;
      }
    }
    return 'Just now';
  }

}
