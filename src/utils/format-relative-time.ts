import type { Language } from '@/constants/theme';

/**
 * Compose a compact "… ago" label (e.g. "2m ago", "Yesterday", "3d ago") the
 * way the Figma activity line shows it ("Sam added 3 items · 2m ago"). Falls
 * back to a plain date for anything older than a week.
 */
export function formatRelativeTime(iso: string, language: Language): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) {
    return '';
  }
  const now = Date.now();
  const diffMs = Math.max(0, now - then);
  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(diffMs / 86_400_000);

  if (minutes < 1) {
    return language === 'ar' ? 'الآن' : 'Just now';
  }
  if (minutes < 60) {
    return language === 'ar' ? `منذ ${minutes} د` : `${minutes}m ago`;
  }
  if (hours < 24) {
    return language === 'ar' ? `منذ ${hours} س` : `${hours}h ago`;
  }
  if (days === 1) {
    return language === 'ar' ? 'أمس' : 'Yesterday';
  }
  if (days < 7) {
    return language === 'ar' ? `منذ ${days} أيام` : `${days}d ago`;
  }
  const date = new Date(then);
  const formatted = new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-GB', {
    month: 'short',
    day: 'numeric',
  }).format(date);
  return formatted;
}