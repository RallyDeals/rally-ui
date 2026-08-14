import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-primary-btn',
  imports: [NgClass, RouterLink],
  templateUrl: './primary-btn.html',
})
export class PrimaryBtn {
  content = input.required<string>();
  type = input<'button' | 'submit'>('button');
  bgClass = input('bg-primary');
  routerLink = input<string>();
  icon = input<string>();
  extraClasses = input('');
  disabled = input(false);
  clicked = output<void>();
}
