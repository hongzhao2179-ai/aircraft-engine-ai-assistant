import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import type { Message, ChatSession } from '../types';

const STORAGE_KEY = 'aeromaint_chat_history';

export const useChatPersistence = (
  messages: Message[],
  setMessages: (msgs: Message[]) => void,
  isChatLoading: boolean
) => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const initialized = useRef(false);

  // 1. 初始化加载与同步逻辑 (解决问题 1)
  useEffect(() => {
    if (isAuthLoading) return;

    const initData = async () => {
      setIsSyncing(true);
      try {
        const localDataStr = localStorage.getItem(STORAGE_KEY);
        const localSessions: ChatSession[] = localDataStr ? JSON.parse(localDataStr) : [];

        if (user) {
          // --- 已登录状态 ---
          // 1. 先获取所有会话列表
          const { data: remoteSessions, error: sessionError } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

          if (sessionError) throw sessionError;

          if (remoteSessions && remoteSessions.length > 0) {
            // 2. 获取最活跃会话的消息详情
            const latestSession = remoteSessions[0];
            const { data: remoteMessages, error: msgError } = await supabase
              .from('messages')
              .select('*')
              .eq('session_id', latestSession.id)
              .order('timestamp', { ascending: true });

            if (msgError) throw msgError;

            const sessionsWithMsgs = remoteSessions.map(s => ({
              ...s,
              messages: s.id === latestSession.id ? (remoteMessages || []) : []
            }));

            setSessions(sessionsWithMsgs);
            setCurrentSessionId(latestSession.id);
            setMessages(remoteMessages || []);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionsWithMsgs));
          } else if (localSessions.length > 0) {
            // 首次登录同步逻辑... (保持原样但适配新表)
            const sessionsToSync = localSessions.map(({ messages, ...s }) => ({
              ...s,
              user_id: user.id,
              updated_at: new Date().toISOString()
            }));
            
            await supabase.from('chat_sessions').upsert(sessionsToSync);
            
            // 同步消息表
            const allMessagesToSync = localSessions.flatMap(s => 
              (s.messages || []).map(m => ({
                session_id: s.id,
                ...m
              }))
            );
            if (allMessagesToSync.length > 0) {
              await supabase.from('messages').upsert(allMessagesToSync);
            }
            
            setSessions(localSessions);
            setCurrentSessionId(localSessions[0].id);
            setMessages(localSessions[0].messages || []);
          }
        } else {
          // --- 未登录状态 ---
          setSessions(localSessions);
          if (localSessions.length > 0) {
            setCurrentSessionId(localSessions[0].id);
            setMessages(localSessions[0].messages || []);
          }
        }
      } catch (err) {
        console.error('初始化聊天记录失败:', err);
      } finally {
        setIsSyncing(false);
        initialized.current = true;
      }
    };

    initData();
  }, [user, isAuthLoading, setMessages]);

  // 2. 监听 messages 变化并同步 (解决问题 2)
  useEffect(() => {
    if (!initialized.current || isChatLoading || !currentSessionId) return;

    const saveCurrentSession = async () => {
      // 这里的 sessions 可能已经陈旧，使用函数式更新获取最新状态
      let latestSessions: ChatSession[] = [];
      setSessions(prev => {
        const firstUserMsg = messages.find(m => m.role === 'user')?.content || '新对话';
        const updated = prev.map(s => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              messages,
              title: firstUserMsg.slice(0, 30),
              updated_at: new Date().toISOString()
            };
          }
          return s;
        });
        latestSessions = updated;
        return updated;
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(latestSessions));

      if (user) {
        const sessionToUpdate = latestSessions.find(s => s.id === currentSessionId);
        if (sessionToUpdate) {
          // 1. 更新会话元数据 (不包含 messages 字段)
          const { messages: _, ...sessionMeta } = sessionToUpdate;
          await supabase.from('chat_sessions').upsert({
            ...sessionMeta,
            user_id: user.id
          });

          // 2. 更新消息详情 (由于 messages 较多，这里简单处理：只同步当前会话的所有消息)
          // 注意：实际生产环境建议只 insert 新消息，这里为了“最小落地”使用 upsert
          const msgsToUpsert = messages.map(m => ({
            session_id: currentSessionId,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp
          }));
          
          if (msgsToUpsert.length > 0) {
            // 假设 messages 表有 (session_id, timestamp) 的唯一约束
            await supabase.from('messages').upsert(msgsToUpsert);
          }
        }
      }
    };

    const timeoutId = setTimeout(saveCurrentSession, 1000);
    return () => clearTimeout(timeoutId);
  }, [messages, isChatLoading, currentSessionId, user]);

  // 3. 新建对话 (解决问题 3)
  const createNewChat = useCallback(async () => {
    const newId = crypto.randomUUID();
    const newSession: ChatSession = {
      id: newId,
      user_id: user?.id,
      title: '新对话',
      messages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 立即保存到数据库，防止刷新丢失 (解决核心痛点)
    if (user) {
      const { messages: _, ...sessionMeta } = newSession;
      await supabase.from('chat_sessions').insert({
        ...sessionMeta,
        user_id: user.id
      });
    }

    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
    setMessages([]);
  }, [user, setMessages]);

  // 切换对话 (也需要从云端拉取该会话的消息)
  const switchSession = useCallback(async (sessionId: string) => {
    setIsSyncing(true);
    try {
      if (user) {
        const { data: remoteMessages } = await supabase
          .from('messages')
          .select('*')
          .eq('session_id', sessionId)
          .order('timestamp', { ascending: true });
        
        setMessages(remoteMessages || []);
      } else {
        const session = sessions.find(s => s.id === sessionId);
        setMessages(session?.messages || []);
      }
      setCurrentSessionId(sessionId);
    } finally {
      setIsSyncing(false);
    }
  }, [user, sessions, setMessages]);

  // 清空所有
  const clearAllPersistence = async () => {
    localStorage.removeItem(STORAGE_KEY);
    setSessions([]);
    setCurrentSessionId(null);
    setMessages([]);
    if (user) {
      await supabase.from('chat_sessions').delete().eq('user_id', user.id);
    }
  };

  return { 
    isSyncing, 
    sessions, 
    currentSessionId, 
    createNewChat, 
    switchSession, 
    clearAllPersistence 
  };
};
