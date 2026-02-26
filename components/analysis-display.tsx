'use client';

import { AnalysisResult } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

interface AnalysisDisplayProps {
  analysis: AnalysisResult;
}

export function AnalysisDisplay({ analysis }: AnalysisDisplayProps) {
  const scoreColor =
    analysis.score >= 80
      ? 'text-green-600'
      : analysis.score >= 60
        ? 'text-yellow-600'
        : 'text-red-600';

  const scoreLabel =
    analysis.score >= 80
      ? 'Excelente'
      : analysis.score >= 60
        ? 'Bom'
        : 'Precisa Melhorar';

  const scoreIcon =
    analysis.score >= 80
      ? <CheckCircle2 className="w-8 h-8 text-green-600" aria-hidden="true" />
      : analysis.score >= 60
        ? <AlertTriangle className="w-8 h-8 text-yellow-600" aria-hidden="true" />
        : <AlertCircle className="w-8 h-8 text-red-600" aria-hidden="true" />;

  return (
    <div className="space-y-4">
      {/* Score Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/0 border-primary/20">
        <CardHeader>
          <CardTitle>Pontuação Final</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="flex items-center justify-center">
              {scoreIcon}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-2">
                <span className={`text-5xl font-bold ${scoreColor}`}>{analysis.score}</span>
                <span className="text-xl text-muted-foreground">/100</span>
              </div>
              <p className={`text-lg font-semibold ${scoreColor}`}>
                {scoreLabel}
              </p>
              <p className="text-muted-foreground text-xs mt-2">
                {analysis.qualityLevel}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-Page Analysis */}
      {analysis.pageProblems && analysis.pageProblems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Problemas por Página</CardTitle>
            <CardDescription>Questões identificadas em cada página do documento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.pageProblems.map((page, idx) => (
                <div key={idx} className="border border-border/50 rounded-lg p-4">
                  <h4 className="font-semibold text-sm text-primary mb-2">Página {page.pageNumber}</h4>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {page.problems}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* General Problems */}
      {analysis.generalProblems && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Problemas Gerais do Documento</CardTitle>
            <CardDescription>Questões que afetam o documento como um todo</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {analysis.generalProblems}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Reference Errors */}
      {analysis.referenceErrors && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Erros em Referências e Citações</CardTitle>
            <CardDescription>Problemas com conformidade às normas de citação</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {analysis.referenceErrors}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      {analysis.suggestions && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Sugestões de Melhoria</CardTitle>
            <CardDescription>
              Recomendações específicas e acionáveis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {analysis.suggestions}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
