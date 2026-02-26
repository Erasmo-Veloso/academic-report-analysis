// Academic Report Analyzer Types
export interface ChatConfig {
  academicLevel: 'ensino_medio' | 'graduacao' | 'pos_graduacao';
  norms: 'apa' | 'abnt' | 'vancouver' | 'outra';
  workType: 'relatorio_escolar' | 'artigo_cientifico' | 'projeto_tecnologico' | 'tcc';
  focusAnalysis: 'estrutura' | 'linguagem' | 'referencias' | 'todos';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface PagedDocument {
  pageNumber: number;
  text: string;
}

export interface Chat {
  id: string;
  title: string;
  config: ChatConfig;
  messages: Message[];
  documentPages?: PagedDocument[];
  documentFileName?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AnalysisResult {
  score: number;
  pageProblems: {
    pageNumber: number;
    problems: string;
  }[];
  generalProblems: string;
  referenceErrors: string;
  suggestions: string;
  qualityLevel: string;
}

export interface AnalysisRequest {
  pages: PagedDocument[];
  config: ChatConfig;
  userContext?: string;
}

export interface AnalysisResponse {
  analysis: AnalysisResult;
}
