// Utility to extract text from various file formats
export async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name;
  const fileType = file.type;

  if (fileType === 'text/plain') {
    return await file.text();
  }

  if (fileType === 'application/pdf') {
    // For PDF, we'd typically use a library like pdfjs-dist
    // For now, return a message and let the user know we support PDF
    throw new Error('PDF support requires additional setup. Please use TXT or DOCX.');
  }

  if (
    fileType ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    // For DOCX, we'd use a library like mammoth
    // For now, return a message
    throw new Error('DOCX support requires additional setup. Please use TXT.');
  }

  throw new Error(`Unsupported file type: ${fileType}`);
}

export function generateChatTitle(content: string): string {
  // Generate a title from the first 50 characters of content
  return content.substring(0, 50).trim() + (content.length > 50 ? '...' : '');
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars) + '...';
}
