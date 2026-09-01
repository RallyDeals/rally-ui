import { Component, input, Signal } from '@angular/core';

@Component({
  selector: 'app-profile-summary',
  imports: [],
  templateUrl: './profile-summary.html',
})
export class ProfileSummary {
  avatarUrl = input.required<string | null>();
  avatarAlt = input.required<string|null>();
  name = input.required<string|null>();
}
