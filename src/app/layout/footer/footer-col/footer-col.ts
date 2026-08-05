import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

interface FooterColItem {
  text: string;
  route: string;
}

@Component({
  selector: 'app-footer-col',
  imports: [RouterLink],
  templateUrl: './footer-col.html',
})
export class FooterCol {
  title = input<string>();
  items = input<FooterColItem[]>();
}
