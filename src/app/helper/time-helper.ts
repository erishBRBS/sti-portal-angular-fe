export class TimeHelper {

  static formatTo12Hour(time: string): string {
    if (!time) return '';

    const [hourStr, minuteStr] = time.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = minuteStr;

    const ampm = hour >= 12 ? 'PM' : 'AM';

    hour = hour % 12;
    hour = hour ? hour : 12; // 0 → 12

    return `${hour}:${minute} ${ampm}`;
  }

}