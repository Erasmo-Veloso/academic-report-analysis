'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@/lib/chat-context';
import { Message, AnalysisRequest } from '@/lib/types';
import { ChatInterface } from '@/components/chat-interface';
import { ChatConfigPanel } from '@/components/chat-config-panel';
import { DocumentUpload } from '@/components/document-upload';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

export function HomePageContent() {
  const { currentChat, addMessage, getCohereKey } = useChat();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(true);

  const handleSendMessage = async (userMessage: string) => {
    if (!currentChat) return;

    // Add user message to chat
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    };
    addMessage(userMsg);

    setIsLoading(true);

    try {
      const apiKey = getCohereKey();
      if (!apiKey) {
        throw new Error('Chave de API Cohere não configurada. Configure em Configurações.');
      }

      // Check if user is asking for analysis
      const isAskingForAnalysis =
        userMessage.toLowerCase().includes('analisa') ||
        userMessage.toLowerCase().includes('análise') ||
        userMessage.toLowerCase().includes('revisão') ||
        userMessage.toLowerCase().includes('feedback') ||
        userMessage.toLowerCase().includes('avalia') ||
        userMessage.toLowerCase().includes('analizar');

      if (isAskingForAnalysis && currentChat.documentPages && currentChat.documentPages.length > 0) {
        // Send to text-only analysis API
        const payload: AnalysisRequest = {
          pages: currentChat.documentPages,
          config: currentChat.config,
          userContext: userMessage,
        };

        const response = await fetch('/api/analisar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-cohere-key': apiKey,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.details || error.error || 'Falha na análise');
        }

        const data = await response.json();

        // Format analysis result as a comprehensive chat message
        const analysis = data.analysis;
        const scoreLabel = analysis.score >= 80 ? 'Excelente' : analysis.score >= 60 ? 'Bom' : 'Precisa Melhorar';
        
        const analysisMessage = `**Análise Concluída**

**Pontuação: ${analysis.score}/100** (${scoreLabel})
**Qualidade: ${analysis.qualityLevel}**

---

**PROBLEMAS GERAIS:**
${analysis.generalProblems || 'Nenhum problema geral identificado'}

**PROBLEMAS POR PÁGINA:**
${analysis.pageProblems?.map(p => `• Página ${p.pageNumber}: ${p.problems}`).join('\n') || 'Nenhum problema por página identificado'}

**ERROS EM REFERÊNCIAS:**
${analysis.referenceErrors || 'Nenhum erro em referências'}

**SUGESTÕES DE MELHORIA:**
${analysis.suggestions || 'Nenhuma sugestão adicional'}`;

        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: analysisMessage,
          timestamp: Date.now(),
        };
        addMessage(assistantMsg);
      } else if (isAskingForAnalysis && (!currentChat.documentPages || currentChat.documentPages.length === 0)) {
        // User asked for analysis but no document uploaded
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Por favor, envie um documento primeiro para análise. Use a seção "Enviar Documento" na direita.',
          timestamp: Date.now(),
        };
        addMessage(assistantMsg);
      } else {
        // Regular conversation with Cohere
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-cohere-key': apiKey,
            },
            body: JSON.stringify({
              message: userMessage,
              documentContext: currentChat.documentPages?.[0]?.text || '',
              history: currentChat.messages.slice(-5),
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Falha na comunicação');
          }

          const data = await response.json();
          const assistantMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.response,
            timestamp: Date.now(),
          };
          addMessage(assistantMsg);
        } catch (chatError) {
          console.error('[v0] Chat error:', chatError);
          const assistantMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'Desculpe, houve um erro na comunicação. Tente novamente ou solicite uma análise de um documento.',
            timestamp: Date.now(),
          };
          addMessage(assistantMsg);
        }
      }
    } catch (error) {
      console.error('[v0] Erro:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        timestamp: Date.now(),
      };
      addMessage(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentChat) {
    return (
      <div className="flex items-center justify-center h-full px-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-foreground text-balance">
              Que relatórios vamos analisar hoje?
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Nosso analisador acadêmico examina seus documentos com inteligência artificial, 
              fornecendo feedback detalhado sobre estrutura, clareza, referências e muito mais. 
              Suportamos PDF, DOCX e TXT.
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
            <p className="text-sm font-medium text-foreground">
              Comece clicando em <span className="text-primary font-semibold">"+ Nova Análise"</span> na barra lateral
            </p>
          </div>

          <Button 
            onClick={() => window.location.href = '/#new-analysis'}
            size="lg"
            className="w-full"
          >
            + Criar Nova Análise
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full overflow-hidden p-4">
      {/* Main Chat Area */}
      <div className="lg:col-span-2 flex flex-col overflow-hidden rounded-lg border border-border bg-background shadow-sm">
        <ChatInterface onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>

      {/* Right Sidebar with Toggle */}
      <div className="overflow-hidden flex flex-col">
        {/* Toggle Button for Config Panel */}
        <Button
          onClick={() => setShowConfigPanel(!showConfigPanel)}
          variant="outline"
          size="sm"
          className="mb-3 w-full justify-between transition-all duration-200"
          aria-expanded={showConfigPanel}
          aria-controls="config-panel"
        >
          <span className="text-sm font-medium">Configuração</span>
          <ChevronRight 
            className={`w-4 h-4 transition-transform duration-300 ${
              showConfigPanel ? 'rotate-90' : ''
            }`}
            aria-hidden="true"
          />
        </Button>

        {/* Collapsible Config and Upload Area */}
        <div 
          id="config-panel"
          className={`
            flex-1 overflow-y-auto space-y-4 pr-2 transition-all duration-300
            ${showConfigPanel ? 'opacity-100 visible' : 'opacity-0 invisible h-0'}
          `}
        >
          {/* Configuration */}
          <ChatConfigPanel />

          {/* Document Upload */}
          <DocumentUpload />
        </div>
      </div>
    </div>
  );
}
