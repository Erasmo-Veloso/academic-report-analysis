"use client";

import { useState } from "react";
import { useChat } from "@/lib/chat-context";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { formatTimestamp, truncateText } from "@/lib/utils-document";
import { MoreVertical, Trash2, Plus, Settings, Edit2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ChatSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function ChatSidebar({
  mobileOpen,
  onMobileClose,
}: ChatSidebarProps = {}) {
  const {
    chats,
    currentChatId,
    createChat,
    deleteChat,
    setCurrentChat,
    exportChatAsJson,
    updateChatTitle,
  } = useChat();
  const router = useRouter();
  const [editingChat, setEditingChat] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const handleNewChat = () => {
    const newChat = createChat();
    router.push(`/analise/${newChat.id}`);
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChat(chatId);
    router.push(`/analise/${chatId}`);
    onMobileClose?.(); // Close mobile drawer after selection
  };

  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja deletar esta análise?")) {
      deleteChat(id);
      if (currentChatId === id) {
        router.push("/");
      }
    }
  };

  const handleExport = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    exportChatAsJson(id);
  };

  const handleEditChat = (
    e: React.MouseEvent,
    chat: { id: string; title: string },
  ) => {
    e.stopPropagation();
    setEditingChat(chat);
    setNewTitle(chat.title);
  };

  const handleSaveTitle = () => {
    if (editingChat && newTitle.trim()) {
      updateChatTitle(editingChat.id, newTitle.trim());
      setEditingChat(null);
      setNewTitle("");
    }
  };

  const isCurrentChat = (chatId: string) => currentChatId === chatId;

  // Sidebar content to be reused in both desktop and mobile versions
  const SidebarContent = () => (
    <div className="bg-sidebar border-sidebar-border h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border bg-linear-to-r from-sidebar to-sidebar/95">
        <button
          onClick={() => {
            router.push("/");
            onMobileClose?.();
          }}
          className="block group w-full text-left hover:opacity-80 transition-opacity"
        >
          <h1 className="text-lg font-bold text-sidebar-foreground group-hover:text-sidebar-primary transition-colors duration-200">
            Analisador de Relatórios
          </h1>
          <p className="text-xs text-sidebar-foreground/60 mt-1">
            Assistente de Escrita Acadêmica
          </p>
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3 border-b border-sidebar-border bg-sidebar/50">
        <Button
          onClick={() => {
            handleNewChat();
            onMobileClose?.();
          }}
          className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground shadow-md transition-all duration-200"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
          Nova Análise
        </Button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-6 text-center text-sidebar-foreground/60 text-sm flex flex-col items-center justify-center h-full gap-2">
            <div className="opacity-50">📄</div>
            <p>Nenhuma análise ainda</p>
            <p className="text-xs">Crie uma nova para começar</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {chats.map((chat) => {
              const isCurrent = isCurrentChat(chat.id);
              return (
                <div
                  key={chat.id}
                  className={`
                    group relative rounded-lg transition-all duration-200 flex items-center gap-2
                    ${
                      isCurrent
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                        : "bg-sidebar hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground"
                    }
                  `}
                >
                  {/* Main clickable area */}
                  <button
                    onClick={() => handleSelectChat(chat.id)}
                    className="flex-1 p-3 text-left min-w-0"
                    aria-current={isCurrent}
                    aria-label={`Análise: ${chat.title}`}
                  >
                    <div className="font-medium text-sm truncate leading-snug">
                      {chat.title}
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`
                          p-2 mr-2 rounded-md transition-all duration-200
                          ${
                            isCurrent
                              ? "text-sidebar-primary-foreground/70 hover:text-sidebar-primary-foreground hover:bg-sidebar-primary-foreground/10"
                              : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                          }
                          opacity-0 group-hover:opacity-100 focus:opacity-100
                        `}
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Opções da análise"
                      >
                        <MoreVertical className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={(e) =>
                          handleEditChat(e as any, {
                            id: chat.id,
                            title: chat.title,
                          })
                        }
                        className="cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Renomear
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => handleDeleteChat(e as any, chat.id)}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border bg-sidebar/50 space-y-2">
        <Button
          onClick={() => {
            router.push("/settings");
            onMobileClose?.();
          }}
          variant="ghost"
          className="w-full text-sm justify-start text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent/50 transition-colors duration-200"
        >
          <Settings className="w-4 h-4 mr-2" aria-hidden="true" />
          Configurações
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar - Always visible on large screens */}
      <aside className="hidden lg:block w-64 border-r shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar - Sheet/Drawer */}
      <Sheet
        open={mobileOpen}
        onOpenChange={(open) => !open && onMobileClose?.()}
      >
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Rename Dialog */}
      <Dialog
        open={!!editingChat}
        onOpenChange={(open) => !open && setEditingChat(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear Análise</DialogTitle>
            <DialogDescription>
              Escolha um novo nome para esta análise.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="chat-title">Nome da Análise</Label>
            <Input
              id="chat-title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Digite o novo nome..."
              className="mt-2"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveTitle();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingChat(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTitle} disabled={!newTitle.trim()}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
