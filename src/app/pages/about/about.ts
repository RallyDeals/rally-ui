import { Component } from '@angular/core';
import { AboutHero } from './about-hero/about-hero';
import { AboutStory } from './about-story/about-story';
import { AboutValues } from './about-values/about-values';

@Component({
  selector: 'app-about',
  imports: [AboutHero, AboutStory, AboutValues],
  templateUrl: './about.html',
})
export class About {}
