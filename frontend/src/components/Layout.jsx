import React from 'react';
import { cn } from '../lib/utils';
import { Sun, Moon } from 'lucide-react';
import { useStore } from '../lib/store';

const Layout = ({ children, className }) => {
  const { theme, toggleTheme } = useStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-neutral-900 dark:text-white flex justify-center overflow-x-hidden transition-colors duration-300 relative">
      <div className={cn(
        "w-full max-w-md bg-white dark:bg-black min-h-screen relative flex flex-col shadow-xl dark:shadow-none transition-colors duration-300",
        className
      )}>
        {children}

        {/* Global Floating Theme Toggler */}
        <button
          onClick={toggleTheme}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-neutral-900 dark:bg-neutral-800 text-white shadow-lg border border-neutral-800 hover:scale-110 active:scale-95 transition-all z-50 flex items-center justify-center"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-blue-400" />}
        </button>
      </div>
    </div>
  );
};

export default Layout;
