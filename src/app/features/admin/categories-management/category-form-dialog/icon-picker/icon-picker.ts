import { Component, ElementRef, HostListener, computed, inject, input, output, signal } from '@angular/core';
import { MATERIAL_SYMBOLS_ICONS } from './material-symbols-icons';

const MAX_SEARCH_RESULTS = 60;

const DEFAULT_ICONS: string[] = [
  'category',
  'devices',
  'computer',
  'smartphone',
  'tv',
  'headphones',
  'camera_alt',
  'checkroom',
  'style',
  'shopping_bag',
  'shoe_cleats',
  'chair',
  'home',
  'kitchen',
  'yard',
  'cleaning_services',
  'construction',
  'fitness_center',
  'sports_esports',
  'sports_soccer',
  'sports_basketball',
  'pedal_bike',
  'hiking',
  'directions_car',
  'flight',
  'face_2',
  'spa',
  'toys',
  'pets',
  'menu_book',
  'watch',
  'diamond',
  'redeem',
  'cake',
  'restaurant',
  'local_cafe',
  'local_bar',
  'local_grocery_store',
  'medical_services',
  'celebration',
  'palette',
  'brush',
  'music_note',
  'umbrella',
  'star',
  'favorite',
  'eco',
  'park',
  'inventory_2',
];

@Component({
  selector: 'app-icon-picker',
  imports: [],
  templateUrl: './icon-picker.html',
})
export class IconPicker {
  selected = input('');
  placeholder = input('Choose icon');
  selectedChange = output<string>();

  private readonly host = inject(ElementRef<HTMLElement>);

  open = signal(false);
  query = signal('');

  private readonly searchMatches = computed(() => {
    const query = this.query().trim().toLowerCase();
    if (!query) {
      return DEFAULT_ICONS;
    }
    return MATERIAL_SYMBOLS_ICONS.filter((icon) => icon.toLowerCase().includes(query));
  });

  readonly filteredIcons = computed(() => this.searchMatches().slice(0, MAX_SEARCH_RESULTS));
  readonly resultCount = computed(() => this.searchMatches().length);

  toggle = () => {
    this.open.update((value) => !value);
    if (!this.open()) {
      this.query.set('');
    }
  };

  choose = (icon: string) => {
    this.selectedChange.emit(icon);
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
