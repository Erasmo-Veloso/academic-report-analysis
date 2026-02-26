import { NextRequest, NextResponse } from 'next/server';
import { MultimodalAPIRequest, APIResponse, AnalysisResult, ChatConfig, AnalysisPage } from '@/lib/types';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

function buildMultimodalPrompt(config: ChatConfig, pageCount: number, documentContext?: string): string {
  const academicLevelGuide = {
    high_school: 'nível de ensino médio (escrita clara e direta)',
    undergraduate: 'nível de graduação (argumento estruturado, citações próprias)',
    graduate: 'nível de pós-graduação (análise sofisticada, metodologia rigorosa)',
    research: 'nível de pesquisa (contribuição original, revisão abrangente da literatura)',
  };

  const normsGuide = {
    mla: 'formato de citação MLA',
    apa: 'formato de citação APA',
    chicago: 'Chicago Manual of Style',
    harvard: 'referenciação Harvard',
    custom: 'formato personalizado',
  };

  const themeGuide = {
    professional: 'padrões de escrita comercial profissional',
    academic: 'padrões de escrita acadêmica',
    technical: 'padrões de escrita técnica',
  };

  const prompt = `Você é um especialista em análise de documentos acadêmicos. Analise as ${pageCount} página(s) fornecidas (imagem + texto) de um ${config.workType.replace(/_/g, ' ')}.

CONTEXTO:
- Nível Acadêmico: ${academicLevelGuide[config.academicLevel]}
- Formato de Citação: ${normsGuide[config.norms]}
- Tema de Análise: ${themeGuide[config.theme]}
${documentContext ? `- Documento de Referência: ${documentContext.substring(0, 500)}...` : ''}

INSTRUÇÕES:
1. Analise VISUALMENTE cada página:
   - Formatação e layout
   - Distribuição visual do texto
   - Colocação de imagens/gráficos (se houver)
   - Legibilidade visual
   
2. Analise TEXTUALMENTE cada página:
   - Clareza do conteúdo
   - Estrutura lógica
   - Erros gramaticais/ortográficos
   - Citações (formato ${normsGuide[config.norms]})

3. Por favor, responda em JSON com esta estrutura para CADA página:
{
  "pageAnalysis": [
    {
      "pageNumber": <número da página>,
      "visualProblems": "<problemas detectados visualmente: formatação, layout, legibilidade>",
      "textualIssues": "<problemas de texto: gramática, clareza, coerência>",
      "suggestions": "<sugestões específicas de melhoria com exemplos>"
    }
  ],
  "overallScore": <0-100>,
  "structure": "<avaliação geral de estrutura>",
  "clarity": "<avaliação geral de clareza>",
  "coherence": "<avaliação geral de coerência>",
  "academicNorms": "<avaliação de conformidade com normas ${normsGuide[config.norms]}>",
  "formalErrors": "<resumo de erros formais encontrados>",
  "suggestions": "<sugestões gerais de melhoria>",
  "sectionAnalysis": [
    {
      "section": "<nome da seção>",
      "feedback": "<feedback específico>"
    }
  ]
}

Seja construtivo, específico, cite exemplos do texto quando apontar problemas, e forneça feedback acionável.`;

  return prompt;
}

function parseGeminiResponse(text: string): AnalysisResult {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('JSON não encontrado na resposta');
    }
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      score: parsed.overallScore || 0,
      structure: parsed.structure || '',
      clarity: parsed.clarity || '',
      coherence: parsed.coherence || '',
      academicNorms: parsed.academicNorms || '',
      formalErrors: parsed.formalErrors || '',
      suggestions: parsed.suggestions || '',
      pageAnalysis: parsed.pageAnalysis || [],
      sectionAnalysis: parsed.sectionAnalysis || [],
    };
  } catch (error) {
    console.error('[v0] Falha ao analisar resposta Gemini:', error);
    return {
      score: 0,
      structure: 'Não foi possível analisar',
      clarity: '',
      coherence: '',
      academicNorms: '',
      formalErrors: '',
      suggestions: 'Por favor, tente novamente',
      pageAnalysis: [],
      sectionAnalysis: [],
    };
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: MultimodalAPIRequest = await request.json();
    const { pages, config, documentContext } = body;

    if (!pages?.length) {
      return NextResponse.json(
        { error: 'Nenhuma página fornecida' },
        { status: 400 }
      );
    }

    const apiKey = request.headers.get('x-gemini-key');
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave de API Gemini é necessária' },
        { status: 400 }
      );
    }

    const prompt = buildMultimodalPrompt(config, pages.length, documentContext);

    // Build multimodal content with images and text
    const parts: any[] = [{ text: prompt }];

    for (const page of pages) {
      if (page.imageBase64) {
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: page.imageBase64,
          },
        });
      }
      if (page.text) {
        parts.push({
          text: `Página ${page.pageNumber}:\n${page.text}`,
        });
      }
    }

    const geminiRequest = {
      contents: [
        {
          parts,
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 5000,
      },
    };

    const geminiResponse = await fetch(
      `${GEMINI_API_BASE}?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(geminiRequest),
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error('[v0] Erro da API Gemini:', errorData);
      return NextResponse.json(
        {
          error: 'Falha ao obter análise da API Gemini',
          details: errorData.error?.message || 'Erro desconhecido',
        },
        { status: geminiResponse.status }
      );
    }

    const geminiData: GeminiResponse = await geminiResponse.json();

    if (!geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
      return NextResponse.json(
        { error: 'Resposta inválida da API Gemini' },
        { status: 500 }
      );
    }

    const analysisText = geminiData.candidates[0].content.parts[0].text;
    const analysis = parseGeminiResponse(analysisText);

    const response: APIResponse = {
      analysis,
      message: 'Análise concluída com sucesso',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[v0] Erro da API:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
