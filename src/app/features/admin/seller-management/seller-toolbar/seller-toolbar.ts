import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-seller-toolbar',
  imports: [],
  templateUrl: './seller-toolbar.html',
})
export class SellerToolbar {
  search = input('');
  searchChange = output<string>();
}
