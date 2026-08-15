import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Category } from '../../../../shared/models/category';

@Component({
  selector: 'tr[app-category-row]',
  imports: [DecimalPipe],
  templateUrl: './category-row.html',
})
export class CategoryRow {
  category = input.required<Category>();
}
