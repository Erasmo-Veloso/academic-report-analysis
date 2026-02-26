'use client';

import { useChat } from '@/lib/chat-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, FileText, BarChart3, Zap } from 'lucide-react';

export default function Page() {
  const { createChat } = useChat();
  const router = useRouter();

  const handleNewAnalysis = () => {
    const newChat = createChat();
    // Aguarda um tick do event loop para garantir sincronização de estado
    setTimeout(() => {
      router.push(`/analise/${newChat.id}`);
    }, 0);
  };

  return (
    <main className="flex-1 overflow-auto bg-background">
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="max-w-2xl w-full space-y-8">
          {/* Header */}
          <div className="space-y-4 text-center">
            <h1 className="text-5xl font-bold text-foreground text-balance">
              Analisador de Relatórios Acadêmicos
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Receba feedback detalhado sobre sua análise acadêmica com inteligência artificial.
              Suportamos PDF, DOCX e TXT.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-border/50">
              <CardContent className="pt-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Múltiplos Formatos</h3>
                  <p className="text-sm text-muted-foreground">PDF, DOCX e TXT</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Análise Estruturada</h3>
                  <p className="text-sm text-muted-foreground">Por página e geral</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Instant. com IA</h3>
                  <p className="text-sm text-muted-foreground">Feedback em tempo real</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6 border border-primary/20 text-center">
              <p className="text-foreground font-medium">Comece sua análise agora</p>
              <p className="text-sm text-muted-foreground">Configure suas preferências e carregue seu documento</p>
            </div>
            <Button onClick={handleNewAnalysis} size="lg" className="w-full">
              Criar Nova Análise
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Footer Note */}
          <p className="text-center text-xs text-muted-foreground">
            Suas análises são armazenadas localmente no seu navegador. Configure sua chave de API em Configurações.
          </p>
        </div>
      </div>
    </main>
  );
}
