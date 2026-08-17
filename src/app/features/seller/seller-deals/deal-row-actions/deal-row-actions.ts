import { Component, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconButton } from '../../../../shared/components/icon-button/icon-button';

interface MenuPosition {
  x: number;
  y: number;
}

const MENU_WIDTH = 192; // matches the menu's w-48

@Component({
  selector: 'app-deal-row-actions',
  imports: [IconButton, RouterLink],
  templateUrl: './deal-row-actions.html',
})
export class DealRowActions {
  editLink = input.required<string | unknown[]>();
  // A deal can only be edited/deleted while it's still pending — once it goes
  // active (or beyond), it has participants and a running clock, so both actions close.
  editable = input(false);
  delete = output<void>();

  readonly open = signal(false);
  readonly position = signal<MenuPosition>({ x: 0, y: 0 });

  toggle = (event: Event) => {
    if (!(event.currentTarget instanceof HTMLButtonElement)) {
      return;
    }
    if (this.open()) {
      this.open.set(false);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Right-align the menu with the trigger button so it opens toward the row's
    // content instead of spilling past the table's right edge.
    const x =
      rect && isFinite(rect.right) && rect.right > 0
        ? Math.max(8, rect.right - MENU_WIDTH)
        : Math.max(8, vw - MENU_WIDTH - 8);
    const y =
      rect && isFinite(rect.bottom) && rect.bottom > 0
        ? Math.min(rect.bottom + 4, vh - 130)
        : 8;
    this.position.set({ x, y });
    this.open.set(true);
  };

  close = () => {
    this.open.set(false);
  };

  onDelete = () => {
    this.open.set(false);
    this.delete.emit();
  };
}
