'use client';

import { useEffect, use } from 'react';
import { useChat } from '@/lib/chat-context';
import { AnalysisChat } from '@/components/analysis-chat';

interface AnalysisPageProps {
  params: Promise<{
    id: string;
  }>;
}

function AnalysisPageContent({ chatId }: { chatId: string }) {
  const { setCurrentChat, currentChatId } = useChat();

  useEffect(() => {
    // Se o currentChat já está sincronizado com a URL, não faz nada
    if (currentChatId === chatId) {
      return;
    }

    // Sincroniza o estado com a URL
    setCurrentChat(chatId);
  }, [chatId, currentChatId, setCurrentChat]);

  // Mostra loading enquanto o currentChatId não corresponde ao chatId da URL
  if (currentChatId !== chatId) {
    return (
      <main className="flex-1 overflow-auto bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando análise...</p>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-hidden">
      <AnalysisChat />
    </main>
  );
}

export default function AnalysisPage({ params }: AnalysisPageProps) {
  const resolvedParams = use(params);

  return <AnalysisPageContent chatId={resolvedParams.id} />;
}
