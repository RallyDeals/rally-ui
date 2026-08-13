import { ApiError } from '../models/api-error';

export interface ErrorDisplay {
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  actionLink?: string;
}

export function getErrorDisplay(error: ApiError): ErrorDisplay {
  switch (error.status) {
    case 401:
      return {
        icon: 'lock',
        title: 'Sign in required',
        message: 'You need to sign in to view this.',
        actionLabel: 'Sign in',
        actionLink: '/auth/login',
      };
    case 403:
      return {
        icon: 'block',
        title: 'Access denied',
        message: "You don't have permission to view this.",
      };
    case 404:
      return {
        icon: 'search_off',
        title: 'Not found',
        message: "We couldn't find what you're looking for.",
      };
    default:
      return {
        icon: 'error',
        title: 'Something went wrong',
        message: error.message || 'Please try again later.',
      };
  }
}
