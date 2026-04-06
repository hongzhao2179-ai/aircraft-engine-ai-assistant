import React from 'react';
import { Menu, Plus, User as UserIcon } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface HeaderProps {
  onToggleSidebar: () => void;
  user?: User | null;
  onLoginClick?: () => void;
  onNewChat?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, user, onLoginClick, onNewChat }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between h-16 px-4 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="flex items-center space-x-4">
        <button onClick={onToggleSidebar} className="p-2 rounded-md hover:bg-gray-100">
          <Menu size={20} />
        </button>
        <div className="flex items-center space-x-2">
          <span className="text-xl">✈️</span>
          <h1 className="text-lg font-semibold text-gray-800">AeroMaint Copilot</h1>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button 
          onClick={onNewChat}
          className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          <span>New Chat</span>
        </button>
        {user ? (
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold text-sm" title={user.email}>
            {user.email?.charAt(0).toUpperCase()}
          </div>
        ) : (
          <button onClick={onLoginClick} className="p-2 rounded-full hover:bg-gray-100" title="登录">
            <UserIcon size={20} />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
