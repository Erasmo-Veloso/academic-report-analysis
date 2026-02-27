"use client";

import { useState } from "react";
import { useChat } from "@/lib/chat-context";
import { Message, AnalysisRequest } from "@/lib/types";
import { ChatInterface } from "@/components/chat-interface";
import { ChatConfigPanel } from "@/components/chat-config-panel";
import { DocumentUpload } from "@/components/document-upload";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AnalysisChat() {
  const { currentChat, addMessage, getCohereKey } = useChat();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const handleSendMessage = async (userMessage: string) => {
    if (!currentChat) return;

    const normalizedMessage = userMessage.trim();
    const isAnalyzeCommand = /^\/analisar\b/i.test(normalizedMessage);
    const userMessageForDisplay = isAnalyzeCommand
      ? "Analisar documento com as configurações atuais"
      : userMessage;

    // Add user message to chat
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessageForDisplay,
      timestamp: Date.now(),
    };
    addMessage(userMsg);

    setIsLoading(true);

    try {
      const apiKey = getCohereKey();
      if (!apiKey) {
        throw new Error(
          "Chave de API Cohere não configurada. Configure em Configurações.",
        );
      }

      if (isAnalyzeCommand) {
        if (
          !currentChat.documentPages ||
          currentChat.documentPages.length === 0
        ) {
          throw new Error("Envie um documento antes de executar a análise.");
        }

        // Send to text-only analysis API
        const payload: AnalysisRequest = {
          pages: currentChat.documentPages,
          config: currentChat.config,
          userContext: "Analise o documento com base nas configurações atuais.",
        };

        const response = await fetch("/api/analisar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-cohere-key": apiKey,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.details || "Erro ao analisar documento");
        }

        const data = await response.json();

        // Format analysis result as a comprehensive chat message
        const analysis = data.analysis;
        const scoreLabel =
          analysis.score >= 80
            ? "Excelente"
            : analysis.score >= 60
              ? "Bom"
              : "Precisa Melhorar";

        const analysisMessage = `**Análise Concluída**

**Pontuação: ${analysis.score}/100** (${scoreLabel})
**Qualidade: ${analysis.qualityLevel}**

---

**PROBLEMAS GERAIS:**
${analysis.generalProblems || "Nenhum problema geral identificado"}

**PROBLEMAS POR PÁGINA:**
${analysis.pageProblems?.map((p) => `• Página ${p.pageNumber}: ${p.problems}`).join("\n") || "Nenhum problema por página identificado"}

**ERROS EM REFERÊNCIAS:**
${analysis.referenceErrors || "Nenhum erro em referências"}

**SUGESTÕES DE MELHORIA:**
${analysis.suggestions || "Nenhuma sugestão adicional"}`;

        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: analysisMessage,
          timestamp: Date.now(),
        };
        addMessage(assistantMsg);
      } else {
        // Regular conversation with Cohere
        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-cohere-key": apiKey,
            },
            body: JSON.stringify({
              message: userMessage,
              documentContext: currentChat.documentPages?.[0]?.text || "",
              history: currentChat.messages.slice(-5),
            }),
          });

          if (!response.ok) {
            throw new Error("Erro ao enviar mensagem");
          }

          const data = await response.json();
          const assistantMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content:
              data.response || "Desculpe, não consegui processar sua mensagem.",
            timestamp: Date.now(),
          };
          addMessage(assistantMsg);
        } catch (error) {
          console.error("[v0] Erro na conversa:", error);
          const errorMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `Erro: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
            timestamp: Date.now(),
          };
          addMessage(errorMsg);
        }
      }
    } catch (error) {
      console.error("[v0] Erro:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Erro: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        timestamp: Date.now(),
      };
      addMessage(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeFromConfig = async () => {
    setShowConfigModal(false);
    await handleSendMessage("/analisar");
  };

  return (
    <>
      {/* Main Chat Area - Full Screen */}
      <div className="flex flex-col h-full overflow-hidden bg-background">
        <ChatInterface
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onOpenConfig={() => setShowConfigModal(true)}
        />
      </div>

      {/* Configuration Modal */}
      <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
        <DialogContent className="max-w-full md:max-w-2xl max-h-[90vh] md:max-h-[85vh] w-[calc(100%-2rem)] md:w-full">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">
              Configurações da Análise
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-10rem)] md:max-h-[calc(85vh-8rem)] pr-2 md:pr-4">
            <div className="space-y-4 md:space-y-6">
              <ChatConfigPanel />
              <DocumentUpload />
            </div>
          </ScrollArea>
          <div className="pt-2 border-t border-border/60 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfigModal(false)}
              className="text-sm md:text-base"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAnalyzeFromConfig}
              disabled={isLoading}
              className="text-sm md:text-base"
            >
              Analisar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
