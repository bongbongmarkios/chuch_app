'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music, ListOrdered, BookOpenText } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/hymnal', label: 'Hymnal', icon: Music },
  { href: '/readings', label: 'Readings', icon: BookOpenText },
  { href: '/program', label: 'Program', icon: ListOrdered },
];

export default function BottomNavigationBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 shadow-xl h-16 sm:h-20 flex justify-around items-center z-30 print:hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-white/70 dark:from-slate-800/90 dark:to-slate-800/70"></div>
      <div className="relative flex justify-around items-center w-full h-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + (item.href.endsWith('/') ? '' : '/')));
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              prefetch={true}
              className={cn(
                "flex flex-col items-center justify-center text-xs font-medium transition-all duration-200 w-1/3 h-full relative group",
                isActive 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 sm:w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
              )}
              
              {/* Icon Container */}
              <div className={cn(
                "p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-200 mb-0.5 sm:mb-1",
                isActive 
                  ? "bg-blue-100 dark:bg-blue-900/30 shadow-sm" 
                  : "group-hover:bg-slate-100 dark:group-hover:bg-slate-700/50"
              )}>
                <item.icon 
                  className={cn(
                    "h-4 w-4 sm:h-5 sm:w-5 transition-all duration-200",
                    isActive ? "scale-110" : "group-hover:scale-105"
                  )} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
              </div>
              
              {/* Label */}
              <span className={cn(
                "text-xs font-medium transition-all duration-200",
                isActive ? "scale-105" : "group-hover:scale-105"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
