export type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
};

export type ChatSession = {
  id: string;
  user_id?: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
};
