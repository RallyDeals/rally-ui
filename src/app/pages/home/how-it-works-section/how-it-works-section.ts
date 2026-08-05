import { Component } from '@angular/core';

interface Step {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-how-it-works-section',
  imports: [],
  templateUrl: './how-it-works-section.html',
})
export class HowItWorksSection {
  steps: Step[] = [
    {
      icon: 'shopping_bag',
      title: '1. Join a Deal',
      description:
        'Find an active product deal that you love and commit to buying it at the current tier price.',
    },
    {
      icon: 'share',
      title: '2. Share with Friends',
      description:
        'Share your unique link on social media or with friends. Every new joiner pushes the price closer to the next discount tier.',
    },
    {
      icon: 'lock_open_right',
      title: '3. Unlock Discount',
      description:
        'Once the timer ends, everyone pays the final, lowest unlocked price. The product ships directly to you.',
    },
  ];
}
