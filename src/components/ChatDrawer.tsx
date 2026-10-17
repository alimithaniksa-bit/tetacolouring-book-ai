import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types/book';
import { MessageSquare, X, Send, Sparkles, Bot, User, Trash2, ArrowRight } from 'lucide-react';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyThemeSuggestion?: (theme: string, childName?: string) => void;
  currentBookContext?: {
    childName: string;
    theme: string;
    ageGroup: string;
    bookTitle?: string;
    pages?: Array<{ pageNumber: number; title: string }>;
  };
}

const MODEL_OPTIONS = [
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', tag: 'General Tasks (Fast & Smart)' },
  { id: 'gemini-4-argon', name: 'Gemini 4 Argon', tag: 'Complex Tasks (Deep Poetry & Lore)' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash-Lite', tag: 'Ultra-Fast Quick Ideas' },
];

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  onApplyThemeSuggestion,
  currentBookContext,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `Hi there! I'm Barnaby the Bookworm 🐛📚, your personal coloring book art director!

Need help dreaming up an awesome theme for ${currentBookContext?.childName || 'your child'}, crafting cute rhyming captions, or picking fun crayon palettes? Ask me anything!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.8-flash',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || input.trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!customText) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          bookContext: currentBookContext,
          model: selectedModel,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get chat response.');
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.model || selectedModel,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: `Oops! I bumped into a crayon box! ${err.message || 'Please try asking again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'reset',
        role: 'model',
        content: `Chat history cleared! Ready for new coloring book ideas for ${currentBookContext?.childName || 'the little artist'}. What should we brainstorm?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel,
      },
    ]);
  };

  const quickPrompts = [
    `Give me 3 clever twists on "${currentBookContext?.theme || 'space dinosaurs'}"`,
    `Write a funny 4-line rhyming poem for page 1`,
    `What crayon colors match this adventure?`,
    `How can I make the line art easier for a toddler?`,
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
      {/* Drawer Header */}
      <div className="p-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl shadow-inner">
            🐛
          </div>
          <div>
            <h3 className="font-display font-bold text-lg leading-tight flex items-center gap-2">
              Barnaby the Bookworm
              <span className="text-[10px] font-mono bg-white/20 text-white px-2 py-0.5 rounded-full">
                Gemini AI
              </span>
            </h3>
            <p className="text-violet-200 text-xs">Coloring Book Art Director & Storyteller</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleClearHistory}
            className="p-2 text-violet-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-violet-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Close Assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Model Selector Bar */}
      <div className="bg-violet-50/80 px-4 py-2 border-b border-violet-100 flex items-center justify-between text-xs">
        <span className="font-bold text-violet-800 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-violet-600" />
          Gemini Model:
        </span>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="bg-white border border-violet-200 text-violet-900 rounded-lg px-2 py-1 font-medium text-xs focus:ring-2 focus:ring-violet-400 outline-none cursor-pointer"
        >
          {MODEL_OPTIONS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.tag.split(' ')[0]})
            </option>
          ))}
        </select>
      </div>

      {/* Current Context Banner */}
      {currentBookContext?.childName && (
        <div className="px-4 py-1.5 bg-amber-50 border-b border-amber-100 text-[11px] text-amber-800 flex items-center justify-between">
          <span className="truncate">
            Child: <strong className="text-amber-950">{currentBookContext.childName}</strong> • Theme:{' '}
            <strong className="text-amber-950">{currentBookContext.theme || 'Open'}</strong>
          </span>
          <span className="shrink-0 bg-amber-200/70 text-amber-900 px-1.5 py-0.5 rounded text-[10px] font-bold">
            Context Synced
          </span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0 text-sm shadow-sm mt-1">
                🐛
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-sm shadow-xs ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-xs'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed font-body">{msg.content}</div>
              <div
                className={`mt-1.5 flex items-center justify-between text-[10px] ${
                  msg.role === 'user' ? 'text-violet-200' : 'text-slate-400'
                }`}
              >
                <span>{msg.timestamp}</span>
                {msg.modelUsed && <span>{msg.modelUsed}</span>}
              </div>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 text-xs shadow-sm mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0 text-sm animate-bounce">
              🐛
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-3 text-slate-500 text-xs flex items-center gap-2 shadow-xs">
              <span className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-violet-500 animate-ping" />
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="w-2 h-2 rounded-full bg-purple-500" />
              </span>
              Barnaby is sketching ideas with {selectedModel}...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-2 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
        {quickPrompts.map((promptText, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(promptText)}
            disabled={isLoading}
            className="shrink-0 text-xs bg-slate-100 hover:bg-violet-50 hover:text-violet-700 text-slate-700 px-3 py-1.5 rounded-full transition-colors border border-slate-200 cursor-pointer disabled:opacity-50"
          >
            {promptText}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-white border-t border-slate-200 flex gap-2 items-center"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask Barnaby anything about ${currentBookContext?.childName || 'the book'}...`}
          disabled={isLoading}
          className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 font-body"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
