'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderOpen, Tag, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/projects', icon: FolderOpen, label: 'Projects' },
  { href: '/admin/categories', icon: Tag, label: 'Categories' },
  { href: '/admin/sharing', icon: Share2, label: 'Share Portfolio' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 bg-card border-r border-border flex flex-col"
    >
      <div className="p-6 border-b border-border">
        <Link href="/admin/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="font-bold text-primary">IC</span>
          </div>
          <div>
            <h1 className="font-bold text-foreground">Portfolio</h1>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <motion.div key={item.href} whileHover={{ x: 4 }}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Portfolio Management System v1.0
        </p>
      </div>
    </motion.aside>
  );
}
