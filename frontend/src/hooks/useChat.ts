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
      let buffer = '';
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE: split by double newline
        const lines = buffer.split('\n');
        // Keep last incomplete chunk in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.done) {
              // Final event — set full content
              setMessages(prev => {
                const next = [...prev];
                const lastMsg = next[next.length - 1];
                if (lastMsg?.role === 'assistant') {
                  next[next.length - 1] = { ...lastMsg, content: data.full };
                }
                return next;
              });
              accumulatedContent = data.full;
            } else if (data.delta) {
              accumulatedContent += data.delta;
              setMessages(prev => {
                const next = [...prev];
                const lastMsg = next[next.length - 1];
                if (lastMsg?.role === 'assistant') {
                  next[next.length - 1] = { ...lastMsg, content: accumulatedContent };
                }
                return next;
              });
            }
          } catch {
            // Skip malformed JSON
          }
        }
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
