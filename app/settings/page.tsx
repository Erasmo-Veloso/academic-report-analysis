"use client";

import { useState, useEffect } from "react";
import { useChat } from "@/lib/chat-context";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Menu, ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  const { getCohereKey, setCohereKey, setMobileMenuOpen } = useChat();
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const key = getCohereKey();
    if (key) {
      setApiKey(key);
    }
  }, [getCohereKey]);

  const handleSave = () => {
    setCohereKey(apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="flex-1 overflow-auto bg-background">
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
          <h2 className="font-semibold text-sm truncate">Configurações</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/")}
          className="shrink-0"
          aria-label="Voltar para home"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Configurações
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Configure seu Analisador de Relatórios Acadêmicos
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">
                Chave de API Cohere
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Sua chave de API é armazenada localmente no seu navegador
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key" className="text-sm">
                  Chave de API
                </Label>
                <div className="flex gap-2 flex-col sm:flex-row">
                  <Input
                    id="api-key"
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="flex-1 text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setShowKey(!showKey)}
                    className="px-3 text-sm whitespace-nowrap"
                  >
                    {showKey ? "Ocultar" : "Mostrar"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Obtenha sua chave em{" "}
                  <a
                    href="https://dashboard.cohere.ai/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-foreground"
                  >
                    Cohere Dashboard
                  </a>
                </p>
              </div>

              <Button
                onClick={handleSave}
                className="w-full text-sm md:text-base"
              >
                {saved ? "Salvo" : "Salvar Chave"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Sobre</CardTitle>
            </CardHeader>
            <CardContent className="text-xs md:text-sm text-muted-foreground space-y-2">
              <p>Analisador de Relatórios Acadêmicos v1.0</p>
              <p>Desenvolvido com Cohere AI</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
