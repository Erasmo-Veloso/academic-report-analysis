'use client';

import { useEffect, useState, use, Suspense } from 'react';
import { useChat } from '@/lib/chat-context';
import { useRouter } from 'next/navigation';
import { HomePageContent } from '@/components/home-page-content';

interface AnalysisPageProps {
  params: Promise<{
    id: string;
  }>;
}

function AnalysisPageContent({ chatId }: { chatId: string }) {
  const { chats, setCurrentChat, currentChatId } = useChat();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setCurrentChat(chatId);
      setIsReady(true);
    } else {
      router.push('/');
    }
  }, [chatId, chats, setCurrentChat, router]);

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

export default function AnalysisPage({ params }: AnalysisPageProps) {
  const resolvedParams = use(params);

  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <AnalysisPageContent chatId={resolvedParams.id} />
    </Suspense>
  );
}
