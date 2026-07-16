import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, MessageSquare, Bot, Sparkles, Loader2, Plus, Mic, AudioLines, Image as ImageIcon, PenLine, Globe, ChevronDown, UserCircle, RotateCw } from 'lucide-react';
import { aiService } from '../services/ai';
import { useAuth } from '../hooks/useAuth';
import Markdown from 'react-markdown';

type Message = { role: 'user' | 'assistant', content: string };

export default function AIChat() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async (forcedInput?: string) => {
    const textToSend = forcedInput || input;
    if (!textToSend.trim() || loading) return;
    
    const userMsg = textToSend.trim();
    setInput('');
    const newMsgs: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMsgs);
    setLoading(true);

    const history = messages.map(m => ({ 
      role: m.role === 'user' ? 'user' : 'model', 
      parts: [{ text: m.content }] 
    }));

    try {
      const response = await aiService.chat(userMsg, history);
      setMessages([...newMsgs, { role: 'assistant', content: response }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: <ImageIcon size={16} />, label: 'Create an image', prompt: 'Create an image related to chemistry' },
    { icon: <PenLine size={16} />, label: 'Write or edit', prompt: 'Help me write a lab report' },
    { icon: <Globe size={16} />, label: 'Look something up', prompt: 'Search for recent advances in material science' },
  ];

  return (
    <div className="max-w-screen-xl mx-auto flex flex-col h-[calc(100vh-14rem)] lg:h-[78vh] bg-card border border-border rounded-3xl overflow-hidden transition-colors relative shadow-2xl">
      {/* Top Navigation */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-card/50 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-1 group cursor-pointer hover:bg-muted/50 p-2 rounded-xl transition-all">
          <span className="font-bold text-base sm:text-lg tracking-tight">Edupulse AI</span>
          <ChevronDown size={14} className="text-muted-foreground group-hover:text-foreground transition-all" />
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
           <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] sm:text-xs font-bold hover:bg-primary/20 transition-all border border-primary/20">
              <Sparkles size={12} />
              <span className="hidden xs:inline">Get Advanced</span>
           </button>
           <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
              <RotateCw size={14} />
           </div>
           <UserCircle size={24} className="text-muted-foreground" />
        </div>
      </div>

      {/* Main Content Area */}
      <div ref={scrollRef} className="flex-1 overflow-auto p-4 sm:p-6 space-y-12">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-20">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-6xl font-bold mb-4 md:mb-12 tracking-tight text-center px-4"
            >
              What's on the agenda today?
            </motion.h1>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-10">
            {messages.map((m, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 sm:gap-6 group"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-border ${m.role === 'user' ? 'bg-primary/10 text-primary' : 'bg-card text-foreground'}`}>
                  {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                    {m.role === 'user' ? 'You' : 'Assistant'}
                  </p>
                  <div className="markdown-body transition-all">
                    <Markdown>{m.content}</Markdown>
                  </div>
                </div>
              </motion.div>
            ))}
            {loading && (
              <div className="flex gap-4 sm:gap-6">
                <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-primary animate-pulse" />
                </div>
                <div className="flex gap-1 items-center h-8">
                  {[0, 1, 2].map(i => (
                    <motion.div 
                      key={i}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                      className="w-1 h-1 bg-primary rounded-full"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6 border-t border-border bg-card/30">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="relative flex items-center bg-card border border-border rounded-2xl sm:rounded-[2.5rem] shadow-xl hover:border-border/80 transition-all p-1.5 group shadow-black/5 dark:shadow-black">
            <button className="p-2 sm:p-3 hover:bg-muted rounded-full text-muted-foreground transition-all">
              <Plus size={18} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent py-2 px-2 focus:outline-none font-medium text-base sm:text-lg"
            />
            <div className="flex items-center gap-1">
              <button className="p-2 sm:p-3 hover:bg-muted rounded-full text-muted-foreground transition-all hidden sm:flex">
                <Mic size={18} />
              </button>
              <button 
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className={`p-2.5 rounded-xl sm:rounded-full transition-all flex items-center justify-center ${
                  input.trim() && !loading 
                    ? 'bg-black dark:bg-white text-white dark:text-black scale-105 shadow-lg' 
                    : 'bg-muted text-muted-foreground opacity-50'
                }`}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <AudioLines size={18} />}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => handleSend(action.prompt)}
                className="flex items-center gap-1.5 px-4 py-2 bg-card border border-border rounded-full text-xs font-semibold hover:bg-muted transition-all text-muted-foreground hover:text-foreground active:scale-95"
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
        <p className="text-center mt-4 text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] hidden sm:block">Edupulse Intelligence 4.0 Pro</p>
      </div>
    </div>
  );
}
