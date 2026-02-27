import { NextRequest, NextResponse } from "next/server";

const COHERE_API_URL = "https://api.cohere.com/v2/chat";

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-cohere-key");
    if (!apiKey) {
      return NextResponse.json(
        { error: "Chave de API Cohere não fornecida" },
        { status: 401 },
      );
    }

    const { message, documentContext, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 });
    }

    // Build chat messages for Cohere v2 format
    const messages = [];

    // Add system message
    let systemMessage = `Você é um tutor acadêmico especialista em escrita científica.
  Seu papel é orientar o aluno com clareza, empatia e foco prático.

  Diretrizes:
  - Responda em português de forma clara, objetiva e encorajadora
  - Explique o porquê dos ajustes e como aplicar na prática
  - Dê passos acionáveis e exemplos curtos quando útil
  - Quando houver problemas de escrita, proponha correções concretas
  - Use o contexto do documento para personalizar a orientação`;

    if (documentContext) {
      systemMessage += `\n\nDocumento do usuário para contexto:\n${documentContext.substring(0, 1000)}`;
    }

    messages.push({
      role: "system",
      content: systemMessage,
    });

    // Add chat history
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // Add current message
    messages.push({
      role: "user",
      content: message,
    });

    // Call Cohere API v2
    const cohereResponse = await fetch(COHERE_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command-r-plus-08-2024",
        messages: messages,
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!cohereResponse.ok) {
      const errorData = await cohereResponse.json();
      console.error("[v0] Erro Cohere:", errorData);
      return NextResponse.json(
        { error: errorData.message || "Erro na comunicação com Cohere" },
        { status: cohereResponse.status },
      );
    }

    const cohereData = await cohereResponse.json();
    console.log(
      "[v0] Resposta Cohere Chat:",
      JSON.stringify(cohereData, null, 2),
    );

    // API v2 retorna em cohereData.message.content[0].text
    const response =
      cohereData.message?.content?.[0]?.text || cohereData.text || "";

    if (!response) {
      console.error("[v0] Estrutura da resposta Cohere Chat:", cohereData);
      return NextResponse.json(
        { error: "Resposta vazia da API Cohere" },
        { status: 500 },
      );
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error("[v0] Chat error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro na comunicação com Cohere",
      },
      { status: 500 },
    );
  }
}
