import React from 'react';
import ChatInterface from '../components/qa/ChatInterface.tsx';
import QABackground from '../components/layout/QABackground.tsx';
import { useSmartQA } from '../hooks/useSmartQA';

const QA: React.FC = () => {
  const { messages, isTyping, quickReplies, processInput } = useSmartQA();

  return (
    <div className="relative w-full min-h-screen bg-[#FDFCF8]">
      
      {/* --- New Digital Threads Background --- */}
      <QABackground />

      {/* --- Header --- */}
      <div className="sticky top-0 z-30 pt-4 pb-2 px-6 bg-[#FDFCF8]/80 backdrop-blur-sm border-b border-slate-100/50 transition-all duration-300">
         <div className="max-w-3xl mx-auto flex flex-col items-center">
             <div className="flex items-center gap-2 mb-1">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">AI Consultant Online</span>
             </div>
             <h1 className="text-xl font-serif font-black text-[#0A2463] tracking-tight">升学智能顾问</h1>
         </div>
      </div>

      {/* --- Main Chat --- */}
      <div className="relative z-10 pt-4">
         <ChatInterface 
            messages={messages} 
            isTyping={isTyping} 
            quickReplies={quickReplies}
            onSendMessage={processInput} 
         />
      </div>
    </div>
  );
};

export default QA;