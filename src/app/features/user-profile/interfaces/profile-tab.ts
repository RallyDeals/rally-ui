export type ProfileTabId = 'personal-info' | 'my-orders' | 'my-deals';

export interface ProfileTab {
  id: ProfileTabId;
  label: string;
}
