'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/lib/chat-context';
import { Message } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatTimestamp } from '@/lib/utils-document';
import { Send, Trash } from 'lucide-react';

interface ChatInterfaceProps {
  onSendMessage: (content: string) => Promise<void>;
  isLoading?: boolean;
}

export function ChatInterface({ onSendMessage, isLoading = false }: ChatInterfaceProps) {
  const { currentChat } = useChat();
  const [input, setInput] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  if (!currentChat) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Select or create a chat to begin</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setApiError(null);
    try {
      const userMessage = input.trim();
      setInput('');
      await onSendMessage(userMessage);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Failed to send message');
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 bg-gradient-to-r from-background to-muted/30">
        <h2 className="text-sm font-semibold text-foreground">{currentChat.title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {currentChat.messages.length} message{currentChat.messages.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" role="region" aria-label="Chat messages" aria-live="polite" aria-atomic="false">
        {currentChat.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-center">
            <div>
              <div className="text-5xl mb-3 opacity-20">💬</div>
              <p className="font-medium mb-1">No messages yet</p>
              <p className="text-sm">Start by asking for an analysis of your report.</p>
            </div>
          </div>
        ) : (
          currentChat.messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
            >
              <div
                className={`max-w-2xl rounded-lg p-4 shadow-sm transition-all duration-200 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-muted text-foreground border border-border/50 rounded-bl-none'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                <p className={`text-xs mt-2 font-medium ${
                  message.role === 'user'
                    ? 'opacity-70'
                    : 'opacity-60'
                }`}>
                  {formatTimestamp(message.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-4 border border-border/50 rounded-bl-none">
              <div className="flex gap-2 items-center">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-muted-foreground ml-2">Analyzing...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Alert */}
      {apiError && (
        <div className="px-4 pt-2">
          <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
            <AlertDescription className="text-destructive">
              <strong className="block mb-1">Error:</strong> {apiError}
              <p className="text-xs mt-2 opacity-80">Check your Gemini API key in Settings</p>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border/50 bg-background/95 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for analysis, feedback, or questions about your report..."
            disabled={isLoading}
            className="min-h-20 resize-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Message input"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleSubmit(e as any);
              }
            }}
          />
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200"
              aria-busy={isLoading}
            >
              <Send className="w-4 h-4 mr-2" aria-hidden="true" />
              {isLoading ? 'Analyzing...' : 'Send'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={isLoading}
              onClick={() => setInput('')}
              title="Clear message"
              aria-label="Clear message input"
            >
              <Trash className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
