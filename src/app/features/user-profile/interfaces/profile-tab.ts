export type ProfileTabId = 'info' | 'orders' | 'deals' | 'cards' | 'security';

export interface ProfileTab {
  id: ProfileTabId;
  label: string;
}
