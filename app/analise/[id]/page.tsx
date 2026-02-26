'use client';

import { useEffect, useState } from 'react';
import { useChat } from '@/lib/chat-context';
import { useRouter } from 'next/navigation';
import { HomePageContent } from '@/components/home-page-content';

interface AnalysisPageProps {
  params: {
    id: string;
  };
}

export default function AnalysisPage({ params }: AnalysisPageProps) {
  const { chats, setCurrentChat, currentChatId } = useChat();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const chat = chats.find(c => c.id === params.id);
    if (chat) {
      setCurrentChat(params.id);
      setIsReady(true);
    } else {
      router.push('/');
    }
  }, [params.id, chats, setCurrentChat, router]);

  // Wait until currentChatId matches the URL id
  if (!isReady || currentChatId !== params.id) {
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
