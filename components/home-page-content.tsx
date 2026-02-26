'use client';

import { useChat } from '@/lib/chat-context';
import { EmptyAnalysisState } from '@/components/empty-analysis-state';
import { AnalysisChat } from '@/components/analysis-chat';

export function HomePageContent() {
  const { currentChat } = useChat();

  // Render empty state if no analysis is selected
  if (!currentChat) {
    return <EmptyAnalysisState />;
  }

  // Render analysis chat interface
  return <AnalysisChat />;
}
