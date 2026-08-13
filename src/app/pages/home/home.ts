import { Component } from '@angular/core';
import { HeroSection } from './hero-section/hero-section';
import { StatsSection } from './stats-section/stats-section';
import { HowItWorksSection } from './how-it-works-section/how-it-works-section';
import { FeaturedDealsSection } from './featured-deals-section/featured-deals-section';
import { NewsletterSection } from './newsletter-section/newsletter-section';

@Component({
  selector: 'app-home',
  imports: [HeroSection, StatsSection, HowItWorksSection, FeaturedDealsSection, NewsletterSection],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
