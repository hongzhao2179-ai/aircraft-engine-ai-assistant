import { useState } from 'react';
import type { Message } from '../types';
import { postChatStream } from '../api/chat';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // By removing useCallback, this function will be recreated on every render,
  // ensuring it always has access to the latest 'messages' state.
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    // Add user message and assistant placeholder
    setMessages(prev => [...prev, userMessage, { role: 'assistant', content: '', timestamp: Date.now() }]);
    setIsLoading(true);
    setError(null);

    try {
      // The 'messages' variable here is from the latest render, so it's up-to-date.
      const reader = await postChatStream(content, messages);
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedContent += chunk;

        // Use functional updates for streaming to prevent race conditions
        setMessages(prev => {
          const next = [...prev];
          const lastMsg = next[next.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            next[next.length - 1] = { ...lastMsg, content: accumulatedContent };
            return next;
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('Chat Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    setMessages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
};
