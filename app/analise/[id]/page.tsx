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
  const chatId = resolvedParams.id;

  useEffect(() => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setCurrentChat(chatId);
      setIsReady(true);
    } else {
      router.push('/');
    }
  }, [chatId, chats, setCurrentChat, router]);

  // Wait until currentChatId matches the URL id
  if (!isReady || currentChatId !== chatId) {
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
