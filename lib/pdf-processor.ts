import * as pdfjsLib from "pdfjs-dist";

// Configurar worker para usar arquivo local em vez do CDN
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

export interface PDFPage {
  pageNumber: number;
  text: string;
}

export interface PDFExtractionResult {
  totalPages: number;
  pages: PDFPage[];
  fileName: string;
}

/**
 * Extrai texto de um arquivo PDF página por página
 * Preserva estrutura de parágrafos e formata o texto
 */
export async function extractPDFPages(
  file: File,
  maxPages: number = 50,
): Promise<PDFExtractionResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const totalPages = pdf.numPages;
    const pagesToProcess = Math.min(totalPages, maxPages);
    const pages: PDFPage[] = [];

    for (let pageNum = 1; pageNum <= pagesToProcess; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Extrai texto agrupando por linhas (respeitando layout)
      const text = extractTextWithStructure(textContent);

      pages.push({
        pageNumber: pageNum,
        text: text.trim(),
      });
    }

    return {
      totalPages,
      pages,
      fileName: file.name,
    };
  } catch (error) {
    console.error("[v0] Erro ao extrair PDF:", error);
    throw new Error(
      error instanceof Error ? error.message : "Falha ao processar PDF",
    );
  }
}

/**
 * Extrai texto preservando estrutura de linhas e parágrafos
 * Agrupa items por proximidade vertical para manter contexto
 */
function extractTextWithStructure(textContent: any): string {
  if (!textContent.items || textContent.items.length === 0) {
    return "";
  }

  // Agrupa items por linha (mesmo Y aproximado)
  const lines: Map<number, string[]> = new Map();
  const lineHeight = 12; // Tolerância em pixels para agrupar na mesma linha

  for (const item of textContent.items) {
    if (!item.str || !item.str.trim()) continue;

    // Encontra linha mais próxima
    let closestLineY = null;
    let minDistance = lineHeight;

    for (const existingY of lines.keys()) {
      const distance = Math.abs(existingY - item.y);
      if (distance < minDistance) {
        minDistance = distance;
        closestLineY = existingY;
      }
    }

    // Se não encontrou linha próxima, cria nova
    if (closestLineY === null) {
      closestLineY = item.y;
    }

    if (!lines.has(closestLineY)) {
      lines.set(closestLineY, []);
    }

    lines.get(closestLineY)!.push(item.str);
  }

  // Ordena linhas por posição Y (top to bottom)
  const sortedLineYs = Array.from(lines.keys()).sort((a, b) => b - a);

  // Junta texto de cada linha, respeitando espaçamento
  const texts = sortedLineYs.map((y) => {
    const lineText = lines.get(y)!.join(" ").replace(/\s+/g, " ");
    return lineText.trim();
  });

  // Filtra linhas vazias e junta com quebras
  return (
    texts
      .filter((text) => text.length > 0)
      .join("\n")
      // Limpa espaçamento excessivo
      .replace(/\n\s*\n/g, "\n")
      .trim()
  );
}
