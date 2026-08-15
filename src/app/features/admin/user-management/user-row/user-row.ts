import { Component, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { User } from '../../../../shared/models/user';

@Component({
  selector: 'tr[app-user-row]',
  imports: [DatePipe],
  templateUrl: './user-row.html',
})
export class UserRow {
  user = input.required<User>();
  toggleStatus = output<User>();

  readonly initials = computed(() =>
    this.user()
      .name.split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase(),
  );
}
