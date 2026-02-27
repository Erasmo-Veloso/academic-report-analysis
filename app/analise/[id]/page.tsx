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
  const { setCurrentChat } = useChat();

  useEffect(() => {
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
