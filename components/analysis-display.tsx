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
          <CardTitle>Pontuação Geral</CardTitle>
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
                Baseado em estrutura, clareza, coerência, normas acadêmicas e correção formal
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-Page Analysis */}
      {analysis.pageAnalysis && analysis.pageAnalysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Análise por Página</CardTitle>
            <CardDescription>Problemas visuais e textuais identificados em cada página</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.pageAnalysis.map((page, idx) => (
                <div key={idx} className="border border-border/50 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-sm text-primary">Página {page.pageNumber}</h4>
                  
                  {page.visualProblems && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Problemas Visuais
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">
                        {page.visualProblems}
                      </p>
                    </div>
                  )}
                  
                  {page.textualIssues && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Problemas de Texto
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">
                        {page.textualIssues}
                      </p>
                    </div>
                  )}
                  
                  {page.suggestions && (
                    <div className="bg-primary/5 p-3 rounded border border-primary/20">
                      <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">
                        Sugestões
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">
                        {page.suggestions}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'Estrutura', value: analysis.structure },
          { label: 'Clareza', value: analysis.clarity },
          { label: 'Coerência', value: analysis.coherence },
          { label: 'Normas Acadêmicas', value: analysis.academicNorms },
          { label: 'Erros Formais', value: analysis.formalErrors },
        ].map(item => (
          <Card key={item.label}>
            <CardHeader>
              <CardTitle className="text-base">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {item.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Sugestões de Melhoria</CardTitle>
          <CardDescription>
            Recomendações específicas e acionáveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {analysis.suggestions}
          </p>
        </CardContent>
      </Card>

      {/* Section Analysis */}
      {analysis.sectionAnalysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Análise por Seção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.sectionAnalysis.map((section, idx) => (
                <div key={idx} className="border-l-4 border-primary/50 pl-4 py-2">
                  <h4 className="font-semibold text-sm mb-2 text-foreground capitalize">
                    {section.section}
                  </h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {section.feedback}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
