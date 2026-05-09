export interface ProjectEntry {
  titlePt: string;
  titleEn: string;
  descriptionPt: string;
  descriptionEn: string;
  tags: string[];
  url: string;
}

export const projectData: ProjectEntry = {
  titlePt: "Analisador de Relatórios Acadêmicos",
  titleEn: "Academic Report Analyzer",
  descriptionPt:
    "Plataforma web para análise inteligente de relatórios acadêmicos com IA (Cohere). Estudantes fazem upload de documentos em PDF, DOCX ou TXT e recebem feedback estruturado por página — incluindo problemas de estrutura, linguagem, referências e sugestões de melhoria. Inclui chat contextual com o documento, configurações personalizáveis por tipo de trabalho e nível académico, e armazenamento local das análises no navegador.",
  descriptionEn:
    "Web platform for AI-powered analysis of academic reports using Cohere. Students upload PDF, DOCX or TXT documents and receive structured per-page feedback — covering structure, language, references and improvement suggestions. Features contextual document chat, customisable settings per work type and academic level, and local browser storage of all analyses.",
  tags: [
    "Next.js",
    "React",
    "TypeScript",
    "Tailwind CSS",
    "Cohere API",
    "pdfjs-dist",
    "Mammoth",
    "Vercel Analytics",
  ],
  url: "https://academic-report-analysis.vercel.app/",
};
