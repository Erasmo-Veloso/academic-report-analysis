'use client';

export function EmptyAnalysisState() {
  return (
    <div className="flex items-center justify-center h-full px-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-3">
          <h2 className="text-4xl font-bold text-foreground text-balance">
            Que relatórios vamos analisar hoje?
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Nosso analisador acadêmico examina seus documentos com inteligência artificial, 
            fornecendo feedback detalhado sobre estrutura, clareza, referências e muito mais. 
            Suportamos PDF, DOCX e TXT.
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
          <p className="text-sm font-medium text-foreground">
            Comece clicando em <span className="text-primary font-semibold">"+ Nova Análise"</span> na barra lateral
          </p>
        </div>
      </div>
    </div>
  );
}
