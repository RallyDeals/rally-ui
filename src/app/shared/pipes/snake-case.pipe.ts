import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'snakeCase', standalone: true })
export class SnakeCasePipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) return '';
    return value
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
