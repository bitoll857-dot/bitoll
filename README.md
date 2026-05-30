# Bitoll - Seguranca e Tecnologia

Sistema web da Bitoll para apresentar servicos de seguranca e tecnologia, receber solicitacoes de cotacao, divulgar promocoes e acompanhar a progressao dos trabalhos aprovados.

## Funcionalidades

- Pagina publica com servicos, promocoes, pesquisa, acessibilidade e fluxo de solicitacao de cotacao.
- Autenticacao com Supabase Auth e perfil de cliente.
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

## Supabase

O sistema usa Supabase para autenticacao, base de dados e storage.

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

Depois de alteracoes de schema, execute o arquivo `supabase/schema.sql` no SQL Editor da Supabase para criar ou atualizar tabelas, colunas e politicas RLS.

## Variaveis de Ambiente

Crie um arquivo `.env` com as chaves publicas do Supabase:

```bash
PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON
```

Use sempre a URL base do projeto Supabase, sem `/rest/v1/`.

## Tecnologias

- Qwik
- Qwik City
- Vite
- TypeScript
- Tailwind CSS
- Supabase
- Vercel

## Estrutura Principal

- `src/components`: componentes reutilizaveis da interface.
- `src/features`: modulos por dominio, como admin, auth, servicos e promocoes.
- `src/lib/supabase`: cliente Supabase e carregamento de dados da plataforma.
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
