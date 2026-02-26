import { PagedDocument } from './types';

export async function extractTextFromFile(file: File): Promise<PagedDocument[]> {
  const fileType = file.type;

  if (fileType === 'text/plain' || file.name.endsWith('.txt')) {
    const text = await file.text();
    return splitTextIntoPages(text);
  }

  if (fileType === 'application/pdf' || file.name.endsWith('.pdf')) {
    return await extractFromPDF(file);
  }

  if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.endsWith('.docx')
  ) {
    return await extractFromDOCX(file);
  }

  throw new Error(`Tipo de arquivo não suportado: ${file.name}`);
}

// Extract text from PDF
async function extractFromPDF(file: File): Promise<PagedDocument[]> {
  try {
    const { extractPDFPages } = await import('./pdf-processor');
    const result = await extractPDFPages(file, 8);
    return result.pages.map(page => ({
      pageNumber: page.pageNumber,
      text: page.text,
    }));
  } catch (error) {
    throw new Error(`Erro ao processar PDF: ${error instanceof Error ? error.message : 'Desconhecido'}`);
  }
}

// Extract text from DOCX
async function extractFromDOCX(file: File): Promise<PagedDocument[]> {
  try {
    const buffer = await file.arrayBuffer();
    // Basic DOCX text extraction - can be improved with mammoth library
    const text = buffer.toString();
    return splitTextIntoPages(text);
  } catch (error) {
    throw new Error(`Erro ao processar DOCX: ${error instanceof Error ? error.message : 'Desconhecido'}`);
  }
}

// Split text into pages (max 3000 chars per page)
function splitTextIntoPages(text: string, charsPerPage: number = 3000): PagedDocument[] {
  const pages: PagedDocument[] = [];
  let pageNum = 1;
  let startIndex = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + charsPerPage, text.length);
    const pageText = text.substring(startIndex, endIndex).trim();
    
    if (pageText) {
      pages.push({
        pageNumber: pageNum,
        text: pageText,
      });
      pageNum++;
    }

    startIndex = endIndex;
  }

  return pages.length > 0 ? pages : [{ pageNumber: 1, text }];
}

export function generateChatTitle(content: string): string {
  return content.substring(0, 50).trim() + (content.length > 50 ? '...' : '');
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString('pt-BR');
}

export function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars) + '...';
}
