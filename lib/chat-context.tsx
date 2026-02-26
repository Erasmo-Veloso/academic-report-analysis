'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Chat, ChatConfig, Message, PagedDocument } from '@/lib/types';

interface ChatContextType {
  chats: Chat[];
  currentChatId: string | null;
  currentChat: Chat | null;

  createChat: (config?: ChatConfig) => Chat;
  deleteChat: (id: string) => void;
  updateChatTitle: (id: string, title: string) => void;
  setCurrentChat: (id: string) => void;

  addMessage: (message: Message) => void;
  updateChatDocument: (id: string, content: string, fileName: string) => void;
  updateChatPages: (id: string, pages: PagedDocument[], fileName: string) => void;
  updateChatConfig: (id: string, config: Partial<ChatConfig>) => void;

  getCohereKey: () => string | null;
  setCohereKey: (key: string) => void;

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
      } catch (e) {
        console.error('[v0] Falha ao carregar análises:', e);
      }
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('report_analyzer_chats', JSON.stringify(chats));
  }, [chats]);

  const currentChat = chats.find(c => c.id === currentChatId) || null;

  const createChat = (config?: ChatConfig): Chat => {
    const defaultConfig: ChatConfig = config || {
      academicLevel: 'graduacao',
      norms: 'abnt',
      workType: 'relatorio_escolar',
      focusAnalysis: 'todos',
    };

    const newChat: Chat = {
      id: Date.now().toString(),
      title: `Análise - ${new Date().toLocaleDateString('pt-BR')}`,
      config: defaultConfig,
      messages: [],
      documentPages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    return newChat;
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
            documentFileName: fileName,
            updatedAt: Date.now(),
          }
          : c
      )
    );
  };

  const updateChatPages = (id: string, pages: PagedDocument[], fileName: string) => {
    setChats(prev =>
      prev.map(c =>
        c.id === id
          ? {
            ...c,
            documentPages: pages,
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

  const getCohereKey = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cohere_api_key');
    }
    return null;
  };

  const setCohereKey = (key: string) => {
    localStorage.setItem('cohere_api_key', key);
  };

  const exportChatAsJson = (id: string) => {
    const chat = chats.find(c => c.id === id);
    if (!chat) return;

    const dataStr = JSON.stringify(chat, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analise-${chat.id}.json`;
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
        updateChatPages,
        updateChatConfig,
        getCohereKey,
        setCohereKey,
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
    throw new Error('useChat deve ser usado dentro de ChatProvider');
  }
  return context;
}
