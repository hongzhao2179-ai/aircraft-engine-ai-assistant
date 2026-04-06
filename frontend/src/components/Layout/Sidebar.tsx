import React from 'react';
import {
  Wrench, Droplets, Zap, PlaneTakeoff, Book, Settings, HelpCircle, LogOut, Trash2, MessageSquare
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { ChatSession } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  onLogout?: () => void;
  onClearChat?: () => void;
  sessions?: ChatSession[];
  currentSessionId?: string | null;
  onSwitchSession?: (sessionId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  onLogout, 
  onClearChat,
  sessions = [],
  currentSessionId,
  onSwitchSession
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-30"
        onClick={onClose}
      />
      <div
        className="fixed top-0 left-0 h-full w-72 bg-gray-50 border-r border-gray-200 z-40 flex flex-col shadow-xl"
      >
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-semibold">聊天记录</h2>
          <button onClick={onClearChat} className="text-gray-400 hover:text-red-500" title="清空聊天记录">
            <Trash2 size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => {
                  onSwitchSession?.(session.id);
                  onClose();
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
                  currentSessionId === session.id 
                    ? 'bg-blue-100 text-blue-700 font-medium' 
                    : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                <MessageSquare size={16} className={currentSessionId === session.id ? 'text-blue-600' : 'text-gray-400'} />
                <span className="truncate flex-1 text-left">{session.title}</span>
              </button>
            ))
          ) : (
            <div className="text-sm text-gray-500 p-2">暂无聊天记录。</div>
          )}
        </div>
        <div className="p-4 border-t border-gray-200 space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">快速访问</h3>
            <div className="space-y-1">
              <a href="#" className="flex items-center space-x-3 px-3 py-2 text-sm rounded-md hover:bg-gray-200">
                <Wrench size={16} /> <span>发动机诊断</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-3 py-2 text-sm rounded-md hover:bg-gray-200">
                <Droplets size={16} /> <span>液压系统</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-3 py-2 text-sm rounded-md hover:bg-gray-200">
                <Zap size={16} /> <span>电气问题</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-3 py-2 text-sm rounded-md hover:bg-gray-200">
                <PlaneTakeoff size={16} /> <span>起落装置</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-3 py-2 text-sm rounded-md hover:bg-gray-200">
                <Book size={16} /> <span>知识库</span>
              </a>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 space-y-1">
          <a href="#" className="flex items-center space-x-3 px-3 py-2 text-sm rounded-md hover:bg-gray-200">
            <Settings size={16} /> <span>设置</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2 text-sm rounded-md hover:bg-gray-200">
            <HelpCircle size={16} /> <span>帮助</span>
          </a>
          {user && (
            <button onClick={onLogout} className="w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-md hover:bg-gray-200 text-red-600">
              <LogOut size={16} /> <span>退出登录</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
