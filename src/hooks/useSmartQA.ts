import { useState, useCallback, useEffect, useRef } from 'react';
import type { Intent, TemplateBlock, TemplateGroup } from '../data/types/qa';
import { useQAMatcher } from './useQAMatcher';
import { apiClient } from '../services/apiClient';
import { useUser } from '../context/UserContext';

// --- Types ---
interface Message {
  id: string;
  sender: 'user' | 'ai';
  blocks: TemplateBlock[];
  timestamp: Date;
}

const QA_MESSAGES_KEY = 'sec_qa_messages';
const QA_CONTEXT_KEY = 'sec_qa_context';
const QA_REPLIES_KEY = 'sec_qa_quick_replies';
const QA_SESSION_EVENT = 'sec-qa-session-updated';

const readSessionJson = <T,>(key: string, fallback: T): T => {
  try {
    const saved = sessionStorage.getItem(key);
    return saved ? JSON.parse(saved) as T : fallback;
  } catch {
    return fallback;
  }
};

const readStoredMessages = () => {
  const saved = readSessionJson<Array<Omit<Message, 'timestamp'> & { timestamp: string }>>(QA_MESSAGES_KEY, []);
  return saved.map((message) => ({
    ...message,
    timestamp: new Date(message.timestamp)
  }));
};

const writeSessionJson = (key: string, value: unknown) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(QA_SESSION_EVENT, { detail: { key } }));
  } catch {
    // Session persistence is a convenience layer; UI state should continue without it.
  }
};

// --- Hook ---
export const useSmartQA = () => {
  const { addToHistory } = useUser();
  const [messages, setMessages] = useState<Message[]>(readStoredMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>(() => readSessionJson<string[]>(QA_REPLIES_KEY, []));
  
  // The "Short-term Memory"
  const [context, setContext] = useState<Record<string, string>>(() => readSessionJson<Record<string, string>>(QA_CONTEXT_KEY, {}));

  // Data Holders
  const [synonyms, setSynonyms] = useState<Record<string, string>>({});
  const [intents, setIntents] = useState<Intent[]>([]);
  const [templates, setTemplates] = useState<Record<string, TemplateGroup>>({});
  const hasGreetedRef = useRef(false);
  const messagesRef = useRef<Message[]>(messages);
  const { match } = useQAMatcher(intents, templates, synonyms);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    const restoreFromSession = () => {
      const restoredMessages = readStoredMessages();
      messagesRef.current = restoredMessages;
      setMessages(restoredMessages);
      setContext(readSessionJson<Record<string, string>>(QA_CONTEXT_KEY, {}));
      setQuickReplies(readSessionJson<string[]>(QA_REPLIES_KEY, []));
    };

    window.addEventListener(QA_SESSION_EVENT, restoreFromSession);
    return () => window.removeEventListener(QA_SESSION_EVENT, restoreFromSession);
  }, []);

  const commitMessages = useCallback((updater: Message[] | ((prev: Message[]) => Message[])) => {
    const next = typeof updater === 'function' ? updater(messagesRef.current) : updater;
    messagesRef.current = next;
    writeSessionJson(QA_MESSAGES_KEY, next);
    setMessages(next);
  }, []);

  const commitQuickReplies = useCallback((replies: string[]) => {
    writeSessionJson(QA_REPLIES_KEY, replies);
    setQuickReplies(replies);
  }, []);

  const commitContext = useCallback((nextContext: Record<string, string>) => {
    writeSessionJson(QA_CONTEXT_KEY, nextContext);
    setContext(nextContext);
  }, []);

  // 1. Load Data on Mount
  useEffect(() => {
    const resolveDataPath = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
    const loadStatic = (path: string) => fetch(resolveDataPath(path)).then(r => r.json());

    Promise.all([
      apiClient.getData<Record<string, string>>('data/meta/synonyms.json').catch(() => loadStatic('data/meta/synonyms.json')),
      apiClient.getData<Intent[]>('data/qa/intents.json').catch(() => loadStatic('data/qa/intents.json')),
      apiClient.getData<Record<string, TemplateGroup>>('data/qa/templates.json').catch(() => loadStatic('data/qa/templates.json'))
    ]).then(([synData, intData, tplData]) => {
      setSynonyms(synData);
      setIntents(intData);
      setTemplates(tplData);
    }).catch(err => {
      console.error("Failed to load QA data:", err);
    });
  }, []);

  // 2. Core Processing Logic
  const processInput = useCallback(async (rawText: string, isSystemTrigger = false) => {
    if (!rawText.trim()) return;

    // A. Add User Message
    if (!isSystemTrigger) {
      const userMsg: Message = {
        id: Date.now().toString(),
        sender: 'user',
        blocks: [{ type: 'text', content: rawText }],
        timestamp: new Date()
      };
      commitMessages(prev => [...prev, userMsg]);
      addToHistory({
        type: 'qa',
        title: 'AI 顾问提问',
        path: '/qa',
        content: rawText
      });
      commitQuickReplies([]); // Clear prev options
    }

    setIsTyping(true);

    // B. Simulate Thinking Delay (600ms - 1200ms)
    const delay = Math.random() * 600 + 600;
    await new Promise(resolve => setTimeout(resolve, delay));

    let answer;
    try {
      answer = await apiClient.chat(rawText, context);
    } catch {
      answer = match({ text: rawText, context });
    }

    const { blocks = [], quickReplies: replies = [], slots = context } = answer;
    const fallbackBlocks: TemplateBlock[] = [{ type: 'text', content: '正在加载对话数据，请稍后再试。' }];
    const safeBlocks = blocks.length > 0 ? blocks : fallbackBlocks;
    commitContext(slots);

    // F. Add AI Message
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      blocks: safeBlocks,
      timestamp: new Date()
    };

    commitMessages(prev => [...prev, aiMsg]);
    commitQuickReplies(replies);
    setIsTyping(false);

  }, [addToHistory, commitContext, commitMessages, commitQuickReplies, context, match]);

  // 3. Auto Greeting (Triggered only when templates are ready and messages are empty)
  useEffect(() => {
    if (!hasGreetedRef.current && messages.length === 0) {
        const timer = setTimeout(() => {
            if (hasGreetedRef.current || messagesRef.current.length > 0) return;
            hasGreetedRef.current = true;
            processInput("你好", true);
        }, 500);
        return () => clearTimeout(timer);
    }
  }, [messages.length, processInput]);

  return {
    messages,
    isTyping,
    quickReplies,
    processInput,
    context
  };
};
