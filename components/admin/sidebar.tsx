'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderOpen, Tag, Share2, X, ChevronLeft, ChevronRight, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/projects', icon: FolderOpen, label: 'Projects' },
  { href: '/admin/categories', icon: Tag, label: 'Categories' },
  { href: '/admin/sharing', icon: Share2, label: 'Share Portfolio' },
  { href: '/admin/profile', icon: UserCircle, label: 'Profile' },
];

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function AdminSidebar({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <motion.aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 bg-card border-r border-border flex flex-col transition-all duration-300 lg:relative lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className={cn(
        "p-6 border-b border-border flex items-center transition-all duration-300",
        isCollapsed ? "justify-center px-4" : "justify-between"
      )}>
        <Link href="/admin/dashboard" className="flex items-center space-x-2 overflow-hidden">
          <div className="min-w-[32px] w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="font-bold text-primary text-sm">IC</span>
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap"
              >
                <h1 className="font-bold text-foreground">Portfolio</h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Admin</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden" 
          onClick={() => setIsOpen(false)}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <motion.div key={item.href} whileHover={{ x: isCollapsed ? 0 : 4 }}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center rounded-lg transition-all duration-300',
                  isCollapsed ? 'justify-center p-3' : 'px-4 py-3 space-x-3',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
                title={isCollapsed ? item.label : ''}
              >
                <Icon className={cn("w-5 h-5 min-w-[20px]", isActive ? "text-primary" : "")} />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Collapse Toggle Button (Desktop Only) */}
      <div className="hidden lg:block p-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full flex items-center justify-center hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span className="text-xs font-medium">Collapse Sidebar</span>
            </>
          )}
        </Button>
      </div>

      <div className={cn(
        "p-4 border-t border-border transition-all duration-300",
        isCollapsed ? "text-center" : ""
      )}>
        <p className="text-[10px] text-muted-foreground truncate">
          {isCollapsed ? "v1" : "Admin v1.0"}
        </p>
      </div>
    </motion.aside>
  );
}
