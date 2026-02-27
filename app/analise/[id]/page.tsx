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
  const [isMounted, setIsMounted] = useState(false);

  // Aguarda a hidratação do localStorage antes de avaliar os chats
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setCurrentChat(chatId);
    } else {
      router.push('/');
    }
  }, [chatId, chats, isMounted, setCurrentChat, router]);

  // Mostra loading enquanto o contexto ainda não sincronizou com o chatId da URL
  if (!isMounted || currentChatId !== chatId) {
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
