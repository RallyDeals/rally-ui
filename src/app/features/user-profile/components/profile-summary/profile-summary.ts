import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-profile-summary',
  imports: [],
  templateUrl: './profile-summary.html',
})
export class ProfileSummary {
  avatarUrl = input.required<string>();
  avatarAlt = input.required<string>();
  name = input.required<string>();
  logout = output<void>();
}
