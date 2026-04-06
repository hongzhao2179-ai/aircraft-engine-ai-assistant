import React, { useEffect, useRef } from 'react';
import type { Message } from '../../types';
import MessageBubble from './MessageBubble';
import Welcome from './Welcome';

interface ChatAreaProps {
  messages: Message[];
  loading?: boolean;
  onQuickAction: (action: string) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, loading, onQuickAction }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
      <div className="max-w-4xl mx-auto">
        {(!messages || messages.length === 0) && !loading ? (
          <Welcome onQuickAction={onQuickAction} />
        ) : (
          <div className="space-y-8 pb-4">
            {messages.map((msg, index) => (
              <MessageBubble key={`${msg.timestamp}-${index}`} message={msg} />
            ))}
            {loading && (
              <div className="flex items-start gap-4 w-full">
                <div className="w-8 h-8 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                </div>
                <div className="max-w-[80%]">
                  <div className="inline-block rounded-2xl px-4 py-3 shadow-sm bg-white border border-gray-100">
                    <div className="flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatArea;
