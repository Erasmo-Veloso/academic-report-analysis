import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface PDFPage {
  pageNumber: number;
  text: string;
}

export interface PDFExtractionResult {
  totalPages: number;
  pages: PDFPage[];
  fileName: string;
}

export async function extractPDFPages(file: File, maxPages: number = 8): Promise<PDFExtractionResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const totalPages = pdf.numPages;
    const pagesToProcess = Math.min(totalPages, maxPages);
    const pages: PDFPage[] = [];

    for (let pageNum = 1; pageNum <= pagesToProcess; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const text = textContent.items
        .map((item: any) => item.str)
        .join(' ')
        .trim();

      pages.push({
        pageNumber: pageNum,
        text,
      });
    }

    return {
      totalPages,
      pages,
      fileName: file.name,
    };
  } catch (error) {
    console.error('[v0] Erro ao extrair PDF:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Falha ao processar PDF'
    );
  }
}

