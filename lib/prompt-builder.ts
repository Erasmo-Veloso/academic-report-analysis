import { ChatConfig, PagedDocument } from './types';

export function buildAnalysisPrompt(
  pages: PagedDocument[],
  config: ChatConfig,
  userContext?: string
): string {
  const academicLevelMap = {
    ensino_medio: 'Ensino Médio',
    graduacao: 'Graduação',
    pos_graduacao: 'Pós-graduação',
  };

  const normsMap = {
    apa: 'APA',
    abnt: 'ABNT',
    vancouver: 'Vancouver',
    outra: 'Outra',
  };

  const workTypeMap = {
    relatorio_escolar: 'Relatório Escolar',
    artigo_cientifico: 'Artigo Científico',
    projeto_tecnologico: 'Projeto Tecnológico',
    tcc: 'Trabalho de Conclusão de Curso (TCC)',
  };

  const focusMap = {
    estrutura: 'estrutura e organização',
    linguagem: 'clareza de linguagem e coerência',
    referencias: 'citações e referências',
    todos: 'todos os aspectos',
  };

  const pagesText = pages
    .map(p => `--- Página ${p.pageNumber} ---\n${p.text}`)
    .join('\n\n');

  return `Você é um avaliador acadêmico especializado em normas científicas e análise textual.

DOCUMENTO ENVIADO:
${pagesText}

PARÂMETROS DA ANÁLISE:
- Nível Acadêmico: ${academicLevelMap[config.academicLevel]}
- Norma Acadêmica: ${normsMap[config.norms]}
- Tipo de Trabalho: ${workTypeMap[config.workType]}
- Foco da Análise: ${focusMap[config.focusAnalysis]}

CONTEXTO DO USUÁRIO:
${userContext || 'Nenhum contexto adicional fornecido.'}

INSTRUÇÕES:
Analise o texto fornecido considerando os parâmetros acima. Avalie:

1. Estrutura do trabalho (introdução, desenvolvimento, conclusão)
2. Clareza e coerência textual
3. Linguagem acadêmica apropriada
4. Problemas gramaticais e ortográficos
5. Uso correto de citações
6. Organização das referências bibliográficas
7. Conformidade com a norma ${normsMap[config.norms]} escolhida
8. Problemas de repetição excessiva
9. Falta de objetivos claros
10. Problemas metodológicos (se aplicável)

FORMATO DE RESPOSTA:
Organize sua resposta exatamente assim:

1. PROBLEMAS POR PÁGINA
[Para cada página, liste os problemas identificados. Indique sempre a página.]

2. PROBLEMAS GERAIS DO DOCUMENTO
[Problemas que afetam o documento como um todo, não específicos de uma página.]

3. ERROS EM REFERÊNCIAS E CITAÇÕES
[Se houver problemas com referências, citações ou conformidade com a norma ${normsMap[config.norms]}, liste aqui.]

4. SUGESTÕES DETALHADAS DE MELHORIA
[Forneça 3-5 sugestões práticas e específicas para melhorar o trabalho.]

5. AVALIAÇÃO FINAL
Pontuação: [0-100]
Nível de Qualidade: [Insuficiente / Aceitável / Bom / Muito Bom / Excelente]
Comentário: [Um parágrafo resumindo a qualidade geral do trabalho e seu nível de adequação ao padrão acadêmico.]

IMPORTANTE:
- Sempre indique a página quando possível
- Seja específico e construtivo
- Mantenha um tom profissional e respeitoso
- Se não houver páginas explícitas, analise por seções`;
}

export function buildChatPrompt(
  message: string,
  config: ChatConfig,
  documentContext?: string
): string {
  const academicLevelMap = {
    ensino_medio: 'Ensino Médio',
    graduacao: 'Graduação',
    pos_graduacao: 'Pós-graduação',
  };

  const normsMap = {
    apa: 'APA',
    abnt: 'ABNT',
    vancouver: 'Vancouver',
    outra: 'Outra',
  };

  return `Você é um assistente especializado em feedback acadêmico e análise textual.

CONFIGURAÇÕES DO USUÁRIO:
- Nível Acadêmico: ${academicLevelMap[config.academicLevel]}
- Norma Preferida: ${normsMap[config.norms]}

${documentContext ? `CONTEXTO DO DOCUMENTO:\n${documentContext}\n` : ''}

PERGUNTA DO USUÁRIO:
${message}

INSTRUÇÕES:
- Responda de forma construtiva e profissional
- Relacione a resposta aos parâmetros acadêmicos do usuário quando relevante
- Se o documento foi fornecido, faça referências específicas a ele
- Mantenha um tom educativo e de apoio`;
}
