import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalysisRequest, AnalysisResponse } from '@/lib/types';
import { buildAnalysisPrompt } from '@/lib/prompt-builder';

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-gemini-key');
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave de API Gemini não fornecida' },
        { status: 400 }
      );
    }

    const body: AnalysisRequest = await request.json();

    if (!body.pages || body.pages.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma página para analisar' },
        { status: 400 }
      );
    }

    if (!body.config) {
      return NextResponse.json(
        { error: 'Configuração ausente' },
        { status: 400 }
      );
    }

    // Build prompt
    const prompt = buildAnalysisPrompt(body.pages, body.config, body.userContext);

    // Send to Gemini
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const response = await model.generateContent(prompt);
    const analysisText = response.response.text();

    // Parse the response into structured format
    const analysis = parseAnalysisResponse(analysisText);

    const result: AnalysisResponse = {
      analysis,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('[v0] Erro na análise:', error);

    if (error instanceof Error && error.message.includes('429')) {
      return NextResponse.json(
        { details: 'Limite de requisições atingido. Aguarde alguns momentos e tente novamente.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { details: error instanceof Error ? error.message : 'Erro ao processar análise' },
      { status: 500 }
    );
  }
}

function parseAnalysisResponse(text: string) {
  const lines = text.split('\n');
  let currentSection = '';
  let score = 0;
  let qualityLevel = 'Bom';
  const pageProblems: { pageNumber: number; problems: string }[] = [];
  let generalProblems = '';
  let referenceErrors = '';
  let suggestions = '';

  for (const line of lines) {
    if (line.includes('PROBLEMAS POR PÁGINA')) {
      currentSection = 'pageProblems';
      continue;
    }
    if (line.includes('PROBLEMAS GERAIS')) {
      currentSection = 'generalProblems';
      continue;
    }
    if (line.includes('ERROS EM REFERÊNCIAS')) {
      currentSection = 'references';
      continue;
    }
    if (line.includes('SUGESTÕES')) {
      currentSection = 'suggestions';
      continue;
    }
    if (line.includes('AVALIAÇÃO FINAL')) {
      currentSection = 'evaluation';
      continue;
    }

    const trimmed = line.trim();

    if (currentSection === 'pageProblems' && trimmed && trimmed.startsWith('Página')) {
      const pageMatch = trimmed.match(/Página\s+(\d+)/);
      if (pageMatch) {
        const pageNum = parseInt(pageMatch[1]);
        const problems = trimmed.replace(/Página\s+\d+[:\-]?\s*/, '');
        pageProblems.push({ pageNumber: pageNum, problems });
      }
    } else if (currentSection === 'generalProblems' && trimmed) {
      generalProblems += (generalProblems ? '\n' : '') + trimmed;
    } else if (currentSection === 'references' && trimmed) {
      referenceErrors += (referenceErrors ? '\n' : '') + trimmed;
    } else if (currentSection === 'suggestions' && trimmed) {
      suggestions += (suggestions ? '\n' : '') + trimmed;
    } else if (currentSection === 'evaluation') {
      if (trimmed.includes('Pontuação:')) {
        const scoreMatch = trimmed.match(/(\d+)/);
        if (scoreMatch) {
          score = parseInt(scoreMatch[1]);
        }
      }
      if (trimmed.includes('Nível de Qualidade:')) {
        const levels = ['Insuficiente', 'Aceitável', 'Bom', 'Muito Bom', 'Excelente'];
        for (const level of levels) {
          if (trimmed.includes(level)) {
            qualityLevel = level;
            break;
          }
        }
      }
    }
  }

  // Ensure score is valid
  if (score < 0 || score > 100 || isNaN(score)) {
    score = 50; // Default if parsing fails
  }

  return {
    score,
    pageProblems,
    generalProblems,
    referenceErrors,
    suggestions,
    qualityLevel,
  };
}
