'use client';

import { useChat } from '@/lib/chat-context';
import { ChatConfig } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Settings2 } from 'lucide-react';

export function ChatConfigPanel() {
  const { currentChat, updateChatConfig } = useChat();

  if (!currentChat) {
    return null;
  }

  const handleConfigChange = (key: keyof ChatConfig, value: string) => {
    updateChatConfig(currentChat.id, { [key]: value });
  };

  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-primary" aria-hidden="true" />
          <div>
            <CardTitle className="text-base">Analysis Configuration</CardTitle>
            <CardDescription className="text-xs">
              Customize your analysis parameters
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Academic Level */}
          <div className="space-y-2.5">
            <Label htmlFor="academic-level" className="font-semibold text-sm text-foreground">
              Academic Level
            </Label>
            <div className="space-y-1.5">
              {(['high_school', 'undergraduate', 'graduate', 'research'] as const).map(level => (
                <label 
                  key={level} 
                  className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-muted transition-colors duration-150"
                >
                  <input
                    type="radio"
                    name="academic-level"
                    value={level}
                    checked={currentChat.config.academicLevel === level}
                    onChange={(e) => handleConfigChange('academicLevel', e.target.value)}
                    className="w-4 h-4 accent-primary cursor-pointer"
                    aria-label={`${level.replace('_', ' ')}`}
                  />
                  <span className="text-sm text-foreground capitalize font-medium">
                    {level.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Citation Norms */}
          <div className="space-y-2.5 pt-2 border-t border-border/40">
            <Label htmlFor="norms" className="font-semibold text-sm text-foreground">
              Citation Norms
            </Label>
            <div className="space-y-1.5">
              {(['mla', 'apa', 'chicago', 'harvard', 'custom'] as const).map(norm => (
                <label 
                  key={norm} 
                  className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-muted transition-colors duration-150"
                >
                  <input
                    type="radio"
                    name="norms"
                    value={norm}
                    checked={currentChat.config.norms === norm}
                    onChange={(e) => handleConfigChange('norms', e.target.value)}
                    className="w-4 h-4 accent-primary cursor-pointer"
                    aria-label={norm.toUpperCase()}
                  />
                  <span className="text-sm text-foreground uppercase font-medium tracking-wide">
                    {norm}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Work Type */}
          <div className="space-y-2.5 pt-2 border-t border-border/40">
            <Label htmlFor="work-type" className="font-semibold text-sm text-foreground">
              Work Type
            </Label>
            <div className="space-y-1.5">
              {(['essay', 'research_paper', 'thesis', 'case_study', 'literature_review', 'report', 'other'] as const).map(type => (
                <label 
                  key={type} 
                  className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-muted transition-colors duration-150"
                >
                  <input
                    type="radio"
                    name="work-type"
                    value={type}
                    checked={currentChat.config.workType === type}
                    onChange={(e) => handleConfigChange('workType', e.target.value)}
                    className="w-4 h-4 accent-primary cursor-pointer"
                    aria-label={`${type.replace('_', ' ')}`}
                  />
                  <span className="text-sm text-foreground capitalize font-medium">
                    {type.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="space-y-2.5 pt-2 border-t border-border/40">
            <Label htmlFor="theme" className="font-semibold text-sm text-foreground">
              Analysis Theme
            </Label>
            <div className="space-y-1.5">
              {(['professional', 'academic', 'technical'] as const).map(theme => (
                <label 
                  key={theme} 
                  className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-muted transition-colors duration-150"
                >
                  <input
                    type="radio"
                    name="theme"
                    value={theme}
                    checked={currentChat.config.theme === theme}
                    onChange={(e) => handleConfigChange('theme', e.target.value)}
                    className="w-4 h-4 accent-primary cursor-pointer"
                    aria-label={theme}
                  />
                  <span className="text-sm text-foreground capitalize font-medium">
                    {theme}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Current Configuration Summary */}
        <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20 text-sm text-foreground">
          <p className="font-medium text-primary mb-1">Current Configuration:</p>
          <p className="text-xs leading-relaxed">
            {currentChat.config.academicLevel} level {currentChat.config.workType} using <span className="font-semibold">{currentChat.config.norms.toUpperCase()}</span> format with {currentChat.config.theme} analysis theme.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
