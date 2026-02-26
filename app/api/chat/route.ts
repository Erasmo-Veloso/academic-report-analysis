import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-gemini-key');
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key não fornecida' },
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

    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Build conversation history
    const conversationHistory = [];
    
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        if (msg.role === 'user') {
          conversationHistory.push({
            role: 'user',
            parts: [{ text: msg.content }],
          });
        } else if (msg.role === 'assistant') {
          conversationHistory.push({
            role: 'model',
            parts: [{ text: msg.content }],
          });
        }
      }
    }

    // Add document context if available
    let systemPrompt = `Você é um assistente acadêmico especializado em análise e feedback de trabalhos escritos. 
Suas responsabilidades incluem:
- Fornecer feedback construtivo sobre escrita acadêmica
- Sugerir melhorias em estrutura, clareza e coerência
- Ajudar com questões sobre normas de citação (APA, MLA, Chicago, Harvard)
- Responder perguntas sobre escrita acadêmica
- Ser sempre respeitoso e encorajador

Responda em português de forma clara, concisa e profissional.`;

    if (documentContext) {
      systemPrompt += `\n\nO usuário enviou o seguinte documento para análise:\n${documentContext.substring(0, 1000)}\n\nConsidere este contexto ao responder.`;
    }

    // Start chat with history
    const chat = model.startChat({
      history: conversationHistory,
    });

    const result = await chat.sendMessage(systemPrompt + '\n\nUsuário: ' + message);
    const response = result.response.text();

    return NextResponse.json({ response });
  } catch (error) {
    console.error('[v0] Chat error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erro na comunicação com Gemini',
      },
      { status: 500 }
    );
  }
}
