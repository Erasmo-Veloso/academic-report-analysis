'use client';

import { useChat } from '@/lib/chat-context';
import { ChatConfig } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatTimestamp, truncateText } from '@/lib/utils-document';

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

  return (
    <aside className="w-64 bg-muted border-r border-border h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <Link href="/" className="block">
          <h1 className="text-xl font-bold text-foreground hover:opacity-80 transition-opacity">
            Report Analyzer
          </h1>
        </Link>
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-b border-border">
        <Button onClick={handleNewChat} className="w-full" size="sm">
          + New Analysis
        </Button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No analyses yet
          </div>
        ) : (
          <div className="space-y-2 p-2">
            {chats.map(chat => (
              <div
                key={chat.id}
                onClick={() => setCurrentChat(chat.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                  currentChatId === chat.id
                    ? 'bg-background text-foreground'
                    : 'hover:bg-background text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="font-medium text-sm truncate">
                  {chat.title}
                </div>
                <div className="text-xs opacity-60 mt-1">
                  {formatTimestamp(chat.updatedAt)}
                </div>
                <div className="text-xs opacity-60">
                  {chat.config.workType} • {chat.config.academicLevel}
                </div>
                <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleExport(e, chat.id)}
                    className="text-xs px-2 py-1 rounded bg-accent text-accent-foreground hover:opacity-80"
                  >
                    Export
                  </button>
                  <button
                    onClick={(e) => handleDeleteChat(e, chat.id)}
                    className="text-xs px-2 py-1 rounded bg-destructive text-destructive-foreground hover:opacity-80"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <Link href="/settings">
          <Button variant="ghost" className="w-full text-sm justify-start">
            ⚙️ Settings
          </Button>
        </Link>
      </div>
    </aside>
  );
}
