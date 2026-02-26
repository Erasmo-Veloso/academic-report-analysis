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

  const configLabels = {
    ensino_medio: 'Ensino Médio',
    graduacao: 'Graduação',
    pos_graduacao: 'Pós-Graduação',
    relatorio_escolar: 'Relatório Escolar',
    artigo_cientifico: 'Artigo Científico',
    projeto_tecnologico: 'Projeto Tecnológico',
    tcc: 'TCC',
    estrutura: 'Estrutura',
    linguagem: 'Linguagem',
    referencias: 'Referências',
    todos: 'Todos os Aspectos',
  };

  return (
    <Card className="shadow-sm border-border/60">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-primary" aria-hidden="true" />
          <div>
            <CardTitle className="text-base">Parâmetros da Análise</CardTitle>
            <CardDescription className="text-xs">
              Configure os critérios de avaliação
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Academic Level */}
          <div className="space-y-2.5">
            <Label className="font-semibold text-sm text-foreground">
              Nível Acadêmico
            </Label>
            <div className="space-y-1.5">
              {(['ensino_medio', 'graduacao', 'pos_graduacao'] as const).map(level => (
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
                    aria-label={configLabels[level]}
                  />
                  <span className="text-sm text-foreground font-medium">
                    {configLabels[level]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Citation Norms */}
          <div className="space-y-2.5 pt-2 border-t border-border/40">
            <Label className="font-semibold text-sm text-foreground">
              Norma Acadêmica
            </Label>
            <div className="space-y-1.5">
              {(['apa', 'abnt', 'vancouver', 'outra'] as const).map(norm => (
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
            <Label className="font-semibold text-sm text-foreground">
              Tipo de Trabalho
            </Label>
            <div className="space-y-1.5">
              {(['relatorio_escolar', 'artigo_cientifico', 'projeto_tecnologico', 'tcc'] as const).map(type => (
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
                    aria-label={configLabels[type]}
                  />
                  <span className="text-sm text-foreground font-medium">
                    {configLabels[type]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Focus Analysis */}
          <div className="space-y-2.5 pt-2 border-t border-border/40">
            <Label className="font-semibold text-sm text-foreground">
              Foco da Análise
            </Label>
            <div className="space-y-1.5">
              {(['estrutura', 'linguagem', 'referencias', 'todos'] as const).map(focus => (
                <label 
                  key={focus} 
                  className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-muted transition-colors duration-150"
                >
                  <input
                    type="radio"
                    name="focus"
                    value={focus}
                    checked={currentChat.config.focusAnalysis === focus}
                    onChange={(e) => handleConfigChange('focusAnalysis', e.target.value)}
                    className="w-4 h-4 accent-primary cursor-pointer"
                    aria-label={configLabels[focus]}
                  />
                  <span className="text-sm text-foreground font-medium">
                    {configLabels[focus]}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Current Configuration Summary */}
        <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20 text-sm text-foreground">
          <p className="font-medium text-primary mb-1">Configuração Atual:</p>
          <p className="text-xs leading-relaxed">
            {configLabels[currentChat.config.academicLevel]} · {configLabels[currentChat.config.workType]} · Norma {currentChat.config.norms.toUpperCase()} · Foco: {configLabels[currentChat.config.focusAnalysis]}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
