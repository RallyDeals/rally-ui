import { Component, input } from '@angular/core';
import { ProfileField } from '../../interfaces/profile-info';

@Component({
  selector: 'app-info-field',
  imports: [],
  templateUrl: './info-field.html',
})
export class InfoField {
  field = input.required<ProfileField>();
}
