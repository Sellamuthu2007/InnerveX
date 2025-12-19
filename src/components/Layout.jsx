import React from 'react';
import { cn } from '../lib/utils';

const Layout = ({ children, className }) => {
  return (
    <div className="min-h-screen bg-black text-white flex justify-center overflow-x-hidden">
      <div className={cn(
        "w-full max-w-md bg-black min-h-screen relative flex flex-col",
        className
      )}>
        {children}
      </div>
    </div>
  );
};

export default Layout;
