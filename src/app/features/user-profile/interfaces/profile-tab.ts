export type ProfileTabId = 'info' | 'orders' | 'deals' | 'cards';

export interface ProfileTab {
  id: ProfileTabId;
  label: string;
}
