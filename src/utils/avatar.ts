const DEFAULT_API_BASE: string = import.meta.env.VITE_API_URL || 'https://api.freelancerhub.org/api';
const API_ORIGIN = DEFAULT_API_BASE.replace(/\/api\/?$/, '');

export const DEFAULT_AVATAR = '/avatar-sample.jpg';

export function resolveAvatarUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url === '/avatar-sample.jpg') return '/avatar-sample.jpg';
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/')) return `${API_ORIGIN}${url}`;
  if (url.startsWith('uploads/')) return `${API_ORIGIN}/${url}`;
  if (url.startsWith('/')) return `${API_ORIGIN}${url}`;
  return `${API_ORIGIN}/${url}`;
}

export function getAvatarInitials(name?: string | null): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase() || 'U';
}
