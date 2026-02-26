'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@/lib/chat-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  const { getGeminiKey, setGeminiKey } = useChat();
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const key = getGeminiKey();
    if (key) {
      setApiKey(key);
    }
  }, [getGeminiKey]);

  const handleSave = () => {
    setGeminiKey(apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="flex-1 overflow-auto bg-background">
      <div className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Configurações</h1>
            <p className="text-muted-foreground">
              Configure seu Analisador de Relatórios Acadêmicos
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Chave de API do Google Gemini</CardTitle>
              <CardDescription>
                Sua chave de API é armazenada localmente no seu navegador e nunca é enviada aos nossos servidores.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">Chave de API</Label>
                <div className="flex gap-2">
                  <Input
                    id="api-key"
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setShowKey(!showKey)}
                    className="px-3"
                  >
                    {showKey ? 'Ocultar' : 'Mostrar'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Obtenha sua chave de API em{' '}
                  <a
                    href="https://makersuite.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-foreground"
                  >
                    Google AI Studio
                  </a>
                </p>
              </div>

              <Button onClick={handleSave} className="w-full">
                {saved ? '✓ Salvo' : 'Salvar Chave de API'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dados e Privacidade</CardTitle>
              <CardDescription>
                Como seus dados são processados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-2">
                <p className="font-semibold">Armazenamento Local</p>
                <p className="text-muted-foreground">
                  Todos os seus chats, configurações e documentos são armazenados localmente no localStorage do seu navegador.
                  Eles nunca saem do seu dispositivo a menos que você os exporte explicitamente.
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold">Requisições de API</p>
                <p className="text-muted-foreground">
                  Quando você envia um relatório para análise, o conteúdo e sua configuração são enviados para a API Gemini do Google.
                  Não armazenamos essas requisições em nossos servidores.
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold">Segurança da Chave de API</p>
                <p className="text-muted-foreground">
                  Sua chave de API Gemini é armazenada apenas no localStorage do seu navegador e nunca é registrada,
                  compartilhada ou enviada para qualquer lugar exceto diretamente para a API do Google.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sobre</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                Analisador de Relatórios Acadêmicos v1.0
              </p>
              <p className="text-muted-foreground">
                Desenvolvido com Google Gemini
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
