'use client';

import { useState, useRef } from 'react';
import { useChat } from '@/lib/chat-context';
import { extractTextFromFile, truncateText } from '@/lib/utils-document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function DocumentUpload() {
  const { currentChat, updateChatDocument } = useChat();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentChat) {
    return null;
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const text = await extractTextFromFile(file);
      updateChatDocument(currentChat.id, text, file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read file');
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearDocument = () => {
    if (currentChat.documentFileName && confirm('Clear document?')) {
      updateChatDocument(currentChat.id, '', '');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Document Upload</CardTitle>
        <CardDescription>
          Upload your report for analysis (TXT files supported)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf,.docx"
            onChange={handleFileSelect}
            disabled={loading}
            className="hidden"
          />
          <div className="space-y-2">
            <div className="text-2xl">📄</div>
            <p className="font-semibold">Click to upload or drag and drop</p>
            <p className="text-sm text-muted-foreground">
              TXT, PDF, or DOCX (Max 10MB)
            </p>
            {loading && <p className="text-sm text-primary animate-pulse">Loading...</p>}
          </div>
        </div>

        {currentChat.documentFileName && (
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {currentChat.documentFileName}
              </p>
              <p className="text-xs text-muted-foreground">
                {currentChat.documentContent?.length || 0} characters
              </p>
            </div>
            <div className="bg-background p-3 rounded border border-border max-h-48 overflow-y-auto text-sm">
              <p className="text-muted-foreground whitespace-pre-wrap">
                {truncateText(currentChat.documentContent || '', 500)}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearDocument}
              className="w-full"
            >
              Clear Document
            </Button>
          </div>
        )}

        {!currentChat.documentFileName && (
          <div className="p-4 bg-accent/10 rounded-lg text-sm text-accent-foreground">
            <p>No document uploaded yet. Upload your report to provide context for analysis.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
