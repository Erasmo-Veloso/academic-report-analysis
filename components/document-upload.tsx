"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { useChat } from "@/lib/chat-context";
import { truncateText } from "@/lib/utils-document";
import { extractTextFromFile } from "@/lib/utils-document";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Upload,
  X,
  FileText,
  Replace,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export function DocumentUpload() {
  const { currentChat, updateChatPages } = useChat();
  const [loading, setLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [expandPreview, setExpandPreview] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentChat) {
    return null;
  }

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Arquivo muito grande. Máximo 10MB.");
      return;
    }

    setLoading(true);

    try {
      const pages = await extractTextFromFile(file);

      // Limita a 50 páginas máximo para análise
      const maxPages = 50;
      if (pages.length > maxPages) {
        toast.warning(
          `Documento contém muitas páginas (${pages.length}). Apenas as ${maxPages} primeiras foram processadas.`,
        );
        updateChatPages(currentChat.id, pages.slice(0, maxPages), file.name);
      } else {
        toast.success(`Documento carregado com ${pages.length} página(s)!`);
        updateChatPages(currentChat.id, pages, file.name);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao ler arquivo");
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClearDocument = () => {
    if (currentChat.documentFileName && confirm("Limpar documento?")) {
      updateChatPages(currentChat.id, [], "");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
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
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(event);
    }
  };

  const pageCount = currentChat.documentPages?.length || 0;

  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" aria-hidden="true" />
          <div>
            <CardTitle className="text-base">Enviar Documento</CardTitle>
            <CardDescription className="text-xs">
              Carregue seu relatório para análise
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Document Preview - Shown when document is loaded */}
        {pageCount > 0 && (
          <div className="space-y-3 p-4 bg-linear-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
            {/* Header with document info */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-sm font-semibold text-foreground truncate">
                    {currentChat.documentFileName}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {pageCount} página{pageCount !== 1 ? "s" : ""} processada
                  {pageCount !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => setExpandPreview(!expandPreview)}
                className="p-1.5 hover:bg-primary/10 rounded transition-colors shrink-0"
                aria-label={
                  expandPreview ? "Retrair preview" : "Expandir preview"
                }
              >
                {expandPreview ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>

            {/* Pages Preview - Expandable */}
            {expandPreview && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {currentChat.documentPages?.map((page, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-background rounded border border-border/50 text-xs hover:border-primary/30 transition-colors"
                  >
                    <p className="font-medium text-foreground mb-1.5">
                      Página {page.pageNumber}
                    </p>
                    <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                      {truncateText(page.text, 200)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="flex-1 text-primary border-primary/30 hover:bg-primary/5"
              >
                <Replace className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                Substituir
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearDocument}
                className="flex-1 text-destructive hover:bg-destructive/10"
              >
                <X className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                Remover
              </Button>
            </div>
          </div>
        )}

        {/* Upload Area */}
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer
            ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-primary/2.5"
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
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          aria-label="Enviar documento"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileSelect}
            disabled={loading}
            className="hidden"
            aria-hidden="true"
          />
          <div className="space-y-2">
            <div className="flex justify-center">
              <Upload
                className={`w-8 h-8 ${isDragActive ? "text-primary" : "text-muted-foreground"} transition-colors`}
                aria-hidden="true"
              />
            </div>
            <p className="font-semibold text-foreground">
              Clique para enviar ou arraste um arquivo
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, DOCX ou TXT (Máx. 10MB)
            </p>
            {loading && (
              <p className="text-sm text-primary font-medium animate-pulse">
                Processando...
              </p>
            )}
          </div>
        </div>

        {pageCount === 0 && (
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 text-sm text-primary font-medium text-center">
            <p>
              Nenhum documento enviado. Carregue seu relatório para fornecer
              contexto para a análise.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
