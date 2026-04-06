import React, { useState } from 'react';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import ChatArea from '../components/Chat/ChatArea';
import ChatInput from '../components/Chat/ChatInput';
import LoginPage from './LoginPage';
import { useChat } from '../hooks/useChat';
import { useChatPersistence } from '../hooks/useChatPersistence';
import { useAuth } from '../contexts/AuthContext';

const ChatPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  
  const { user, signOut } = useAuth();
  const { 
    messages = [], 
    setMessages, 
    isLoading = false, 
    sendMessage, 
    clearMessages 
  } = useChat();

  // 接入持久化 Hook
  const { 
    isSyncing, 
    sessions, 
    currentSessionId, 
    createNewChat, 
    switchSession, 
    clearAllPersistence 
  } = useChatPersistence(messages, setMessages, isLoading);

  const handleClear = async () => {
    if (window.confirm('确定要清空所有聊天记录吗？此操作不可恢复。')) {
      clearMessages();
      await clearAllPersistence();
    }
  };

  const handleQuickAction = (action: string) => {
    if (isLoading) return;
    let text = '';
    switch (action) {
      case 'diagnose': text = '我想进行故障诊断，目前发现发动机有异常。'; break;
      case 'manual': text = '我想查询维修手册相关内容。'; break;
      case 'troubleshoot': text = '请提供排故指南。'; break;
      case 'analyze': text = '我想分析一下维修记录。'; break;
      case 'tools': text = '我需要一份工具清单。'; break;
      case 'docs': text = '我想查阅技术文档。'; break;
      default: text = `关于 ${action}，我需要更多信息。`;
    }
    sendMessage(text);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* 传递登录状态给 Header 和 Sidebar */}
      <Header 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        user={user}
        onLoginClick={() => setShowLogin(true)}
        onNewChat={createNewChat}
      />
      
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        user={user}
        onLogout={signOut}
        onClearChat={handleClear}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSwitchSession={switchSession}
      />
      
      {/* main container needs to take up remaining height and be a flex column */}
      <main className="flex-1 flex flex-col pt-16 h-full overflow-hidden relative">
        {isSyncing && (
          <div className="absolute top-0 left-0 right-0 bg-blue-50 text-blue-600 text-xs text-center py-1 z-10">
            正在同步云端数据...
          </div>
        )}
        
        {/* ChatArea will handle its own scrolling */}
        <ChatArea 
          messages={Array.isArray(messages) ? messages : []} 
          loading={isLoading} 
          onQuickAction={handleQuickAction} 
        />
        
        {/* ChatInput must not shrink and stay at the bottom */}
        <div className="flex-shrink-0">
          <ChatInput 
            onSend={sendMessage} 
            disabled={isLoading || isSyncing} 
          />
        </div>
      </main>

      {showLogin && <LoginPage onClose={() => setShowLogin(false)} />}
    </div>
  );
};

export default ChatPage;
