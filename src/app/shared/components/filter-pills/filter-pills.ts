import { Component, input, output } from '@angular/core';

export interface FilterPillOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-filter-pills',
  imports: [],
  templateUrl: './filter-pills.html',
})
export class FilterPills {
  options = input.required<FilterPillOption[]>();
  selected = input.required<string>();
  selectedChange = output<string>();

  select = (value: string) => {
    if (value !== this.selected()) {
      this.selectedChange.emit(value);
    }
  };
}
