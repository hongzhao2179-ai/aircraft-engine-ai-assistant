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
      console.log('🔍 [DEBUG] 初始化开始', { userId: user?.id, isAuthLoading });
      setIsSyncing(true);
      try {
        const localDataStr = localStorage.getItem(STORAGE_KEY);
        const localSessions: ChatSession[] = localDataStr ? JSON.parse(localDataStr) : [];
        console.log('🔍 [DEBUG] 本地缓存数据:', localSessions);

        if (user) {
          // --- 已登录状态 ---
          console.log('🔍 [DEBUG] 正在从 Supabase 获取会话列表...');
          // 1. 先获取所有会话列表
          const { data: remoteSessions, error: sessionError } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

          if (sessionError) {
            console.error('❌ [DEBUG] 获取会话列表失败:', sessionError);
            throw sessionError;
          }
          console.log('🔍 [DEBUG] 云端会话列表:', remoteSessions);

          if (remoteSessions && remoteSessions.length > 0) {
            // 2. 获取最活跃会话的消息详情
            const latestSession = remoteSessions[0];
            console.log('🔍 [DEBUG] 正在获取最新会话的消息:', latestSession.id);
            const { data: remoteMessages, error: msgError } = await supabase
              .from('messages')
              .select('*')
              .eq('session_id', latestSession.id)
              .order('created_at', { ascending: true }); // 使用 created_at 代替 timestamp

            if (msgError) {
              console.error('❌ [DEBUG] 获取消息详情失败:', msgError);
              throw msgError;
            }
            console.log('🔍 [DEBUG] 获取到云端消息:', remoteMessages);

            // 将云端的 created_at 映射回前端的 timestamp (number)
            const mappedMessages = (remoteMessages || []).map(m => ({
              ...m,
              timestamp: m.created_at ? new Date(m.created_at).getTime() : m.timestamp
            }));

            const sessionsWithMsgs = remoteSessions.map(s => ({
              ...s,
              messages: s.id === latestSession.id ? mappedMessages : []
            }));

            setSessions(sessionsWithMsgs);
            setCurrentSessionId(latestSession.id);
            setMessages(mappedMessages);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionsWithMsgs));
          } else if (localSessions.length > 0) {
            // 首次登录同步逻辑... (保持原样但适配新表)
            console.log('🔍 [DEBUG] 首次登录，同步本地数据到云端...');
            const sessionsToSync = localSessions.map(({ messages, ...s }) => ({
              ...s,
              user_id: user.id,
              updated_at: new Date().toISOString()
            }));
            
            const { error: syncSessionError } = await supabase.from('chat_sessions').upsert(sessionsToSync);
            if (syncSessionError) {
              console.error('❌ [DEBUG] 同步会话列表失败:', syncSessionError);
              throw syncSessionError;
            }
            
            // 同步消息表
            const allMessagesToSync = localSessions.flatMap(s => 
              (s.messages || []).map(m => ({
                session_id: s.id,
                role: m.role,
                content: m.content,
                created_at: new Date(m.timestamp).toISOString() // 映射 timestamp 到 created_at
              }))
            );
            if (allMessagesToSync.length > 0) {
              const { error: syncMsgError } = await supabase.from('messages').upsert(allMessagesToSync);
              if (syncMsgError) {
                console.error('❌ [DEBUG] 同步消息失败:', syncMsgError);
                throw syncMsgError;
              }
            }
            
            setSessions(localSessions);
            setCurrentSessionId(localSessions[0].id);
            setMessages(localSessions[0].messages || []);
            console.log('🔍 [DEBUG] 首次同步完成');
          } else {
            console.log('🔍 [DEBUG] 云端和本地均无数据');
            setSessions([]);
            setMessages([]);
          }
        } else {
          // --- 未登录状态 ---
          console.log('🔍 [DEBUG] 未登录，使用本地数据');
          setSessions(localSessions);
          if (localSessions.length > 0) {
            setCurrentSessionId(localSessions[0].id);
            setMessages(localSessions[0].messages || []);
          }
        }
      } catch (err) {
        console.error('❌ [CRITICAL] 初始化聊天记录失败:', err);
      } finally {
        setIsSyncing(false);
        initialized.current = true;
        console.log('🔍 [DEBUG] 初始化结束');
      }
    };

    initData();
  }, [user, isAuthLoading, setMessages]);

  // 2. 监听 messages 变化并同步 (解决问题 2)
  useEffect(() => {
    // 只有当 messages 数组长度大于 0 且不是正在加载时才触发保存
    if (!initialized.current || isChatLoading || messages.length === 0 || !currentSessionId) return;

    const saveCurrentSession = async () => {
      console.log('🔥 [WRITE] 开始执行 saveCurrentSession:', {
        sessionId: currentSessionId,
        messageCount: messages?.length,
        userId: user?.id
      });

      try {
        // 1. 获取当前会话标题
        const firstUserMsg = messages.find(m => m.role === 'user')?.content || '新对话';
        const currentTitle = firstUserMsg.slice(0, 30);
        const now = new Date().toISOString();

        // 2. 同步更新内存状态和本地缓存
        setSessions(prev => {
          const updated = prev.map(s => {
            if (s.id === currentSessionId) {
              return { ...s, messages, title: currentTitle, updated_at: now };
            }
            return s;
          });
          
          // 同时也更新本地缓存，确保存储的是最新的
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          console.log('🔍 [DEBUG] 本地缓存已更新');
          return updated;
        });

        // 3. 同步到 Supabase
        if (user) {
          console.log('🔍 [DEBUG] 准备同步到 Supabase...');
          
          // --- 步骤 A: 更新会话元数据 ---
          const sessionMeta = {
            id: currentSessionId,
            user_id: user.id,
            title: currentTitle,
            updated_at: now
          };
          
          console.log('🔍 [DEBUG] A. 准备 upsert chat_sessions:', sessionMeta);
          const { data: resSession, error: sessionError } = await supabase
            .from('chat_sessions')
            .upsert(sessionMeta)
            .select();

          console.log('🔍 [DEBUG] A. Supabase chat_sessions 响应:', {
            status: sessionError ? 'FAILED' : 'SUCCESS',
            error: sessionError,
            data: resSession
          });

          if (sessionError) throw sessionError;

          // --- 步骤 B: 更新消息详情 ---
          console.log('🔍 [DEBUG] B. 准备删除旧消息 for session:', currentSessionId);
          const { error: deleteError } = await supabase
            .from('messages')
            .delete()
            .eq('session_id', currentSessionId);

          if (deleteError) {
            console.error('❌ [DEBUG] B. 删除旧消息失败 (跳过直接插入):', deleteError);
          }

          const msgsToInsert = messages.map(m => ({
            session_id: currentSessionId,
            role: m.role,
            content: m.content,
            created_at: new Date(m.timestamp).toISOString()
          }));
          
          if (msgsToInsert.length > 0) {
            console.log('🔍 [DEBUG] B. 准备 insert messages:', msgsToInsert);
            const { data: resMsgs, error: msgError } = await supabase
              .from('messages')
              .insert(msgsToInsert)
              .select();

            console.log('🔍 [DEBUG] B. Supabase messages 响应:', {
              status: msgError ? 'FAILED' : 'SUCCESS',
              error: msgError,
              data: resMsgs
            });

            if (msgError) throw msgError;
            console.log('✅ [SUCCESS] 全流程同步成功');
          }
        }
      } catch (err) {
        console.error('❌ [CRITICAL] 同步过程发生异常:', err);
      }
    };

    const timeoutId = setTimeout(saveCurrentSession, 1000);
    return () => clearTimeout(timeoutId);
  }, [messages, isChatLoading, currentSessionId, user]);

  // 3. 新建对话 (解决问题 3)
  const createNewChat = useCallback(async () => {
    console.log('🔍 [DEBUG] 准备创建新对话...');
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
      console.log('🔍 [DEBUG] 准备插入新会话到 Supabase:', sessionMeta);
      const { data: resData, error: insertError } = await supabase.from('chat_sessions').insert({
        ...sessionMeta,
        user_id: user.id
      }).select();

      if (insertError) {
        console.error('❌ [DEBUG] 插入新会话失败:', insertError);
        // 如果是由于 RLS 或其他原因失败，我们可能需要抛出错误让 UI 知晓
      } else {
        console.log('🔍 [DEBUG] 新会话插入成功:', resData);
      }
    }

    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
    setMessages([]);
  }, [user, setMessages]);

  // 切换对话 (也需要从云端拉取该会话的消息)
  const switchSession = useCallback(async (sessionId: string) => {
    console.log('🔍 [DEBUG] 准备切换会话:', sessionId);
    setIsSyncing(true);
    try {
      if (user) {
        console.log('🔍 [DEBUG] 正在从云端拉取会话消息:', sessionId);
        const { data: remoteMessages, error: fetchError } = await supabase
          .from('messages')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true }); // 使用 created_at 代替 timestamp
        
        if (fetchError) {
          console.error('❌ [DEBUG] 获取切换会话的消息失败:', fetchError);
        } else {
          console.log('🔍 [DEBUG] 成功拉取到消息:', remoteMessages);
          // 映射 created_at 到 timestamp
          const mappedMessages = (remoteMessages || []).map(m => ({
            ...m,
            timestamp: m.created_at ? new Date(m.created_at).getTime() : m.timestamp
          }));
          setMessages(mappedMessages);
        }
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
