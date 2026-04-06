import React from 'react';
import { User, Bot } from 'lucide-react';
import type { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  if (!message || typeof message !== 'object') {
    return <div className="text-red-500 p-2">Error: Invalid message format</div>;
  }

  const isUser = message.role === 'user';
  const safeContent = typeof message.content === 'string' ? message.content : '';

  return (
    <div className={`flex items-start gap-4 w-full ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
          <Bot size={20} className="text-gray-600" />
        </div>
      )}
      <div className={`max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <div
          className={`inline-block rounded-2xl px-4 py-3 shadow-sm text-left ${
            isUser
              ? 'bg-blue-600 text-white rounded-br-lg'
              : 'bg-white text-gray-800 rounded-bl-lg border border-gray-100'
          }`}
        >
          <pre className="whitespace-pre-wrap font-sans text-sm">
            {safeContent}
          </pre>
        </div>
        <div className="text-xs text-gray-400 mt-1.5 px-1">
          {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }) : '--:--'}
        </div>
      </div>
      {isUser && (
        <div className="w-8 h-8 flex-shrink-0 bg-blue-600 rounded-full flex items-center justify-center">
          <User size={20} className="text-white" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
