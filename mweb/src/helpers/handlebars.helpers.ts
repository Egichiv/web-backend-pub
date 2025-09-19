import hbs from 'hbs';

export function registerHandlebarsHelpers(): void {
  // Хелпер для сравнения значений
  hbs.registerHelper('eq', function (a: any, b: any): boolean {
    return a === b;
  });

  // Хелпер для логического ИЛИ
  hbs.registerHelper('or', function (...args: any[]): boolean {
    // Проверяем все аргументы кроме последнего
    for (let i = 0; i < args.length - 1; i++) {
      if (args[i]) {
        return true;
      }
    }
    return false;
  });

  // Хелпер для форматирования даты
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

  // Хелпер для определения CSS класса жанра
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

  // Хелпер для обрезки текста
  hbs.registerHelper(
    'truncate',
    function (text: string, length: number): string {
      if (!text || text.length <= length) return text;
      return text.substring(0, length) + '...';
    },
  );

  // Хелпер для подсчета элементов
  hbs.registerHelper('count', function (array: any[]): number {
    return array ? array.length : 0;
  });

  // Хелпер для проверки наличия следующей страницы
  hbs.registerHelper(
    'hasNext',
    function (current: number, total: number): boolean {
      return current < total;
    },
  );

  // Хелпер для проверки наличия предыдущей страницы
  hbs.registerHelper('hasPrev', function (current: number): boolean {
    return current > 1;
  });

  // Хелпер для увеличения числа на 1
  hbs.registerHelper('inc', function (value: number): number {
    return value + 1;
  });

  // Хелпер для уменьшения числа на 1
  hbs.registerHelper('dec', function (value: number): number {
    return value - 1;
  });

  // Хелпер для дебага (выводит значение в консоль)
  hbs.registerHelper('debug', function (value: any): void {
    console.log('Debug:', value);
  });
}
