import { BuyerStatus, UserType } from '../../../shared/models/user';

export interface UserQueryParams {
  search?: string;
  types?: UserType[];
  statuses?: BuyerStatus[];
  page?: number;
  limit?: number;
}
