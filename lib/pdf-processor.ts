import * as pdfjsLib from 'pdfjs-dist';
import { PageData } from './types';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface PDFExtractionResult {
  totalPages: number;
  pages: PageData[];
  fileName: string;
  error?: string;
}

export async function extractPDFPages(file: File, maxPages: number = 5): Promise<PDFExtractionResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const totalPages = pdf.numPages;
    const pagesToProcess = Math.min(totalPages, maxPages);
    const pages: PageData[] = [];

    for (let pageNum = 1; pageNum <= pagesToProcess; pageNum++) {
      const page = await pdf.getPage(pageNum);
      
      // Extract text
      const textContent = await page.getTextContent();
      const text = textContent.items
        .map((item: any) => item.str)
        .join(' ');

      // Render page to image
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
      
      if (!canvas) {
        throw new Error('Canvas not available in this environment');
      }

      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context!,
        viewport: viewport,
      }).promise;

      const imageBase64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

      pages.push({
        pageNumber: pageNum,
        text: text.trim(),
        imageBase64,
      });
    }

    return {
      totalPages,
      pages,
      fileName: file.name,
    };
  } catch (error) {
    console.error('[v0] PDF extraction error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Falha ao processar PDF'
    );
  }
}

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const result = await extractPDFPages(file);
    return result.pages
      .map(page => `--- Página ${page.pageNumber} ---\n${page.text}`)
      .join('\n\n');
  } catch (error) {
    throw error;
  }
}
