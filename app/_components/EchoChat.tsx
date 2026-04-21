/**
 * ECHO LiveOS 2.0 Chat Component dla DealSense
 * Potężny AI chat zamiast prostego bota
 * Czas tworzenia: 5 sekund 🚀
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'echo';
  timestamp: Date;
  confidence?: number;
  ethicalScore?: number;
  suggestions?: string[];
}

interface EchoChatProps {
  userId?: string;
  sessionId?: string;
  className?: string;
}

export default function EchoChat({ 
  userId = 'anonymous', 
  sessionId = 'default',
  className = '' 
}: EchoChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch('/api/echo/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText,
          userId,
          sessionId,
          context: {
            timestamp: Date.now(),
            source: 'dealsense_chat'
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        const echoMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          sender: 'echo',
          timestamp: new Date(),
          confidence: data.confidence,
          ethicalScore: data.ethicalScore,
          suggestions: data.suggestions
        };

        setMessages(prev => [...prev, echoMessage]);
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.fallbackResponse || 'Przepraszam, wystąpił błąd. Spróbuj ponownie.',
          sender: 'echo',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Przepraszam, wystąpił błąd połączenia. Spróbuj ponownie.',
        sender: 'echo',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
  };

  return (
    <div className={`flex flex-col h-full bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <div className="relative">
          <Bot className="w-6 h-6" />
          <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300" />
        </div>
        <div>
          <h3 className="font-semibold">ECHO LiveOS 2.0</h3>
          <p className="text-xs opacity-90">Twój inteligentny asystent zakupowy</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Witaj! Jestem ECHO - potężny AI asystent.</p>
            <p className="text-xs mt-1">Jak mogę Ci pomóc znaleźć najlepsze oferty?</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.sender === 'echo' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              </div>
            )}

            <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : ''}`}>
              <div
                className={`rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white ml-auto'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                
                {message.sender === 'echo' && (
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                    {message.confidence && (
                      <span>Pewność: {Math.round(message.confidence * 100)}%</span>
                    )}
                    {message.ethicalScore && (
                      <span>Etyka: {Math.round(message.ethicalScore * 100)}%</span>
                    )}
                  </div>
                )}
              </div>

              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-2 space-y-1">
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="block w-full text-left text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded transition-colors"
                    >
                      💡 {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {message.sender === 'user' && (
              <div className="flex-shrink-0 order-1">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Zapytaj o produkty, oferty, porady..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Wyślij
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          <Sparkles className="inline w-3 h-3 mr-1" />
          Wspierany przez ECHO LiveOS 2.0 • 100% etyczny • AI przyszłości
        </div>
      </div>
    </div>
  );
}
