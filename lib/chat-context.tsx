'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Chat, ChatConfig, Message } from '@/lib/types';

interface ChatContextType {
  chats: Chat[];
  currentChatId: string | null;
  currentChat: Chat | null;
  
  createChat: (config: ChatConfig) => void;
  deleteChat: (id: string) => void;
  updateChatTitle: (id: string, title: string) => void;
  setCurrentChat: (id: string) => void;
  
  addMessage: (message: Message) => void;
  updateChatDocument: (id: string, content: string, fileName: string) => void;
  updateChatConfig: (id: string, config: Partial<ChatConfig>) => void;
  
  getGeminiKey: () => string | null;
  setGeminiKey: (key: string) => void;
  
  exportChatAsJson: (id: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedChats = localStorage.getItem('report_analyzer_chats');
    if (savedChats) {
      try {
        const parsed = JSON.parse(savedChats);
        setChats(parsed);
        if (parsed.length > 0) {
          setCurrentChatId(parsed[0].id);
        }
      } catch (e) {
        console.error('Failed to load chats:', e);
      }
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('report_analyzer_chats', JSON.stringify(chats));
  }, [chats]);

  const currentChat = chats.find(c => c.id === currentChatId) || null;

  const createChat = (config: ChatConfig) => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: `Analysis - ${new Date().toLocaleDateString()}`,
      config,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
  };

  const deleteChat = (id: string) => {
    setChats(prev => prev.filter(c => c.id !== id));
    if (currentChatId === id) {
      const remaining = chats.filter(c => c.id !== id);
      setCurrentChatId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const updateChatTitle = (id: string, title: string) => {
    setChats(prev =>
      prev.map(c =>
        c.id === id
          ? { ...c, title, updatedAt: Date.now() }
          : c
      )
    );
  };

  const setCurrentChat = (id: string) => {
    setCurrentChatId(id);
  };

  const addMessage = (message: Message) => {
    setChats(prev =>
      prev.map(c =>
        c.id === currentChatId
          ? {
              ...c,
              messages: [...c.messages, message],
              updatedAt: Date.now(),
            }
          : c
      )
    );
  };

  const updateChatDocument = (id: string, content: string, fileName: string) => {
    setChats(prev =>
      prev.map(c =>
        c.id === id
          ? {
              ...c,
              documentContent: content,
              documentFileName: fileName,
              updatedAt: Date.now(),
            }
          : c
      )
    );
  };

  const updateChatConfig = (id: string, config: Partial<ChatConfig>) => {
    setChats(prev =>
      prev.map(c =>
        c.id === id
          ? {
              ...c,
              config: { ...c.config, ...config },
              updatedAt: Date.now(),
            }
          : c
      )
    );
  };

  const getGeminiKey = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gemini_api_key');
    }
    return null;
  };

  const setGeminiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
  };

  const exportChatAsJson = (id: string) => {
    const chat = chats.find(c => c.id === id);
    if (!chat) return;

    const dataStr = JSON.stringify(chat, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-${chat.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChatId,
        currentChat,
        createChat,
        deleteChat,
        updateChatTitle,
        setCurrentChat,
        addMessage,
        updateChatDocument,
        updateChatConfig,
        getGeminiKey,
        setGeminiKey,
        exportChatAsJson,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
}
