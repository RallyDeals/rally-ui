import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { ProfileTab, ProfileTabId } from '../interfaces/profile-tab';

@Component({
  selector: 'app-profile-tabs',
  imports: [NgClass],
  templateUrl: './profile-tabs.html',
})
export class ProfileTabs {
  tabs = input.required<ProfileTab[]>();
  activeTab = input.required<ProfileTabId>();
  setActiveTab = input.required<(tab: ProfileTabId) => void>();
}
