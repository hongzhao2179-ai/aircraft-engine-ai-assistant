import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Mic, Camera, Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  return (
    <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start space-x-3 p-3 bg-gray-100 rounded-2xl border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500">
          <textarea
            ref={textareaRef}
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-500 focus:outline-none resize-none min-h-[24px] max-h-[160px]"
            placeholder={disabled ? "思考中..." : "输入你的问题，例如：如何修复低燃油泵压力问题？"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
          />
          <button
            className={`bg-blue-600 text-white rounded-lg p-2 h-9 w-9 flex items-center justify-center transition-all ${
              input.trim() && !disabled
                ? 'hover:bg-blue-700 scale-100'
                : 'opacity-50 scale-90 cursor-not-allowed'
            }`}
            onClick={handleSend}
            disabled={!input.trim() || disabled}
          >
            <Send size={18} />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 px-2">
            <div className="flex items-center space-x-2">
                <button className="text-gray-500 hover:text-blue-600 p-1 rounded-full"><Paperclip size={16} /></button>
                <button className="text-gray-500 hover:text-blue-600 p-1 rounded-full"><Mic size={16} /></button>
                <button className="text-gray-500 hover:text-blue-600 p-1 rounded-full"><Camera size={16} /></button>
            </div>
            <p className="text-xs text-gray-400">
                AeroMaint Copilot may produce errors. Please verify critical information.
            </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
