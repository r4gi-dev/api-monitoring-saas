'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, AlertTriangle } from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Home", icon: <Home size={20} /> },
    { href: "/dashboard/errors", label: "Errors", icon: <AlertTriangle size={20} /> },
  ];

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col p-4">
      <div className="mb-8 px-2">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">API Monitor</h2>
      </div>
      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-50"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
