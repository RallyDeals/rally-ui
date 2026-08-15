import { Component, ElementRef, HostListener, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { BuyerStatus, UserType } from '../../../../shared/models/user';

const PANEL_WIDTH = 256;

@Component({
  selector: 'app-user-toolbar',
  imports: [],
  templateUrl: './user-toolbar.html',
})
export class UserToolbar {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly filterButton = viewChild<ElementRef<HTMLButtonElement>>('filterButton');

  search = input('');
  selectedTypes = input<ReadonlySet<UserType>>(new Set());
  selectedStatuses = input<ReadonlySet<BuyerStatus>>(new Set());

  searchChange = output<string>();
  typesChange = output<Set<UserType>>();
  statusesChange = output<Set<BuyerStatus>>();

  open = signal(false);
  panelPosition = signal({ top: 0, left: 0 });

  readonly isAllSelected = computed(() => this.selectedTypes().size === 0 && this.selectedStatuses().size === 0);
  readonly activeCount = computed(() => this.selectedTypes().size + this.selectedStatuses().size);

  toggleOpen = () => {
    const next = !this.open();
    this.open.set(next);
    if (next) {
      this.updatePosition();
    }
  };

  close = () => {
    this.open.set(false);
  };

  private updatePosition() {
    const button = this.filterButton()?.nativeElement;
    if (!button) {
      return;
    }
    const rect = button.getBoundingClientRect();
    this.panelPosition.set({ top: rect.bottom + 4, left: rect.right - PANEL_WIDTH });
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onViewportChange() {
    if (this.open()) {
      this.close();
    }
  }

  isTypeChecked = (type: UserType) => this.selectedTypes().has(type);
  isStatusChecked = (status: BuyerStatus) => this.selectedStatuses().has(status);

  toggleType = (type: UserType) => {
    const next = new Set(this.selectedTypes());
    if (next.has(type)) {
      next.delete(type);
    } else {
      next.add(type);
    }
    this.typesChange.emit(next);
  };

  toggleStatus = (status: BuyerStatus) => {
    const next = new Set(this.selectedStatuses());
    if (next.has(status)) {
      next.delete(status);
    } else {
      next.add(status);
    }
    this.statusesChange.emit(next);
  };

  selectAll = () => {
    this.typesChange.emit(new Set());
    this.statusesChange.emit(new Set());
  };

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
