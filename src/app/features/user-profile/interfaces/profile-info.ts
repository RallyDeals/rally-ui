export interface ProfileField {
  label: string;
  value: string;
  icon?: string;
}

export interface ProfileInfo {
  avatarUrl: string;
  avatarAlt: string;
  joinedLabel: string;
  totalDealsJoined: number;
  totalOrdersMade: number;
  fields: ProfileField[];
}
