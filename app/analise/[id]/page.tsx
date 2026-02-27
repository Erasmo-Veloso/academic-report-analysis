'use client';

import { useEffect, useState, use } from 'react';
import { useChat } from '@/lib/chat-context';
import { useRouter } from 'next/navigation';
import { AnalysisChat } from '@/components/analysis-chat';

interface AnalysisPageProps {
  params: Promise<{
    id: string;
  }>;
}

function AnalysisPageContent({ chatId }: { chatId: string }) {
  const { chats, setCurrentChat, currentChatId } = useChat();
  const router = useRouter();

  useEffect(() => {
    // Se o currentChat já está sincronizado com a URL, não faz nada
    if (currentChatId === chatId) {
      return;
    }

    // Verifica se a análise existe
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setCurrentChat(chatId);
    } else {
      // Se não existe, redireciona para home
      router.push('/');
    }
  }, [chatId, currentChatId, chats, setCurrentChat, router]);

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
