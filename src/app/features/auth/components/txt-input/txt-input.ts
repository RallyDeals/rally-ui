import { Component, input } from '@angular/core';

@Component({
  selector: 'app-txt-input',
  imports: [],
  templateUrl: './txt-input.html',
  styleUrl: './txt-input.css',
})
export class TxtInput {
  label = input.required<string>();
  symbol = input.required<string>();
  type = input.required<string>();
  placeholder = input.required<string>();
  name = input.required<string>();
  id = input.required<string>();
}
