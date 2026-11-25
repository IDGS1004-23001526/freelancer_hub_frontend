const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api\/?$/, '');

export function resolveAvatarUrl(url?: string | null): string {
  if (!url) return '/avatar-sample.jpg';
  if (url.startsWith('/uploads/')) return `${API_ORIGIN}${url}`;
  return url;
}
