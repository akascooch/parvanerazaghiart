'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/admin', label: 'Dashboard', enabled: true },
  { href: '/admin/artworks', label: 'Collection', enabled: true },
  { href: '/admin/categories', label: 'Categories', enabled: true },
  { href: '/admin/inquiries', label: 'Enquiries', enabled: true },
  { href: '/admin/media', label: 'Media', enabled: false },
];

function isActive(pathname: string, href: string) {
  if (href === '/admin') {
    return pathname === '/admin';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({ orientation = 'vertical' }: { orientation?: 'vertical' | 'horizontal' }) {
  const pathname = usePathname();
  const layout =
    orientation === 'horizontal'
      ? 'flex items-center gap-1 overflow-x-auto'
      : 'space-y-1';

  return (
    <nav className={`${layout} text-sm`} aria-label="Admin">
      {links.map((link) => {
        const active = isActive(pathname, link.href);
        if (!link.enabled) {
          return (
            <span
              key={link.href}
              className="block whitespace-nowrap px-3 py-2 text-white/30"
              title="Available in a later phase"
            >
              {link.label}
            </span>
          );
        }
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`block whitespace-nowrap px-3 py-2 ${
              active
                ? 'bg-white/10 text-[#f5f0e8]'
                : 'text-white/70 hover:bg-white/5 hover:text-[#f5f0e8]'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
