'use client';

import { useEffect, use, useRef } from 'react';
import { useChat } from '@/lib/chat-context';
import { AnalysisChat } from '@/components/analysis-chat';

interface AnalysisPageProps {
  params: Promise<{
    id: string;
  }>;
}

function AnalysisPageContent({ chatId }: { chatId: string }) {
  const { setCurrentChat } = useChat();
  const syncedRouteChatId = useRef<string | null>(null);

  useEffect(() => {
    if (syncedRouteChatId.current === chatId) {
      return;
    }
    syncedRouteChatId.current = chatId;
    setCurrentChat(chatId);
  }, [chatId, setCurrentChat]);

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
