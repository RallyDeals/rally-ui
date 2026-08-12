import { environment } from '../../../environments/environment';

export function resolveImageUrl(url: string | null | undefined, fallback?: string): string {
  if (!url) {
    return fallback ?? '';
  }
  return url.startsWith('/') ? `${environment.apiUrl}${url}` : url;
}
