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
          <h1 className="text-4xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Configure your Academic Report Analyzer
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Google Gemini API Key</CardTitle>
            <CardDescription>
              Your API key is stored locally in your browser and never sent to our servers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
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
                  {showKey ? 'Hide' : 'Show'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Get your API key from{' '}
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
              {saved ? '✓ Saved' : 'Save API Key'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data & Privacy</CardTitle>
            <CardDescription>
              How your data is handled
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-2">
              <p className="font-semibold">Local Storage</p>
              <p className="text-muted-foreground">
                All your chats, configurations, and documents are stored locally in your browser's localStorage.
                They never leave your device unless you explicitly export them.
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold">API Requests</p>
              <p className="text-muted-foreground">
                When you send a report for analysis, the report content and your configuration are sent to Google's
                Gemini API. We do not store these requests on our servers.
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold">API Key Security</p>
              <p className="text-muted-foreground">
                Your Gemini API key is stored only in your browser's localStorage and is never logged,
                shared, or sent anywhere except directly to Google's API.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              Academic Report Analyzer v1.0
            </p>
            <p className="text-muted-foreground">
              Powered by Google Gemini
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
