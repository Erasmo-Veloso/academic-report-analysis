"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useChat } from "@/lib/chat-context";
import { Message } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatTimestamp } from "@/lib/utils-document";
import { FileSearch, Send, Settings2, Menu } from "lucide-react";

interface ChatInterfaceProps {
  onSendMessage: (content: string) => Promise<void>;
  isLoading?: boolean;
  onOpenConfig?: () => void;
}

export function ChatInterface({
  onSendMessage,
  isLoading = false,
  onOpenConfig,
}: ChatInterfaceProps) {
  const { currentChat, setMobileMenuOpen } = useChat();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  // Scroll when loading state changes
  useEffect(() => {
    if (isLoading) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isLoading]);

  if (!currentChat) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">
          Selecione ou crie uma análise para começar
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    try {
      const userMessage = input.trim();
      setInput("");
      await onSendMessage(userMessage);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Falha ao enviar mensagem",
      );
    }
  };

  const showSlashCommands = input.trimStart().startsWith("/");

  const handleAnalyzeCommand = async () => {
    if (isLoading) return;
    setInput("");
    try {
      await onSendMessage("/analisar");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Falha ao enviar mensagem",
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Mobile Header with Menu Button */}
      <div className="lg:hidden flex items-center gap-3 p-3 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
          className="shrink-0"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm truncate">
            {currentChat?.title || "Nova Análise"}
          </h2>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4"
        role="region"
        aria-label="Mensagens de análise"
        aria-live="polite"
        aria-atomic="false"
      >
        {currentChat.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-center px-4">
            <div>
              <div className="text-4xl md:text-5xl mb-3 opacity-20">💬</div>
              <p className="font-medium mb-1 text-sm md:text-base">
                Nenhuma mensagem ainda
              </p>
              <p className="text-xs md:text-sm">
                Comece solicitando uma análise do seu relatório.
              </p>
            </div>
          </div>
        ) : (
          currentChat.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`}
            >
              <div
                className={`max-w-[85%] md:max-w-2xl rounded-lg p-3 md:p-4 shadow-sm transition-all duration-200 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted text-foreground border border-border/50 rounded-bl-none"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
                  {message.content}
                </p>
                <p
                  className={`text-xs mt-2 font-medium ${
                    message.role === "user" ? "opacity-70" : "opacity-60"
                  }`}
                >
                  {formatTimestamp(message.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-muted rounded-lg px-4 py-3 border border-border/50 rounded-bl-none shadow-sm">
              <div className="flex gap-1.5">
                <div
                  className="w-2.5 h-2.5 bg-muted-foreground/60 rounded-full animate-bounce"
                  style={{ animationDuration: "1.4s", animationDelay: "0s" }}
                ></div>
                <div
                  className="w-2.5 h-2.5 bg-muted-foreground/60 rounded-full animate-bounce"
                  style={{ animationDuration: "1.4s", animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2.5 h-2.5 bg-muted-foreground/60 rounded-full animate-bounce"
                  style={{ animationDuration: "1.4s", animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - ChatGPT Style */}
      <div className="p-3 md:p-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            {showSlashCommands && !isLoading && (
              <div className="mb-2 rounded-xl border border-border bg-popover p-2 shadow-md">
                <button
                  type="button"
                  onClick={handleAnalyzeCommand}
                  className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-muted transition-colors"
                >
                  <FileSearch
                    className="w-4 h-4 text-primary"
                    aria-hidden="true"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      Analisar
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Executa análise completa do documento
                    </span>
                  </div>
                </button>
              </div>
            )}
            <div className="relative flex items-end gap-2 rounded-3xl border border-border bg-background shadow-sm focus-within:border-primary/50 focus-within:shadow-md transition-all duration-200">
              {/* Config Button */}
              {onOpenConfig && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={isLoading}
                  onClick={onOpenConfig}
                  className="absolute left-2 md:left-3 bottom-2.5 md:bottom-3 rounded-full hover:bg-muted w-8 h-8 md:w-10 md:h-10"
                  title="Configurações da análise"
                  aria-label="Abrir configurações"
                >
                  <Settings2
                    className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                </Button>
              )}

              {/* Textarea */}
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Converse normalmente ou use / para comandos"
                disabled={isLoading}
                className="flex-1 min-h-12 md:min-h-14 max-h-40 md:max-h-50 resize-none border-0 bg-transparent pl-11 md:pl-14 pr-11 md:pr-14 py-3 md:py-4 text-sm md:text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
                aria-label="Entrada de mensagem"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
                rows={1}
                style={{
                  scrollbarWidth: "thin",
                }}
              />

              {/* Send Button */}
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                size="icon"
                className="absolute right-2 md:right-3 bottom-2.5 md:bottom-3 rounded-full w-7 h-7 md:w-8 md:h-8 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground transition-all duration-200"
                aria-busy={isLoading}
                aria-label="Enviar mensagem"
              >
                {isLoading ? (
                  <div className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send
                    className="w-3.5 h-3.5 md:w-4 md:h-4"
                    aria-hidden="true"
                  />
                )}
              </Button>
            </div>

            {/* Helper Text */}
            <p className="text-xs text-muted-foreground text-center mt-2 hidden md:block">
              Pressione Enter para enviar, Shift + Enter para nova linha, / para
              comandos
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
