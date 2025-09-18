'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Wrench, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { CertificationLevel, Message } from '@/types';
import { useSubscription } from '@/contexts/SubscriptionContext';
import SubscriptionBanner from '@/components/subscription/SubscriptionBanner';
import { csaContentService } from '@/services/csa/csaContentService';

interface ChatInterfaceProps {
  selectedLevel: CertificationLevel;
  onBack: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ selectedLevel, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { mode } = useSubscription();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message when component mounts
    const getWelcomeMessage = (): string => {
      const baseMessage = selectedLevel === 'G3'
        ? "Welcome to your G3 Gas Technician Tutor! This free version provides access to complete CSA B149.1-25 training content, code references, and study materials for G3 certification preparation covering natural gas appliances up to 400,000 BTU/hr, safety protocols, and code requirements from Units 1-9."
        : "Welcome to your G2 Gas Technician Tutor! This free version provides access to complete CSA B149.1-25 and B149.2-25 training content, code references, and study materials for G2 certification preparation covering all gas appliances, advanced installations, commercial systems, and complex scenarios from Units 10-24.";

      return baseMessage + "\\n\\n**Free Version Features:**\\n• Complete CSA training content access\\n• Code references and examples\\n• Study materials and guides\\n• Mobile-optimized learning\\n\\n**Upgrade to AI Tutor Pro for:**\\n• Unlimited AI explanations and tutoring\\n• Interactive Q&A sessions\\n• Personalized learning paths\\n• Advanced study analytics\\n\\n[**Upgrade to Pro - $9.99/month**](https://buy.stripe.com/5kQeVefxX2VmbCS0tO7ok05)";
    };

    const welcomeMessage: Message = {
      id: `welcome_${Date.now()}`,
      type: 'ai',
      role: 'assistant',
      content: getWelcomeMessage(),
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [selectedLevel]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    const newMessage: Message = {
      id: `user_${Date.now()}`,
      type: 'user',
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');

    try {
      // Search CSA content based on user query
      const csaContent = await csaContentService.generateCSAContent(userMessage, selectedLevel);

      const responseMessage: Message = {
        id: `csa_${Date.now()}`,
        type: 'ai',
        role: 'assistant',
        content: csaContent,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, responseMessage]);
    } catch (error) {
      // Fallback if CSA content service fails
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        type: 'ai',
        role: 'assistant',
        content: `**CSA Training Content Search**\\n\\nI'm searching our CSA B149.1-25 training database for information related to: "*${userMessage}*"\\n\\nThis free version provides access to all CSA training materials and study guides. For AI-powered explanations and interactive tutoring, upgrade to Pro.\\n\\n[**Upgrade to Pro - $9.99/month**](https://buy.stripe.com/5kQeVefxX2VmbCS0tO7ok05)`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 px-4 py-4">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-3 p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
            aria-label="Go back to selection"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <div className="flex items-center flex-1">
            <div className={`p-2 rounded-lg mr-3 ${
              selectedLevel === 'G3' ? 'bg-blue-500/20' : 'bg-red-500/20'
            }`}>
              <Wrench className={`h-5 w-5 ${
                selectedLevel === 'G3' ? 'text-blue-400' : 'text-red-400'
              }`} />
            </div>
            <div>
              <div className="text-white font-semibold tracking-wide">{selectedLevel} Gas Technician</div>
              <div className="text-slate-400 text-xs font-medium flex items-center">
                <div className="w-2 h-2 rounded-full mr-2 bg-orange-400"></div>
                Free Version • LARK Labs
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="16"
              viewBox="0 0 24 16"
              className="w-5 h-3"
              aria-label="Canada"
            >
              <rect width="24" height="16" fill="#FF0000"/>
              <path d="M12 8L6 4v8l6-4z" fill="#FFFFFF"/>
            </svg>
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">CSA</span>
          </div>
        </div>
      </div>

      {/* Subscription Banner */}
      <div className="px-4 pt-4">
        <SubscriptionBanner />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollable">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white ml-4'
                  : 'bg-slate-800/50 text-slate-100 mr-4 border border-slate-700/50'
              }`}
            >
              <div className="text-sm font-normal leading-relaxed">
                {message.type === 'ai' ? (
                  <ReactMarkdown
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-300 hover:text-blue-100 underline transition-colors cursor-pointer touch-manipulation"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                      strong: ({ node, ...props }) => (
                        <strong {...props} className="font-semibold text-white" />
                      ),
                      h1: ({ node, ...props }) => (
                        <h1 {...props} className="text-lg font-bold text-white mb-2" />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 {...props} className="text-base font-semibold text-white mb-2" />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 {...props} className="text-sm font-semibold text-white mb-1" />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul {...props} className="list-disc list-inside ml-2 mb-2" />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol {...props} className="list-decimal list-inside ml-2 mb-2" />
                      ),
                      li: ({ node, ...props }) => (
                        <li {...props} className="mb-1" />
                      ),
                      p: ({ node, ...props }) => (
                        <p {...props} className="mb-2 last:mb-0" />
                      ),
                      code: ({ node, ...props }) => (
                        <code {...props} className="bg-slate-700 px-1 py-0.5 rounded text-xs font-mono" />
                      )
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  message.content
                )}
              </div>
              <div className={`text-xs mt-2 font-medium ${
                message.type === 'user' ? 'text-blue-200' : 'text-slate-400'
              }`}>
                {message.timestamp instanceof Date ? message.timestamp.toLocaleTimeString() : message.timestamp}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-slate-800/30 border-t border-slate-700 px-4 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about gas codes, safety, or certification... (searches CSA training content)"
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-normal text-sm"
              aria-label="Ask question about gas codes and certification"
            />
          </div>
          <button
            onClick={sendMessage}
            className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:scale-105"
            aria-label="Send message"
          >
            <Send className="h-5 w-5 text-white" />
          </button>
        </div>
        <div className="mt-2 text-center">
          <span className="text-xs text-slate-500 font-medium">CSA B149.1-25 & B149.2-25 Compliant Training • Free Version</span>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;