import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  imports: [],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class Pagination {
  page = input.required<number>();
  totalPages = input.required<number>();
  compact = input(false);
  pageChange = output<number>();

  pages = computed<(number | '...')[]>(() => {
    const total = this.totalPages();
    if (total <= 7) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }
    const current = this.page();
    const anchors = new Set([1, 2, current - 1, current, current + 1, total - 1, total]);
    const result: (number | '...')[] = [];
    let previous = 0;
    for (let pageNumber = 1; pageNumber <= total; pageNumber++) {
      if (anchors.has(pageNumber)) {
        if (pageNumber - previous > 1) {
          result.push('...');
        }
        result.push(pageNumber);
        previous = pageNumber;
      }
    }
    return result;
  });

  goToPage = (item: number | '...') => {
    if (typeof item !== 'number') {
      return;
    }
    if (item < 1 || item > this.totalPages() || item === this.page()) {
      return;
    }
    this.pageChange.emit(item);
  };
}
