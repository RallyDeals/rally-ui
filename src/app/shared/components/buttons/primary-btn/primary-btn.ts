import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-primary-btn',
  imports: [RouterLink],
  templateUrl: './primary-btn.html',
  styleUrl: './primary-btn.css',
})
export class PrimaryBtn {
  content = input.required<string>();
  type = input.required<string>();
}
