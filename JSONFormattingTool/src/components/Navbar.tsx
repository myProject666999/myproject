'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Code2, GitCompare, History } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: '编辑器', icon: Code2 },
    { href: '/diff', label: 'Diff对比', icon: GitCompare },
    { href: '/history', label: '历史记录', icon: History },
  ];

  return (
    <nav className="bg-surface border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Code2 className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-text-primary">
              JSON格式化工具
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link flex items-center gap-2 ${
                    isActive ? 'active' : ''
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
