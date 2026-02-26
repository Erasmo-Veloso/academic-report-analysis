'use client';

import { useEffect, useState, use } from 'react';
import { useChat } from '@/lib/chat-context';
import { useRouter } from 'next/navigation';
import { HomePageContent } from '@/components/home-page-content';

interface AnalysisPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AnalysisPage({ params }: AnalysisPageProps) {
  const resolvedParams = use(params);
  const { chats, setCurrentChat, currentChatId } = useChat();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const chat = chats.find(c => c.id === resolvedParams.id);
    if (chat) {
      setCurrentChat(resolvedParams.id);
      setIsReady(true);
    } else {
      router.push('/');
    }
  }, [resolvedParams.id, chats, setCurrentChat, router]);

  // Wait until currentChatId matches the URL id
  if (!isReady || currentChatId !== resolvedParams.id) {
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
