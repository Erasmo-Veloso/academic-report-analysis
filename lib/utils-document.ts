import { PagedDocument } from "./types";

/**
 * Extrai texto de um arquivo (PDF, DOCX ou TXT)
 * Retorna array de páginas com conteúdo estruturado
 */
export async function extractTextFromFile(
  file: File,
): Promise<PagedDocument[]> {
  const fileType = file.type;

  if (fileType === "text/plain" || file.name.endsWith(".txt")) {
    const text = await file.text();
    return splitTextIntoPages(text, 3000);
  }

  if (fileType === "application/pdf" || file.name.endsWith(".pdf")) {
    return await extractFromPDF(file);
  }

  if (
    fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.endsWith(".docx")
  ) {
    return await extractFromDOCX(file);
  }

  throw new Error(`Tipo de arquivo não suportado: ${file.name}`);
}

/**
 * Extrai texto de PDF com suporte a múltiplas páginas
 * Preserva estrutura de parágrafos e formata o texto
 */
async function extractFromPDF(file: File): Promise<PagedDocument[]> {
  try {
    const { extractPDFPages } = await import("./pdf-processor");
    const result = await extractPDFPages(file, 8);

    return result.pages
      .map((page) => ({
        pageNumber: page.pageNumber,
        text: cleanAndFormatText(page.text),
      }))
      .filter((page) => page.text.length > 0);
  } catch (error) {
    throw new Error(
      `Erro ao processar PDF: ${error instanceof Error ? error.message : "Desconhecido"}`,
    );
  }
}

/**
 * Extrai texto de DOCX usando a biblioteca Mammoth
 * Preserva formatação de parágrafos e listas
 */
async function extractFromDOCX(file: File): Promise<PagedDocument[]> {
  try {
    // Importa mammoth dinamicamente (client-side)
    const mammoth = await import("mammoth");
    const arrayBuffer = await file.arrayBuffer();

    // Extrai com mammoth - suporta parágrafos, listas, etc
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value;

    if (!text || text.trim().length === 0) {
      throw new Error("Documento vazio ou inválido");
    }

    // Para DOCX, usa 4000 caracteres por página para preservar mais contexto
    return splitTextIntoPages(cleanAndFormatText(text), 4000);
  } catch (error) {
    // Fallback: tenta extrair como ZIP se mammoth falhar
    if (error instanceof Error && error.message.includes("ZIP")) {
      throw new Error("Arquivo DOCX corrompido ou inválido");
    }
    throw new Error(
      `Erro ao processar DOCX: ${error instanceof Error ? error.message : "Desconhecido"}`,
    );
  }
}

/**
 * Limpa e formata texto: remove espaços extras, normaliza quebras
 */
function cleanAndFormatText(text: string): string {
  return (
    text
      // Remove espaços múltiplos
      .replace(/\s+/g, " ")
      // Limpa quebras de linha extras
      .replace(/\n\s*\n/g, "\n")
      // Remove tabs
      .replace(/\t/g, " ")
      // Normaliza espaçamento
      .trim()
  );
}

/**
 * Divide texto em páginas respeitando parágrafos
 * Não quebra no meio de uma frase
 * @param text - Texto a ser dividido
 * @param maxCharsPerPage - Máximo de caracteres por página (padrão 3000)
 */
function splitTextIntoPages(
  text: string,
  maxCharsPerPage: number = 3000,
): PagedDocument[] {
  const pages: PagedDocument[] = [];

  // Se o texto é pequeno, retorna como uma página
  if (text.length <= maxCharsPerPage) {
    return [{ pageNumber: 1, text: text.trim() }];
  }

  // Divide por parágrafos primeiro (linha em branco)
  const paragraphs = text.split("\n").filter((p) => p.trim().length > 0);

  // Se há muito poucos parágrafos, pode ter muito texto concentrado
  // Nesse caso, divide por frases também
  if (paragraphs.length < 3 && text.length > maxCharsPerPage * 2) {
    return splitByParagraphsOrSentences(text, maxCharsPerPage, true);
  }

  let currentPageText = "";
  let pageNum = 1;

  for (const paragraph of paragraphs) {
    const paragraphWithNewline = paragraph + "\n";

    // Se adicionar parágrafo ultrapassar limite, cria nova página
    if (
      currentPageText.length + paragraphWithNewline.length > maxCharsPerPage &&
      currentPageText.length > 0
    ) {
      pages.push({
        pageNumber: pageNum,
        text: currentPageText.trim(),
      });
      currentPageText = "";
      pageNum++;
    }

    // Se parágrafo é muito grande, divide em chunks
    if (paragraphWithNewline.length > maxCharsPerPage) {
      if (currentPageText.length > 0) {
        pages.push({
          pageNumber: pageNum,
          text: currentPageText.trim(),
        });
        pageNum++;
        currentPageText = "";
      }

      // Divide parágrafo grande por frases (pontos)
      const sentences = paragraph.split(/(?<=[.!?])\s+/);
      let chunkText = "";

      for (const sentence of sentences) {
        if (chunkText.length + sentence.length + 1 > maxCharsPerPage) {
          if (chunkText.length > 0) {
            pages.push({
              pageNumber: pageNum,
              text: chunkText.trim(),
            });
            pageNum++;
            chunkText = "";
          }
        }
        chunkText += (chunkText ? " " : "") + sentence;
      }

      if (chunkText.length > 0) {
        currentPageText = chunkText;
      }
    } else {
      currentPageText += paragraphWithNewline;
    }
  }

  // Adiciona última página
  if (currentPageText.trim().length > 0) {
    pages.push({
      pageNumber: pageNum,
      text: currentPageText.trim(),
    });
  }

  return pages.length > 0 ? pages : [{ pageNumber: 1, text: text.trim() }];
}

/**
 * Divide texto por parágrafos/frases quando há poucos parágrafos
 */
function splitByParagraphsOrSentences(
  text: string,
  maxCharsPerPage: number,
  bySentences: boolean = false,
): PagedDocument[] {
  const pages: PagedDocument[] = [];
  let currentPage = "";
  let pageNum = 1;

  const items = bySentences
    ? text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0)
    : text.split("\n").filter((p) => p.trim().length > 0);

  for (const item of items) {
    const trimmed = item.trim();
    if (!trimmed) continue;

    if (
      currentPage.length + trimmed.length + 1 > maxCharsPerPage &&
      currentPage.length > 0
    ) {
      pages.push({
        pageNumber: pageNum++,
        text: currentPage.trim(),
      });
      currentPage = "";
    }

    currentPage += (currentPage ? (bySentences ? " " : "\n") : "") + trimmed;
  }

  if (currentPage.trim()) {
    pages.push({
      pageNumber: pageNum,
      text: currentPage.trim(),
    });
  }

  return pages.length > 0 ? pages : [{ pageNumber: 1, text }];
}

export function generateChatTitle(content: string): string {
  return content.substring(0, 50).trim() + (content.length > 50 ? "..." : "");
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString("pt-BR");
}

export function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars) + "...";
}
