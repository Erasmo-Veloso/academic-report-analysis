# Analisador de Relatórios Acadêmicos

Aplicação web em **Next.js** para analisar relatórios acadêmicos com IA (Cohere), com suporte a upload de arquivos **PDF, DOCX e TXT**, análise estruturada e chat contextual.

## Funcionalidades

- Upload de documentos (até 10MB)
- Extração de texto por página
- Análise acadêmica estruturada (problemas por página, problemas gerais, referências, sugestões e avaliação final)
- Chat contextual com o conteúdo do documento
- Configuração da chave da API Cohere na interface
- Armazenamento local das análises no navegador (localStorage)

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Cohere API (`/v2/chat`)

## Requisitos

- Node.js 20+ (recomendado)
- npm
- Chave de API da Cohere: https://dashboard.cohere.ai/api-keys

## Como executar

```bash
npm install
npm run dev
```

Aplicação disponível em: `http://localhost:3000`

## Scripts

```bash
npm run dev    # ambiente de desenvolvimento
npm run build  # build de produção
npm run start  # executa build em produção
npm run lint   # lint do projeto (requer eslint instalado nas dependências)
```

## Como usar

1. Abra a aplicação e crie uma nova análise.
2. Vá em **Configurações** e salve sua chave da Cohere.
3. Faça upload de um arquivo PDF, DOCX ou TXT.
4. Execute a análise para receber feedback estruturado.
5. Use o chat para tirar dúvidas com contexto do documento.

## API interna

- `POST /api/analisar`  
  Recebe páginas do documento e configuração da análise.
- `POST /api/chat`  
  Recebe mensagem do usuário e histórico para conversa contextual.

Ambas as rotas esperam a chave no header:

`x-cohere-key: <SUA_CHAVE>`

## Observações

- A chave da API e as análises ficam armazenadas localmente no navegador.
- Não há necessidade de configurar arquivo `.env` para uso básico da aplicação.
