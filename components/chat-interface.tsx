'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/lib/chat-context';
import { Message } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatTimestamp } from '@/lib/utils-document';

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
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentChat.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-center">
            <div>
              <div className="text-4xl mb-2">💬</div>
              <p>No messages yet. Start by asking for an analysis of your report.</p>
            </div>
          </div>
        ) : (
          currentChat.messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground border border-border'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                <p className={`text-xs mt-2 ${
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
            <div className="bg-muted rounded-lg p-4 border border-border">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Alert */}
      {apiError && (
        <div className="px-4 pt-2">
          <Alert variant="destructive">
            <AlertDescription>
              <strong>Error:</strong> {apiError}
              <p className="text-xs mt-2">Check your Gemini API key in Settings</p>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border bg-background">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for analysis, feedback, or ask questions about your report..."
            disabled={isLoading}
            className="min-h-24 resize-none"
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
              className="flex-1"
            >
              {isLoading ? 'Analyzing...' : 'Send Message'}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => setInput('')}
            >
              Clear
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
