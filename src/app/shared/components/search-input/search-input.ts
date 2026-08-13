import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-search-input',
  imports: [],
  templateUrl: './search-input.html',
})
export class SearchInput {
  value = input('');
  placeholder = input('Search...');
  valueChange = output<string>();
  clear = output<void>();
}
