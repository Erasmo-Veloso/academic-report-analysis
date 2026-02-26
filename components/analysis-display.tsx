'use client';

import { AnalysisResult } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
      ? 'Excellent'
      : analysis.score >= 60
        ? 'Good'
        : 'Needs Improvement';

  return (
    <div className="space-y-4">
      {/* Score Card */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-6xl font-bold">
              <span className={scoreColor}>{analysis.score}</span>
              <span className="text-2xl text-muted-foreground">/100</span>
            </div>
            <div>
              <p className={`text-2xl font-semibold ${scoreColor}`}>
                {scoreLabel}
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Based on structure, clarity, coherence, academic norms, and formal correctness
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'Structure', value: analysis.structure },
          { label: 'Clarity', value: analysis.clarity },
          { label: 'Coherence', value: analysis.coherence },
          { label: 'Academic Norms', value: analysis.academicNorms },
          { label: 'Formal Errors', value: analysis.formalErrors },
        ].map(item => (
          <Card key={item.label}>
            <CardHeader>
              <CardTitle className="text-base">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {item.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Improvement Suggestions</CardTitle>
          <CardDescription>
            Specific, actionable recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {analysis.suggestions}
          </p>
        </CardContent>
      </Card>

      {/* Section Analysis */}
      {analysis.sectionAnalysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Section-by-Section Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.sectionAnalysis.map((section, idx) => (
                <div key={idx} className="border-l-2 border-primary pl-4">
                  <h4 className="font-semibold text-sm mb-2 capitalize">
                    {section.section}
                  </h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
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
