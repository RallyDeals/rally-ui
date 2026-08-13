import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../models/api-error';

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

export function toApiError(err: unknown): ApiError {
  if (err instanceof HttpErrorResponse) {
    const backendError = err.error?.error;
    if (backendError?.message && backendError?.status) {
      return backendError as ApiError;
    }
    return {
      message: err.error?.message ?? FALLBACK_MESSAGE,
      path: err.url ?? '',
      status: err.status,
      timestamp: new Date().toISOString(),
      title: err.message || 'Error',
    };
  }
  return {
    message: FALLBACK_MESSAGE,
    path: '',
    status: 0,
    timestamp: new Date().toISOString(),
    title: 'Error',
  };
}
