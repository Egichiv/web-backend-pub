import hbs from 'hbs';

export function registerHandlebarsHelpers(): void {
  hbs.registerHelper('eq', function (a: any, b: any): boolean {
    return a === b;
  });

  hbs.registerHelper('or', function (...args: any[]): boolean {
    // Проверяем все аргументы кроме последнего
    for (let i = 0; i < args.length - 1; i++) {
      if (args[i]) {
        return true;
      }
    }
    return false;
  });

  hbs.registerHelper('formatDate', function (date: Date | string): string {
    if (!date) return '';

    const dateObj = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    return dateObj.toLocaleDateString('ru-RU', options);
  });

  hbs.registerHelper('genreClass', function (genre: string): string {
    const genreClasses: Record<string, string> = {
      Умная: 'smart',
      Мотивирующая: 'motivating',
      Реалистичная: 'realistic',
      Смешная: 'funny',
      smart: 'smart',
      motivating: 'motivating',
      realistic: 'realistic',
      funny: 'funny',
    };

    return genreClasses[genre] || 'default';
  });

  hbs.registerHelper(
    'truncate',
    function (text: string, length: number): string {
      if (!text || text.length <= length) return text;
      return text.substring(0, length) + '...';
    },
  );

  hbs.registerHelper('count', function (array: any[]): number {
    return array ? array.length : 0;
  });

  hbs.registerHelper(
    'hasNext',
    function (current: number, total: number): boolean {
      return current < total;
    },
  );

  hbs.registerHelper('hasPrev', function (current: number): boolean {
    return current > 1;
  });

  hbs.registerHelper('inc', function (value: number): number {
    return value + 1;
  });

  hbs.registerHelper('dec', function (value: number): number {
    return value - 1;
  });

  hbs.registerHelper('debug', function (value: any): void {
    console.log('Debug:', value);
  });

  hbs.registerHelper('formatDate', function(date: Date) {
    if (!date) return 'Неизвестно';

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Moscow'
    };

    return new Intl.DateTimeFormat('ru-RU', options).format(new Date(date));
  });

  hbs.registerHelper('eq', function(a: any, b: any) {
    return a === b;
  });

  hbs.registerHelper('or', function(a: any, b: any) {
    return a || b;
  });

  hbs.registerHelper('and', function(a: any, b: any) {
    return a && b;
  });

  hbs.registerHelper('contains', function(str: string, substr: string) {
    return str && str.includes(substr);
  });

  hbs.registerHelper('truncate', function(str: string, length: number) {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
  });

  hbs.registerHelper('timeAgo', function(date: Date) {
    if (!date) return 'Неизвестно';

    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Менее часа назад';
    if (diffHours < 24) return `${diffHours} ч. назад`;
    if (diffDays < 30) return `${diffDays} д. назад`;

    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  });

  hbs.registerHelper('pluralize', function(count: number, one: string, few: string, many: string) {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return many;
    if (lastDigit === 1) return one;
    if (lastDigit >= 2 && lastDigit <= 4) return few;
    return many;
  });
}
