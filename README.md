# Bitoll - Seguranca e Tecnologia

Sistema web da Bitoll para apresentar servicos de seguranca e tecnologia, receber solicitacoes de cotacao, divulgar promocoes e acompanhar a progressao dos trabalhos aprovados.

## Funcionalidades

- Pagina publica com servicos, promocoes, pesquisa, acessibilidade e fluxo de solicitacao de cotacao.
- Autenticacao com a base de dados da Bitoll e perfil de cliente.
- Sidebar do usuario com dados da sessao, perfil e acesso a projetos/cotacoes.
- Servicos com opcoes de estrutura carregadas da base de dados.
- Modal de produtos necessarios por servico e estrutura.
- Cotacao padrao por servico, estrutura, artigos, quantidades padrao e mao de obra.
- Regras de calculo entre artigos quando o cliente pode editar uma quantidade.
- Promocoes ligadas a cotacoes padrao.
- Painel admin owner para gerir servicos, estruturas, artigos, cotacoes padrao, promocoes e solicitacoes.
- Painel admin operador para atualizar progresso, estado, tecnico, proximo passo e previsao de conclusao.
- Upload de imagens para o bucket `bitoll-images`, com limite de 0.3MB por imagem.
- Toasts de feedback para operacoes administrativas.

## Calculo de Cotacao

A cotacao padrao define quais artigos entram numa estrutura de servico e quais quantidades o cliente pode editar.

Quando um artigo editavel afeta outros artigos, o admin pode definir uma formula em etapas:

- O valor base e a quantidade editada pelo cliente.
- Cada etapa usa um operador matematico: `+`, `-`, `x` ou `/`.
- Cada etapa recebe um valor numerico.
- Cada regra pode ter quantidade minima e arredondamento para cima, normal ou para baixo.

Exemplos:

- PSU igual a quantidade de cameras: `base x 1`.
- Balun igual a quantidade de cameras: `base x 1`.
- DVR por canais: `base / 4`, arredondar para cima, minimo `1`.

## Base de dados da Bitoll

O sistema usa a base de dados da Bitoll para autenticacao, dados e storage.

Tabelas principais:

- `profiles`
- `admin_users`
- `services`
- `service_structure_options`
- `service_products`
- `service_quote_templates`
- `service_quote_template_fields`
- `service_quote_template_items`
- `service_quote_template_item_rules`
- `promotions`
- `quotes`
- `quote_items`

Bucket usado:

- `bitoll-images`

Depois de alteracoes de schema, execute o arquivo `supabase/schema.sql` no SQL Editor da base de dados da Bitoll para criar ou atualizar tabelas, colunas e politicas RLS.

## Variaveis de Ambiente

Crie um arquivo `.env` com as chaves publicas da base de dados da Bitoll:

```bash
PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON
SUPABASE_SERVICE_ROLE_KEY=SUA_CHAVE_SERVICE_ROLE
```

Use sempre a URL base do projeto da base de dados da Bitoll, sem `/rest/v1/`.
A chave `SUPABASE_SERVICE_ROLE_KEY` fica apenas no servidor e permite criar contas por telefone sem enviar email de confirmacao.

## Tecnologias

- Qwik
- Qwik City
- Vite
- TypeScript
- Tailwind CSS
- Base de dados da Bitoll
- Vercel

## Estrutura Principal

- `src/components`: componentes reutilizaveis da interface.
- `src/features`: modulos por dominio, como admin, auth, servicos e promocoes.
- `src/lib/supabase`: cliente da base de dados da Bitoll e carregamento de dados da plataforma.
- `src/routes`: paginas e rotas do Qwik City.
- `src/types`: tipos TypeScript do dominio.
- `supabase/schema.sql`: schema, politicas RLS e configuracoes de storage.

## Como Rodar

```bash
npm install
npm start
```

## Validacao

```bash
npm run build.types
```
