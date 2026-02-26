'use client';

import { useState, useRef } from 'react';
import { useChat } from '@/lib/chat-context';
import { extractTextFromFile, truncateText } from '@/lib/utils-document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, FileText } from 'lucide-react';

export function DocumentUpload() {
  const { currentChat, updateChatDocument } = useChat();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const event = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(event);
    }
  };

  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" aria-hidden="true" />
          <div>
            <CardTitle className="text-base">Document Upload</CardTitle>
            <CardDescription className="text-xs">
              Upload your report for analysis
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div 
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer
            ${isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-primary/2.5'
            }
          `}
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          aria-label="Upload document"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf,.docx"
            onChange={handleFileSelect}
            disabled={loading}
            className="hidden"
            aria-hidden="true"
          />
          <div className="space-y-2">
            <div className="flex justify-center">
              <Upload className={`w-8 h-8 ${isDragActive ? 'text-primary' : 'text-muted-foreground'} transition-colors`} aria-hidden="true" />
            </div>
            <p className="font-semibold text-foreground">Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground">
              TXT, PDF, or DOCX (Max 10MB)
            </p>
            {loading && <p className="text-sm text-primary font-medium animate-pulse">Processing...</p>}
          </div>
        </div>

        {currentChat.documentFileName && (
          <div className="space-y-3 p-3 bg-muted/50 rounded-lg border border-border/40">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {currentChat.documentFileName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentChat.documentContent?.length || 0} characters
                </p>
              </div>
            </div>
            <div className="bg-background p-3 rounded border border-border/50 max-h-32 overflow-y-auto text-sm scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-xs">
                {truncateText(currentChat.documentContent || '', 300)}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearDocument}
              className="w-full text-destructive hover:bg-destructive/10"
            >
              <X className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
              Clear Document
            </Button>
          </div>
        )}

        {!currentChat.documentFileName && (
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 text-sm text-primary font-medium">
            <p>No document uploaded. Upload your report to provide context for analysis.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
