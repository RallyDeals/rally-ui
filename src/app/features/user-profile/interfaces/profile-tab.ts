export type ProfileTabId = 'personal-info' | 'my-orders' | 'my-deals' | 'my-payment-methods';

export interface ProfileTab {
  id: ProfileTabId;
  label: string;
}
