import { Component, ElementRef, HostListener, computed, inject, input, output, signal } from '@angular/core';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-searchable-select',
  imports: [],
  templateUrl: './searchable-select.html',
})
export class SearchableSelect {
  options = input.required<SelectOption[]>();
  selected = input('');
  placeholder = input('All');
  searchPlaceholder = input('Search...');
  selectedChange = output<string>();

  private readonly host = inject(ElementRef<HTMLElement>);

  open = signal(false);
  query = signal('');

  readonly selectedLabel = computed(
    () => this.options().find((option) => option.value === this.selected())?.label ?? '',
  );

  readonly filteredOptions = computed(() => {
    const query = this.query().trim().toLowerCase();
    const options = this.options();
    if (!query) {
      return options;
    }
    return options.filter((option) => option.label.toLowerCase().includes(query));
  });

  toggle = () => {
    this.open.update((value) => !value);
    if (!this.open()) {
      this.query.set('');
    }
  };

  choose = (value: string) => {
    this.selectedChange.emit(value);
    this.close();
  };

  close = () => {
    this.open.set(false);
    this.query.set('');
  };

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
