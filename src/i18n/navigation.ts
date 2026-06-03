import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Locale-aware navigation — use these instead of next/navigation
// in any component that needs locale switching or locale-prefixed links.
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
