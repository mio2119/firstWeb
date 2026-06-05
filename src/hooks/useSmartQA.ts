import { useState, useCallback, useEffect, useRef } from 'react';
import type { Intent, TemplateBlock, TemplateGroup } from '../data/types/qa';
import { useQAMatcher } from './useQAMatcher';
import { apiClient } from '../services/apiClient';

// --- Types ---
interface Message {
  id: string;
  sender: 'user' | 'ai';
  blocks: TemplateBlock[];
  timestamp: Date;
}

// --- Hook ---
export const useSmartQA = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  
  // The "Short-term Memory"
  const [context, setContext] = useState<Record<string, string>>({});

  // Data Holders
  const [synonyms, setSynonyms] = useState<Record<string, string>>({});
  const [intents, setIntents] = useState<Intent[]>([]);
  const [templates, setTemplates] = useState<Record<string, TemplateGroup>>({});
  const hasGreetedRef = useRef(false);
  const { match } = useQAMatcher(intents, templates, synonyms);

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
      setMessages(prev => [...prev, userMsg]);
      setQuickReplies([]); // Clear prev options
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

    const { blocks, quickReplies: replies, slots } = answer;
    const fallbackBlocks: TemplateBlock[] = [{ type: 'text', content: '正在加载对话数据，请稍后再试。' }];
    const safeBlocks = blocks.length > 0 ? blocks : fallbackBlocks;
    setContext(slots);

    // F. Add AI Message
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      blocks: safeBlocks,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMsg]);
    setQuickReplies(replies || []);
    setIsTyping(false);

  }, [context, match]);

  // 3. Auto Greeting (Triggered only when templates are ready and messages are empty)
  useEffect(() => {
    if (!hasGreetedRef.current && messages.length === 0) {
        hasGreetedRef.current = true;
        const timer = setTimeout(() => {
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
