'use client';

import { useState, useRef } from 'react';
import { useChat } from '@/lib/chat-context';
import { truncateText } from '@/lib/utils-document';
import { extractPDFPages } from '@/lib/pdf-processor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, FileText, AlertTriangle } from 'lucide-react';

export function DocumentUpload() {
  const { currentChat, updateChatPages } = useChat();
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
      if (file.type.includes('pdf')) {
        const result = await extractPDFPages(file, 5);
        
        if (result.totalPages > 5) {
          setError(`PDF contém ${result.totalPages} páginas. Apenas as 5 primeiras foram processadas.`);
        }
        
        updateChatPages(currentChat.id, result.pages, file.name);
      } else if (file.type.includes('text') || file.name.endsWith('.txt')) {
        const text = await file.text();
        const pageData = {
          pageNumber: 1,
          text: text.slice(0, 3000),
          imageBase64: ''
        };
        updateChatPages(currentChat.id, [pageData], file.name);
      } else {
        throw new Error('Tipo de arquivo não suportado. Use PDF ou TXT.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao ler arquivo');
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearDocument = () => {
    if (currentChat.documentFileName && confirm('Limpar documento?')) {
      updateChatPages(currentChat.id, [], '');
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

  const pageCount = currentChat.pages?.length || 0;

  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" aria-hidden="true" />
          <div>
            <CardTitle className="text-base">Upload de Documento</CardTitle>
            <CardDescription className="text-xs">
              Envie seu relatório para análise
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
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
          aria-label="Enviar documento"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf"
            onChange={handleFileSelect}
            disabled={loading}
            className="hidden"
            aria-hidden="true"
          />
          <div className="space-y-2">
            <div className="flex justify-center">
              <Upload className={`w-8 h-8 ${isDragActive ? 'text-primary' : 'text-muted-foreground'} transition-colors`} aria-hidden="true" />
            </div>
            <p className="font-semibold text-foreground">Clique para enviar ou arraste um arquivo</p>
            <p className="text-xs text-muted-foreground">
              PDF ou TXT (Máx. 10MB)
            </p>
            {loading && <p className="text-sm text-primary font-medium animate-pulse">Processando...</p>}
          </div>
        </div>

        {pageCount > 0 && (
          <div className="space-y-3 p-3 bg-muted/50 rounded-lg border border-border/40">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {currentChat.documentFileName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {pageCount} página{pageCount !== 1 ? 's' : ''} processada{pageCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Page Thumbnails */}
            <div className="space-y-2">
              {currentChat.pages?.map((page, idx) => (
                <div key={idx} className="p-2 bg-background rounded border border-border/50 text-xs">
                  <p className="font-medium text-foreground mb-1">Página {page.pageNumber}</p>
                  {page.imageBase64 && (
                    <div className="mb-2 rounded bg-muted overflow-hidden max-h-24">
                      <img 
                        src={`data:image/jpeg;base64,${page.imageBase64}`} 
                        alt={`Página ${page.pageNumber}`}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}
                  <p className="text-muted-foreground truncate">
                    {truncateText(page.text, 100)}...
                  </p>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleClearDocument}
              className="w-full text-destructive hover:bg-destructive/10"
            >
              <X className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
              Limpar Documento
            </Button>
          </div>
        )}

        {pageCount === 0 && (
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 text-sm text-primary font-medium">
            <p>Nenhum documento enviado. Envie seu relatório para fornecer contexto para a análise.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
