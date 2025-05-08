'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, Cog6ToothIcon, ShoppingBagIcon, CalendarIcon, TagIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const nav = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Machines', href: '/laundromats', icon: Cog6ToothIcon },
  { name: 'Supplies', href: '/supplies', icon: ShoppingBagIcon },
  { name: 'Orders', href: '/orders', icon: CalendarIcon },
  { name: 'Deals', href: '/deals', icon: TagIcon },
  { name: 'Account', href: '/account', icon: UserCircleIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="h-screen w-20 bg-white border-r flex flex-col items-center py-6 fixed top-0 left-0 z-30 shadow-md">
      <div className="mb-8">
        <img src="/auro-logo.svg" alt="Auro Logo" className="w-10 h-10" />
      </div>
      <nav className="flex flex-col gap-6 flex-1">
        {nav.map(item => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link key={item.name} href={item.href} className="group">
              <item.icon
                className={`w-7 h-7 mx-auto ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'} transition-colors`}
              />
              <span className={`block mt-1 text-xs text-center ${active ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
} 