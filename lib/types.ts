// Academic Report Analyzer Types
export interface ChatConfig {
  academicLevel: 'high_school' | 'undergraduate' | 'graduate' | 'research';
  norms: 'mla' | 'apa' | 'chicago' | 'harvard' | 'custom';
  workType: 'essay' | 'research_paper' | 'thesis' | 'case_study' | 'literature_review' | 'report' | 'other';
  theme: 'professional' | 'academic' | 'technical';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  documentContext?: string;
}

export interface PageData {
  pageNumber: number;
  text: string;
  imageBase64: string;
}

export interface Chat {
  id: string;
  title: string;
  config: ChatConfig;
  messages: Message[];
  pages?: PageData[];
  documentFileName?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AnalysisPage {
  pageNumber: number;
  visualProblems: string;
  textualIssues: string;
  suggestions: string;
}

export interface AnalysisResult {
  score: number;
  structure: string;
  clarity: string;
  coherence: string;
  academicNorms: string;
  formalErrors: string;
  suggestions: string;
  pageAnalysis: AnalysisPage[];
  sectionAnalysis: {
    section: string;
    feedback: string;
  }[];
}

export interface MultimodalAPIRequest {
  pages: PageData[];
  config: ChatConfig;
  documentContext?: string;
}

export interface APIRequest {
  content: string;
  config: ChatConfig;
  documentContext?: string;
}

export interface APIResponse {
  analysis: AnalysisResult;
  message: string;
}
