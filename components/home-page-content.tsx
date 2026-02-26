'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@/lib/chat-context';
import { Message, APIRequest } from '@/lib/types';
import { ChatInterface } from '@/components/chat-interface';
import { ChatConfigPanel } from '@/components/chat-config-panel';
import { DocumentUpload } from '@/components/document-upload';
import { AnalysisDisplay } from '@/components/analysis-display';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

export function HomePageContent() {
  const { currentChat, addMessage, getGeminiKey } = useChat();
  const [isLoading, setIsLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<any>(null);
  const [showConfigPanel, setShowConfigPanel] = useState(true);

  const handleSendMessage = async (userMessage: string) => {
    if (!currentChat) return;

    // Add user message to chat
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    };
    addMessage(userMsg);

    setIsLoading(true);

    try {
      const apiKey = getGeminiKey();
      if (!apiKey) {
        throw new Error('Gemini API key not configured. Please set it in Settings.');
      }

      // Check if user is asking for analysis
      const isAskingForAnalysis =
        userMessage.toLowerCase().includes('analyze') ||
        userMessage.toLowerCase().includes('analysis') ||
        userMessage.toLowerCase().includes('review') ||
        userMessage.toLowerCase().includes('feedback') ||
        userMessage.toLowerCase().includes('evaluate');

      if (isAskingForAnalysis && currentChat.documentContent) {
        // Send to analysis API
        const payload: APIRequest = {
          content: currentChat.documentContent,
          config: currentChat.config,
          documentContext: userMessage,
        };

        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-gemini-key': apiKey,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.details || error.error || 'Analysis failed');
        }

        const data = await response.json();

        // Store analysis and show it
        setLastAnalysis(data.analysis);
        setShowAnalysis(true);

        // Add assistant response
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Analysis complete! Score: ${data.analysis.score}/100 (${data.analysis.score >= 80 ? 'Excellent' : data.analysis.score >= 60 ? 'Good' : 'Needs Improvement'})\n\nSee the analysis panel on the right for detailed feedback.`,
          timestamp: Date.now(),
        };
        addMessage(assistantMsg);
      } else if (isAskingForAnalysis && !currentChat.documentContent) {
        // User asked for analysis but no document uploaded
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Please upload a document first before requesting an analysis. Use the Document Upload section to add your report.',
          timestamp: Date.now(),
        };
        addMessage(assistantMsg);
      } else {
        // Regular conversation - use Gemini for responses
        const payload = {
          message: userMessage,
          context: currentChat.documentContent ? `Reference: ${currentChat.documentContent.substring(0, 200)}...` : '',
          config: currentChat.config,
        };

        // For now, just acknowledge the message
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'I can help with analysis and feedback on your academic work. Try uploading a document and asking for specific feedback on structure, clarity, citations, or other aspects.',
          timestamp: Date.now(),
        };
        addMessage(assistantMsg);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        timestamp: Date.now(),
      };
      addMessage(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentChat) {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert>
          <AlertDescription>
            Create a new analysis to get started. Click the "+ New Analysis" button in the sidebar.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full overflow-hidden p-4">
      {/* Main Chat Area */}
      <div className="lg:col-span-2 flex flex-col overflow-hidden rounded-lg border border-border bg-background shadow-sm">
        <ChatInterface onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>

      {/* Right Sidebar with Toggle */}
      <div className="overflow-hidden flex flex-col">
        {/* Toggle Button for Config Panel */}
        <Button
          onClick={() => setShowConfigPanel(!showConfigPanel)}
          variant="outline"
          size="sm"
          className="mb-3 w-full justify-between transition-all duration-200"
          aria-expanded={showConfigPanel}
          aria-controls="config-panel"
        >
          <span className="text-sm font-medium">Configuration</span>
          <ChevronRight 
            className={`w-4 h-4 transition-transform duration-300 ${
              showConfigPanel ? 'rotate-90' : ''
            }`}
            aria-hidden="true"
          />
        </Button>

        {/* Collapsible Config and Upload Area */}
        <div 
          id="config-panel"
          className={`
            flex-1 overflow-y-auto space-y-4 pr-2 transition-all duration-300
            ${showConfigPanel ? 'opacity-100 visible' : 'opacity-0 invisible h-0'}
          `}
        >
          {/* Configuration */}
          <ChatConfigPanel />

          {/* Document Upload */}
          <DocumentUpload />

          {/* Analysis Display */}
          {showAnalysis && lastAnalysis && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold mb-3 text-foreground">Analysis Results</h2>
              <AnalysisDisplay analysis={lastAnalysis} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
