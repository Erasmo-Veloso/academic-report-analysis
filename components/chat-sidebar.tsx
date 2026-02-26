'use client';

import { useChat } from '@/lib/chat-context';
import { ChatConfig } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatTimestamp, truncateText } from '@/lib/utils-document';
import { Download, Trash2, Plus, Settings } from 'lucide-react';

export function ChatSidebar() {
  const { chats, currentChatId, setCurrentChat, createChat, deleteChat, exportChatAsJson } = useChat();

  const handleNewChat = () => {
    const defaultConfig: ChatConfig = {
      academicLevel: 'undergraduate',
      norms: 'apa',
      workType: 'essay',
      theme: 'academic',
    };
    createChat(defaultConfig);
  };

  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this chat?')) {
      deleteChat(id);
    }
  };

  const handleExport = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    exportChatAsJson(id);
  };

  const isCurrentChat = (chatId: string) => currentChatId === chatId;

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border bg-gradient-to-r from-sidebar to-sidebar/95">
        <Link href="/" className="block group">
          <h1 className="text-lg font-bold text-sidebar-foreground group-hover:text-sidebar-primary transition-colors duration-200">
            Report Analyzer
          </h1>
          <p className="text-xs text-sidebar-foreground/60 mt-1">Academic Writing Assistant</p>
        </Link>
      </div>

      {/* New Chat Button */}
      <div className="p-3 border-b border-sidebar-border bg-sidebar/50">
        <Button 
          onClick={handleNewChat} 
          className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground shadow-md transition-all duration-200" 
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
          New Analysis
        </Button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-6 text-center text-sidebar-foreground/60 text-sm flex flex-col items-center justify-center h-full gap-2">
            <div className="opacity-50">📄</div>
            <p>No analyses yet</p>
            <p className="text-xs">Create a new one to get started</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {chats.map(chat => {
              const isCurrent = isCurrentChat(chat.id);
              return (
                <div
                  key={chat.id}
                  onClick={() => setCurrentChat(chat.id)}
                  className={`
                    group relative p-3 rounded-lg cursor-pointer transition-all duration-200
                    ${isCurrent
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                      : 'bg-sidebar hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground'
                    }
                  `}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setCurrentChat(chat.id);
                    }
                  }}
                  aria-current={isCurrent}
                  aria-label={`Chat: ${chat.title}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate leading-snug">
                        {chat.title}
                      </div>
                      <div className={`text-xs mt-1 opacity-70 ${isCurrent ? 'opacity-60' : ''}`}>
                        {formatTimestamp(chat.updatedAt)}
                      </div>
                      <div className={`text-xs opacity-60 ${isCurrent ? 'opacity-50' : ''}`}>
                        {chat.config.workType} • {chat.config.academicLevel}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div 
                    className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => handleExport(e, chat.id)}
                      className={`
                        p-1.5 rounded transition-all duration-200 flex-1
                        ${isCurrent
                          ? 'bg-sidebar-primary-foreground/20 hover:bg-sidebar-primary-foreground/30 text-sidebar-primary-foreground'
                          : 'bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80'
                        }
                      `}
                      title="Export chat"
                      aria-label={`Export ${chat.title}`}
                    >
                      <Download className="w-3.5 h-3.5 mx-auto" aria-hidden="true" />
                      <span className="sr-only">Export</span>
                    </button>
                    <button
                      onClick={(e) => handleDeleteChat(e, chat.id)}
                      className={`
                        p-1.5 rounded transition-all duration-200 flex-1
                        ${isCurrent
                          ? 'bg-sidebar-primary-foreground/20 hover:bg-red-500/30 text-red-400'
                          : 'bg-destructive text-destructive-foreground hover:bg-destructive/80'
                        }
                      `}
                      title="Delete chat"
                      aria-label={`Delete ${chat.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5 mx-auto" aria-hidden="true" />
                      <span className="sr-only">Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border bg-sidebar/50 space-y-2">
        <Link href="/settings" className="block">
          <Button 
            variant="ghost" 
            className="w-full text-sm justify-start text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent/50 transition-colors duration-200"
          >
            <Settings className="w-4 h-4 mr-2" aria-hidden="true" />
            Settings
          </Button>
        </Link>
      </div>
    </aside>
  );
}
