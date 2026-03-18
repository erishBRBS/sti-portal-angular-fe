export class DateHelper {
  static formatDateTime(value: string | Date): string {
    if (!value) return '';

    const date = new Date(value);

    if (isNaN(date.getTime())) return '';

    const datePart = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const timePart = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    return `${datePart} • ${timePart}`;
  }
}