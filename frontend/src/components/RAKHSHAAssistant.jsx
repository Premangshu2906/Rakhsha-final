import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Minus, X, ArrowRight, FileText, Shield, 
  Send, PhoneCall, AlertCircle, RefreshCw, HelpCircle, CheckCircle2, Bot 
} from 'lucide-react';
import { CHATBOT_CONTENT, detectIntent } from '../data/chatbotContent';

export default function RAKHSHAAssistant({
  onOpenCitizenAuth,
  onOpenOfficerAuth,
  onNavigateToComplaint,
  onGetImmediateHelp
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [language, setLanguage] = useState('en'); // 'en' or 'hi'
  const [inputText, setInputText] = useState('');
  
  // Message Trajectory state
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const chatWindowRef = useRef(null);

  const t = CHATBOT_CONTENT[language] || CHATBOT_CONTENT.en;

  // Initialize initial message when opening
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      resetChat();
    }
  }, [isOpen]);

  // Re-sync messages when language changes
  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'hi' : 'en';
    setLanguage(nextLang);
  };

  // Scroll to bottom on message update
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Keyboard trap escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const resetChat = () => {
    const initialContent = CHATBOT_CONTENT[language] || CHATBOT_CONTENT.en;
    setMessages([
      {
        id: 'msg_initial',
        sender: 'bot',
        text: initialContent.initial.greeting,
        options: initialContent.initial.options,
        timestamp: new Date()
      }
    ]);
  };

  const handleSelectOption = (optionId) => {
    const currentLangContent = CHATBOT_CONTENT[language] || CHATBOT_CONTENT.en;
    const flow = currentLangContent.flows[optionId] || currentLangContent.flows.fallback;

    // Add user selection message
    const selectedOptionObj = currentLangContent.initial.options.find(o => o.id === optionId) || 
                              currentLangContent.flows.fallback.options?.find(o => o.id === optionId);
    const userText = selectedOptionObj ? selectedOptionObj.text : optionId;

    const newMessages = [
      ...messages,
      {
        id: `user_${Date.now()}`,
        sender: 'user',
        text: userText,
        timestamp: new Date()
      }
    ];

    // Add bot response messages from flow
    if (flow.messages && flow.messages.length > 0) {
      flow.messages.forEach((msgText, idx) => {
        const isLast = idx === flow.messages.length - 1;
        newMessages.push({
          id: `bot_${Date.now()}_${idx}`,
          sender: 'bot',
          text: msgText,
          actionButton: isLast ? flow.actionButton : null,
          secondaryActions: isLast ? flow.secondaryActions : null,
          options: isLast ? flow.options : null,
          timestamp: new Date()
        });
      });
    }

    setMessages(newMessages);
  };

  const handleFlowTarget = (targetId) => {
    const currentLangContent = CHATBOT_CONTENT[language] || CHATBOT_CONTENT.en;
    const flow = currentLangContent.flows[targetId] || currentLangContent.flows.fallback;

    const newMessages = [...messages];

    if (flow.messages && flow.messages.length > 0) {
      flow.messages.forEach((msgText, idx) => {
        const isLast = idx === flow.messages.length - 1;
        newMessages.push({
          id: `bot_${Date.now()}_${idx}`,
          sender: 'bot',
          text: msgText,
          actionButton: isLast ? flow.actionButton : null,
          secondaryActions: isLast ? flow.secondaryActions : null,
          options: isLast ? flow.options : null,
          timestamp: new Date()
        });
      });
    }

    setMessages(newMessages);
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userQuery = inputText.trim();
    setInputText('');

    const intent = detectIntent(userQuery);
    const currentLangContent = CHATBOT_CONTENT[language] || CHATBOT_CONTENT.en;
    const flow = currentLangContent.flows[intent] || currentLangContent.flows.fallback;

    const newMessages = [
      ...messages,
      {
        id: `user_${Date.now()}`,
        sender: 'user',
        text: userQuery,
        timestamp: new Date()
      }
    ];

    if (flow.messages && flow.messages.length > 0) {
      flow.messages.forEach((msgText, idx) => {
        const isLast = idx === flow.messages.length - 1;
        newMessages.push({
          id: `bot_${Date.now()}_${idx}`,
          sender: 'bot',
          text: msgText,
          actionButton: isLast ? flow.actionButton : null,
          secondaryActions: isLast ? flow.secondaryActions : null,
          options: isLast ? flow.options : null,
          timestamp: new Date()
        });
      });
    }

    setMessages(newMessages);
  };

  const handleExecuteAction = (actionCode) => {
    switch (actionCode) {
      case 'OPEN_CITIZEN_AUTH':
        if (onOpenCitizenAuth) onOpenCitizenAuth();
        break;
      case 'OPEN_OFFICER_AUTH':
        if (onOpenOfficerAuth) onOpenOfficerAuth();
        break;
      case 'NAVIGATE_COMPLAINT_FORM':
        if (onNavigateToComplaint) onNavigateToComplaint();
        break;
      case 'CALL_14566':
        window.location.href = 'tel:14566';
        break;
      case 'CALL_112':
        window.location.href = 'tel:112';
        break;
      default:
        break;
    }
  };

  return (
    <>
      {/* -------------------------------------------------- */}
      {/* FLOATING ENTRY POINT BUTTON (Noticeable Bot Circle)*/}
      {/* -------------------------------------------------- */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          aria-label={t.header.title}
          aria-expanded={false}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 active:scale-95 text-white shadow-xl border-2 border-white/90 flex flex-col items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-400/40 cursor-pointer group ring-4 ring-blue-500/20"
          title={t.header.title}
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-7 h-7 text-white group-hover:rotate-6 transition-transform" />
            <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-blue-700 live-pulse-dot"></span>
          </div>
          <span className="text-[9px] font-extrabold uppercase tracking-tighter text-blue-100 mt-0.5 leading-none">
            RAKHSHA
          </span>
        </button>
      )}

      {/* -------------------------------------------------- */}
      {/* CHATBOT WINDOW / PANEL                             */}
      {/* -------------------------------------------------- */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          role="dialog"
          aria-label={t.header.title}
          aria-modal="true"
          className={`fixed z-50 bg-white border border-slate-200/90 shadow-2xl transition-all duration-300 flex flex-col ${
            isMinimized 
              ? 'bottom-5 right-5 w-72 h-14 rounded-2xl overflow-hidden' 
              : 'bottom-0 right-0 w-full sm:bottom-5 sm:right-5 sm:w-[400px] h-[85vh] sm:h-[580px] sm:max-h-[85vh] rounded-t-2xl sm:rounded-2xl'
          }`}
        >
          {/* -------------------------------------------------- */}
          {/* HEADER                                             */}
          {/* -------------------------------------------------- */}
          <div className="bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between shadow-sm flex-shrink-0 select-none">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600/30 border border-blue-400/40 rounded-xl flex items-center justify-center text-blue-300">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs sm:text-sm text-white tracking-tight leading-tight">
                  {t.header.title}
                </h3>
                {!isMinimized && (
                  <p className="text-[11px] text-slate-300 font-medium">
                    {t.header.subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Header Action Controls */}
            <div className="flex items-center space-x-1.5">
              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                title={t.header.switchLangAria}
                aria-label={t.header.switchLangAria}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg text-[11px] font-bold transition cursor-pointer"
              >
                {language === 'en' ? 'हिंदी' : 'EN'}
              </button>

              {/* Minimize Button */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={t.header.minimizeAria}
                aria-label={t.header.minimizeAria}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                title={t.header.closeAria}
                aria-label={t.header.closeAria}
                className="p-1.5 text-slate-400 hover:text-red-300 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* -------------------------------------------------- */}
          {/* BODY / MESSAGES AREA (If not minimized)            */}
          {/* -------------------------------------------------- */}
          {!isMinimized && (
            <>
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col space-y-2 ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    {/* Message Bubble */}
                    <div
                      className={`p-3.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-2xl rounded-tr-xs shadow-soft-sm max-w-[85%]'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-xs shadow-soft-sm max-w-[90%]'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Predefined Options Cards (If message contains primary options) */}
                    {msg.options && (
                      <div className="w-full space-y-2 pt-1">
                        {msg.options.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => handleSelectOption(opt.id)}
                            className="w-full text-left p-3.5 bg-white hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 hover:text-blue-900 transition flex items-center justify-between group cursor-pointer shadow-soft-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <div className="flex items-center space-x-2.5">
                              {opt.icon === 'FileText' && <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                              {opt.icon === 'Shield' && <Shield className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
                              <span>{opt.text}</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Direct Flow Action Button (e.g., "Continue to complaint registration") */}
                    {msg.actionButton && (
                      <div className="w-full pt-1">
                        <button
                          onClick={() => handleExecuteAction(msg.actionButton.action)}
                          className={`w-full py-3 px-4 ${
                            msg.actionButton.action.startsWith('CALL')
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          } font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center space-x-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          <span>{msg.actionButton.text}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Secondary Actions (e.g. "How do I fill complaint?") */}
                    {msg.secondaryActions && (
                      <div className="w-full flex flex-wrap gap-2 pt-1">
                        {msg.secondaryActions.map((sec, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              if (sec.target) handleFlowTarget(sec.target);
                              else if (sec.action) handleExecuteAction(sec.action);
                            }}
                            className="text-left px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 hover:text-slate-900 transition cursor-pointer"
                          >
                            &bull; {sec.text}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* -------------------------------------------------- */}
              {/* INPUT BAR (Query Input & Restart)                  */}
              {/* -------------------------------------------------- */}
              <div className="p-3 bg-white border-t border-slate-200 flex-shrink-0">
                <form onSubmit={handleTextSubmit} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={t.inputPlaceholder}
                    className="flex-1 bg-slate-50 text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  />
                  
                  <button
                    type="submit"
                    title="Send message"
                    aria-label="Send message"
                    disabled={!inputText.trim()}
                    className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition cursor-pointer flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={resetChat}
                    title="Restart chat"
                    aria-label="Restart chat"
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer flex-shrink-0"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </form>

                <div className="mt-2 text-[10px] text-center text-slate-600 font-medium">
                  RAKHSHA Guidance Assistant &bull; Confidential &amp; Safe
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
