"use client";

import { useChat } from "@/lib/chat-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, FileText, BarChart3, Zap } from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import { projectData } from "@/lib/project-data";

export default function Page() {
  const { createChat } = useChat();
  const router = useRouter();

  const handleNewAnalysis = () => {
    const newChat = createChat();
    router.push(`/analise/${newChat.id}`);
  };

  return (
    <main className="flex-1 overflow-auto bg-background">
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 md:py-0">
        <div className="max-w-2xl w-full space-y-6 md:space-y-8">
          {/* Header */}
          <div className="space-y-3 md:space-y-4 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground text-balance">
              Analisador de Relatórios Acadêmicos
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Receba feedback detalhado sobre sua análise acadêmica com
              inteligência artificial. Suportamos PDF, DOCX e TXT.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <Card className="border-border/50">
              <CardContent className="pt-5 md:pt-6 space-y-2 md:space-y-3">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm md:text-base">
                    Múltiplos Formatos
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    PDF, DOCX e TXT
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-5 md:pt-6 space-y-2 md:space-y-3">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm md:text-base">
                    Análise Estruturada
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Por página e geral
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm md:text-base">
                    Instant. com IA
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Feedback em tempo real
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="space-y-3 md:space-y-4">
            <Button
              onClick={handleNewAnalysis}
              size="lg"
              className="w-full text-sm md:text-base"
            >
              Criar Nova Análise
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Footer Note */}
          <p className="text-center text-xs md:text-sm text-muted-foreground px-2">
            Suas análises são armazenadas localmente no seu navegador. Configure
            sua chave de API em Configurações.
          </p>

          {/* Project Card */}
          <div className="pt-2">
            <p className="text-xs text-muted-foreground/60 text-center mb-3 uppercase tracking-wide font-medium">
              Sobre este projecto
            </p>
            <ProjectCard project={projectData} />
          </div>
        </div>
      </div>
    </main>
  );
}
