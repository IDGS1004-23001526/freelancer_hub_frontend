const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api\/?$/, '');

export const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'><rect width='128' height='128' rx='64' fill='%23F3EFE6'/><circle cx='64' cy='46' r='22' fill='%238C2C45'/><path d='M24 114c0-22 18-36 40-36s40 14 40 36' fill='%238C2C45'/></svg>";

export function resolveAvatarUrl(url?: string | null): string {
  if (!url || url === '/avatar-sample.jpg') return DEFAULT_AVATAR;
  if (url.startsWith('/uploads/')) return `${API_ORIGIN}${url}`;
  return url;
}
