import { NextRequest, NextResponse } from 'next/server';
import { APIRequest, APIResponse, AnalysisResult, ChatConfig } from '@/lib/types';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

function buildAnalysisPrompt(
  content: string,
  config: ChatConfig,
  documentContext?: string
): string {
  const academicLevelGuide = {
    high_school: 'high school level (clear, straightforward writing)',
    undergraduate: 'undergraduate level (structured argument, proper citations)',
    graduate: 'graduate level (sophisticated analysis, rigorous methodology)',
    research: 'research level (original contribution, comprehensive literature review)',
  };

  const normsGuide = {
    mla: 'MLA citation format',
    apa: 'APA citation format',
    chicago: 'Chicago Manual of Style',
    harvard: 'Harvard referencing',
    custom: 'custom format',
  };

  const themeGuide = {
    professional: 'professional business writing standards',
    academic: 'academic writing standards',
    technical: 'technical writing standards',
  };

  const prompt = `You are an expert academic writing advisor. Analyze the following ${config.workType.replace(/_/g, ' ')} and provide detailed feedback.

CONTEXT:
- Academic Level: ${academicLevelGuide[config.academicLevel]}
- Citation Format: ${normsGuide[config.norms]}
- Analysis Theme: ${themeGuide[config.theme]}
${documentContext ? `- Reference Document: ${documentContext.substring(0, 500)}...` : ''}

WORK TO ANALYZE:
"""
${content}
"""

Please provide a comprehensive analysis covering:

1. STRUCTURE (0-20 points)
   - How well is the work organized?
   - Are sections clearly delineated?
   - Does it follow the expected structure for a ${config.workType.replace(/_/g, ' ')}?

2. CLARITY (0-20 points)
   - Is the language clear and precise?
   - Are complex ideas explained well?
   - Are there confusing passages?

3. COHERENCE (0-20 points)
   - Does the argument flow logically?
   - Are transitions between ideas smooth?
   - Is there a clear thesis/main point?

4. ACADEMIC NORM ADHERENCE (0-20 points)
   - Are citations formatted correctly in ${normsGuide[config.norms]}?
   - Is the bibliography/references complete?
   - Are sources properly attributed?

5. FORMAL ERRORS (0-20 points)
   - Are there grammatical errors?
   - Any spelling mistakes?
   - Punctuation issues?
   - Style inconsistencies?

ANALYSIS FORMAT:
Provide your response in this exact JSON format:
{
  "score": <0-100>,
  "structure": "<analysis of structure>",
  "clarity": "<analysis of clarity>",
  "coherence": "<analysis of coherence>",
  "academicNorms": "<analysis of citation/norm adherence>",
  "formalErrors": "<analysis of grammar/spelling/punctuation>",
  "suggestions": "<specific, actionable improvement suggestions>",
  "sectionAnalysis": [
    {
      "section": "<section name or topic>",
      "feedback": "<specific feedback with text excerpts if applicable>"
    }
  ]
}

Be constructive, specific, and provide examples from the text when pointing out issues.`;

  return prompt;
}

function parseGeminiResponse(text: string): AnalysisResult {
  try {
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      score: parsed.score || 0,
      structure: parsed.structure || '',
      clarity: parsed.clarity || '',
      coherence: parsed.coherence || '',
      academicNorms: parsed.academicNorms || '',
      formalErrors: parsed.formalErrors || '',
      suggestions: parsed.suggestions || '',
      sectionAnalysis: parsed.sectionAnalysis || [],
    };
  } catch (error) {
    console.error('Failed to parse Gemini response:', error);
    return {
      score: 0,
      structure: 'Unable to parse analysis',
      clarity: '',
      coherence: '',
      academicNorms: '',
      formalErrors: '',
      suggestions: 'Please try again',
      sectionAnalysis: [],
    };
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: APIRequest = await request.json();
    const { content, config, documentContext } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Get API key from request header (not stored on server)
    const apiKey = request.headers.get('x-gemini-key');
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is required' },
        { status: 400 }
      );
    }

    const prompt = buildAnalysisPrompt(content, config, documentContext);

    const geminiRequest = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4000,
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
      console.error('Gemini API error:', errorData);
      return NextResponse.json(
        {
          error: 'Failed to get analysis from Gemini API',
          details: errorData.error?.message || 'Unknown error',
        },
        { status: geminiResponse.status }
      );
    }

    const geminiData: GeminiResponse = await geminiResponse.json();

    if (!geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
      return NextResponse.json(
        { error: 'Invalid response from Gemini API' },
        { status: 500 }
      );
    }

    const analysisText = geminiData.candidates[0].content.parts[0].text;
    const analysis = parseGeminiResponse(analysisText);

    const response: APIResponse = {
      analysis,
      message: 'Analysis completed successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
