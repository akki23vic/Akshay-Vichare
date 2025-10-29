import React from 'react';
import { MenuIcon, CodeIcon } from './IconComponents';

interface HeaderProps {
  topicName: string;
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ topicName, toggleSidebar }) => {
  return (
    <header className="flex-shrink-0 glass-pane flex items-center justify-between p-4 sm:p-2 border-b border-gray-500/20">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="lg:hidden text-gray-300 hover:text-white mr-4 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Open sidebar"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
        <div className="hidden sm:flex items-center gap-3">
          <CodeIcon className="h-8 w-8 text-primary-400" />
          <h1 className="text-xl font-bold text-gray-50" style={{textShadow: '0 0 5px rgba(255,255,255,0.3)'}}>AI Programming Tutor</h1>
        </div>
      </div>
      <h2 className="text-lg font-semibold text-gray-200 truncate px-4">{topicName}</h2>
    </header>
  );
};