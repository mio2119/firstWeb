import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, ArrowRight, Bot, User, BarChart, Compass, BrainCircuit, ListChecks } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { TemplateBlock, CtaAction } from '../../data/types/qa';

// Types passed from parent or hook
interface Message {
  id: string;
  sender: 'user' | 'ai';
  blocks: TemplateBlock[];
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages: Message[];
  isTyping: boolean;
  quickReplies: string[];
  onSendMessage: (text: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isTyping, quickReplies, onSendMessage }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  };

  // --- Block Renderers ---

  // 1. Smart Card Renderer
  const buildRoute = (action: CtaAction) => {
    if (action.type === 'link') {
      return action.path;
    }
    const params = new URLSearchParams();
    if (action.params) {
      Object.entries(action.params).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
    }
    const query = params.toString();
    return query ? `${action.path}?${query}` : action.path;
  };

  const resolveCtaStyle = (path: string) => {
    if (path.startsWith('/admissions')) {
      return { icon: BarChart, className: 'bg-amber-50 border-amber-200 text-amber-900', iconClass: 'text-amber-600' };
    }
    if (path.startsWith('/explore')) {
      return { icon: Compass, className: 'bg-[#0A2463]/5 border-[#0A2463]/20 text-[#0A2463]', iconClass: 'text-[#0A2463]' };
    }
    if (path.startsWith('/quiz')) {
      return { icon: BrainCircuit, className: 'bg-emerald-50 border-emerald-200 text-emerald-800', iconClass: 'text-emerald-600' };
    }
    return { icon: ArrowRight, className: 'bg-white border-slate-200 text-slate-600', iconClass: 'text-slate-500' };
  };

  const renderCta = (block: TemplateBlock) => {
    if (block.type !== 'cta') return null;
    const { label, description, action } = block;
    const route = buildRoute(action);
    const style = resolveCtaStyle(action.path);
    const Icon = style.icon;

    return (
      <div
        onClick={() => navigate(route)}
        className={`mt-3 p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-[1.02] flex items-center justify-between gap-4 ${style.className}`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 bg-white rounded-lg ${style.iconClass}`}><Icon className="w-5 h-5" /></div>
          <div className="flex flex-col">
            <span className="font-bold text-sm">{label}</span>
            {description && <span className="text-[10px] opacity-70">{description}</span>}
          </div>
        </div>
        <ArrowRight className="w-4 h-4" />
      </div>
    );
  };

  // 2. Text Renderer (with bold support)
  const renderText = (text: string = "") => {
    // Replace **text** with <strong>text</strong>
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
      <p className="text-sm md:text-base leading-relaxed">
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-bold text-[#0A2463]">{part.slice(2, -2)}</strong>;
          }
          return <span key={i}>{part}</span>;
        })}
      </p>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-3xl mx-auto">
        
        {/* --- Message List --- */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-hide pb-32">
            <AnimatePresence initial={false}>
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {/* Avatar */}
                        {msg.sender === 'ai' && (
                            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm mt-1">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                            </div>
                        )}

                        {/* Bubble */}
                        <div className={`max-w-[85%] md:max-w-[75%] space-y-2 ${msg.sender === 'user' ? 'items-end flex flex-col' : ''}`}>
                            {msg.sender === 'user' ? (
                                <div className="bg-[#0A2463] text-white px-5 py-3 rounded-2xl rounded-tr-sm shadow-md text-sm">
                                    {msg.blocks[0].content}
                                </div>
                            ) : (
                                // AI Bubble Container
                                <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-5 rounded-2xl rounded-tl-sm shadow-sm text-slate-700">
                                    {msg.blocks.map((block, idx) => (
                                        <div key={idx} className="mb-2 last:mb-0">
                                            {block.type === 'title' && (
                                                <h4 className="text-sm font-bold text-[#0A2463]">{block.content}</h4>
                                            )}
                                            {block.type === 'text' && renderText(block.content)}
                                            {block.type === 'list' && (
                                                <ul className="space-y-1 text-sm text-slate-600">
                                                    {block.items.map((item) => (
                                                        <li key={item} className="flex items-start gap-2">
                                                            <ListChecks className="w-4 h-4 text-amber-500 mt-0.5" />
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            {block.type === 'cta' && renderCta(block)}
                                            {block.type === 'disclaimer' && (
                                                <p className="text-[10px] text-slate-400 mt-2 italic border-t border-slate-100 pt-2">
                                                    {block.content}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* User Avatar */}
                        {msg.sender === 'user' && (
                             <div className="w-8 h-8 rounded-full bg-[#0A2463] flex items-center justify-center shrink-0 shadow-sm mt-1">
                                <User className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
            
            {/* Typing Indicator */}
            {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                     <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                        <Bot className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="bg-white/50 backdrop-blur-sm border border-white/60 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                    </div>
                </motion.div>
            )}
        </div>

        {/* --- Input Area --- */}
        {/* z-50 to sit above the fixed Dock (z-40) */}
        <div className="fixed bottom-24 left-0 right-0 z-50 px-4 flex flex-col items-center">
             
             {/* Quick Replies */}
             <div className="w-full max-w-3xl flex gap-2 overflow-x-auto pb-3 scrollbar-hide justify-start md:justify-center">
                <AnimatePresence>
                    {!isTyping && quickReplies.map((reply) => (
                        <motion.button
                            key={reply}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={() => onSendMessage(reply)}
                            className="whitespace-nowrap px-4 py-2 bg-white/90 backdrop-blur-md border border-amber-200 text-amber-700 text-xs font-bold rounded-full shadow-sm hover:bg-amber-50 hover:scale-105 transition-all"
                        >
                            {reply}
                        </motion.button>
                    ))}
                </AnimatePresence>
             </div>

             {/* Input Bar */}
             <div className="w-full max-w-3xl relative">
                <div className="absolute inset-0 bg-white/60 backdrop-blur-xl rounded-full blur-lg shadow-2xl shadow-[#0A2463]/10" />
                <div className="relative flex items-center gap-2 bg-white/90 backdrop-blur-2xl border border-white rounded-full px-2 py-2 shadow-xl ring-1 ring-slate-900/5">
                    <input 
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about admissions, majors, or career..."
                        className="flex-1 bg-transparent h-12 pl-6 outline-none text-slate-800 placeholder-slate-400 font-medium"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                        className="w-10 h-10 rounded-full bg-[#0A2463] flex items-center justify-center text-white hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-4 h-4 ml-0.5" />
                    </button>
                </div>
             </div>
        </div>
    </div>
  );
};

export default ChatInterface;
