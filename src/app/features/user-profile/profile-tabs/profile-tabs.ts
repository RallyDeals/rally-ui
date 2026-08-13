import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ProfileTab } from '../interfaces/profile-tab';

@Component({
  selector: 'app-profile-tabs',
  imports: [NgClass, RouterLink, RouterLinkActive],
  templateUrl: './profile-tabs.html',
})
export class ProfileTabs {
  tabs = input.required<ProfileTab[]>();
}
