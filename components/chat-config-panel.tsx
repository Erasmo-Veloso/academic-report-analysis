'use client';

import { useChat } from '@/lib/chat-context';
import { ChatConfig } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export function ChatConfigPanel() {
  const { currentChat, updateChatConfig } = useChat();

  if (!currentChat) {
    return null;
  }

  const handleConfigChange = (key: keyof ChatConfig, value: string) => {
    updateChatConfig(currentChat.id, { [key]: value });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Analysis Configuration</CardTitle>
        <CardDescription>
          Customize your analysis parameters
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Academic Level */}
          <div className="space-y-3">
            <Label className="font-semibold">Academic Level</Label>
            <div className="space-y-2">
              {(['high_school', 'undergraduate', 'graduate', 'research'] as const).map(level => (
                <label key={level} className="flex items-center gap-3 cursor-pointer hover:bg-muted p-2 rounded">
                  <input
                    type="radio"
                    name="academic-level"
                    value={level}
                    checked={currentChat.config.academicLevel === level}
                    onChange={(e) => handleConfigChange('academicLevel', e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm capitalize">
                    {level.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Citation Norms */}
          <div className="space-y-3">
            <Label className="font-semibold">Citation Norms</Label>
            <div className="space-y-2">
              {(['mla', 'apa', 'chicago', 'harvard', 'custom'] as const).map(norm => (
                <label key={norm} className="flex items-center gap-3 cursor-pointer hover:bg-muted p-2 rounded">
                  <input
                    type="radio"
                    name="norms"
                    value={norm}
                    checked={currentChat.config.norms === norm}
                    onChange={(e) => handleConfigChange('norms', e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm uppercase">
                    {norm}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Work Type */}
          <div className="space-y-3">
            <Label className="font-semibold">Work Type</Label>
            <div className="space-y-2">
              {(['essay', 'research_paper', 'thesis', 'case_study', 'literature_review', 'report', 'other'] as const).map(type => (
                <label key={type} className="flex items-center gap-3 cursor-pointer hover:bg-muted p-2 rounded">
                  <input
                    type="radio"
                    name="work-type"
                    value={type}
                    checked={currentChat.config.workType === type}
                    onChange={(e) => handleConfigChange('workType', e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm capitalize">
                    {type.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="space-y-3">
            <Label className="font-semibold">Analysis Theme</Label>
            <div className="space-y-2">
              {(['professional', 'academic', 'technical'] as const).map(theme => (
                <label key={theme} className="flex items-center gap-3 cursor-pointer hover:bg-muted p-2 rounded">
                  <input
                    type="radio"
                    name="theme"
                    value={theme}
                    checked={currentChat.config.theme === theme}
                    onChange={(e) => handleConfigChange('theme', e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm capitalize">
                    {theme}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
          <p>
            <strong>Current Configuration:</strong> {currentChat.config.academicLevel} level {currentChat.config.workType} using {currentChat.config.norms.toUpperCase()} format with {currentChat.config.theme} analysis theme.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
