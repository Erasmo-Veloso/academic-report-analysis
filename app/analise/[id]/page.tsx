'use client';

import { useEffect } from 'react';
import { useChat } from '@/lib/chat-context';
import { useRouter } from 'next/navigation';
import { HomePageContent } from '@/components/home-page-content';

interface AnalysisPageProps {
  params: {
    id: string;
  };
}

export default function AnalysisPage({ params }: AnalysisPageProps) {
  const { chats, setCurrentChat } = useChat();
  const router = useRouter();

  useEffect(() => {
    const chat = chats.find(c => c.id === params.id);
    if (chat) {
      setCurrentChat(params.id);
    } else {
      // Se análise não existe, redireciona para home
      router.push('/');
    }
  }, [params.id, chats, setCurrentChat, router]);

  const chat = chats.find(c => c.id === params.id);

  if (!chat) {
    return (
      <main className="flex-1 overflow-auto bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando análise...</p>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-hidden">
      <HomePageContent />
    </main>
  );
}
