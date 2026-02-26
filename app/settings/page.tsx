'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@/lib/chat-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const { getCohereKey, setCohereKey } = useChat();
  const [apiKey, setApiKey] = useState('');
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
              <CardTitle>Chave de API Cohere</CardTitle>
              <CardDescription>
                Sua chave de API é armazenada localmente no seu navegador
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
                  Obtenha sua chave em{' '}
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

              <Button onClick={handleSave} className="w-full">
                {saved ? 'Salvo' : 'Salvar Chave'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sobre</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Analisador de Relatórios Acadêmicos v1.0</p>
              <p>Desenvolvido com Cohere AI</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
