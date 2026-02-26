import { NextRequest, NextResponse } from 'next/server';

const COHERE_API_URL = 'https://api.cohere.com/v1/chat';

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-cohere-key');
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave de API Cohere não fornecida' },
        { status: 401 }
      );
    }

    const { message, documentContext, history } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Mensagem vazia' },
        { status: 400 }
      );
    }

    // Build chat history for Cohere format
    const chatHistory = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        chatHistory.push({
          role: msg.role === 'user' ? 'User' : 'Chatbot',
          message: msg.content,
        });
      }
    }

    // Build system prompt
    let systemPrompt = `Você é um assistente acadêmico especializado em análise e feedback de trabalhos escritos. 
Suas responsabilidades incluem:
- Fornecer feedback construtivo sobre escrita acadêmica
- Sugerir melhorias em estrutura, clareza e coerência
- Ajudar com questões sobre normas de citação (APA, ABNT, Vancouver, Chicago)
- Responder perguntas sobre escrita acadêmica
- Ser sempre respeitoso e encorajador

Responda em português de forma clara, concisa e profissional.`;

    if (documentContext) {
      systemPrompt += `\n\nDocumento do usuário para contexto:\n${documentContext.substring(0, 1000)}`;
    }

    // Call Cohere API
    const cohereResponse = await fetch(COHERE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command-r-plus',
        messages: [
          ...chatHistory,
          {
            role: 'User',
            message: message,
          },
        ],
        system: systemPrompt,
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!cohereResponse.ok) {
      const errorData = await cohereResponse.json();
      console.error('[v0] Erro Cohere:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'Erro na comunicação com Cohere' },
        { status: cohereResponse.status }
      );
    }

    const cohereData = await cohereResponse.json();
    const response = cohereData.text;

    return NextResponse.json({ response });
  } catch (error) {
    console.error('[v0] Chat error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erro na comunicação com Cohere',
      },
      { status: 500 }
    );
  }
}
