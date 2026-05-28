# Bitoll - Seguranca e Tecnologia

Sistema web institucional da Bitoll para apresentar servicos de seguranca e tecnologia, permitir solicitacao de orcamento, divulgar promocoes, pesquisar conteudos e oferecer recursos de acessibilidade ao visitante.

## Funcionalidades

- Pagina inicial com Hero e formulario de solicitacao de orcamento.
- Navbar com links ativos, pesquisa global, menu mobile, acessibilidade e painel do usuario.
- Area opcional do cliente com modal de login, registo e informacoes do usuario.
- Servicos com modal de produtos por nivel de estrutura: basica, media e alta.
- Tabela de produtos com detalhes por item e solicitacao de cotacao.
- Pagina de promocoes com desconto, periodo, tecnologias, detalhes e acao de solicitacao.
- Modal de acessibilidade com preferencias guardadas no localStorage.
- Dados temporarios estaticos em arquivos dentro de `src/data`.

## Tecnologias

- Qwik
- Qwik City
- Vite
- TypeScript
- Tailwind CSS
- Vercel Edge

## Estrutura Principal

- `src/components`: componentes reutilizaveis da interface.
- `src/components/sections`: secoes principais das paginas.
- `src/components/navigation`: navbar, menu mobile, avatar e sidebar do usuario.
- `src/components/forms`: formularios gerais, como solicitacao de orcamento.
- `src/components/auth`: modal e formularios de login/registo.
- `src/components/accessibility`: botao e modal de acessibilidade.
- `src/components/services`: modal de produtos e tabela por servico.
- `src/components/promotions`: modal de detalhes das promocoes.
- `src/components/search`: modal e tabela de pesquisa global.
- `src/data`: dados estaticos temporarios.
- `src/types`: tipos TypeScript do dominio.
- `src/utils`: funcoes auxiliares.
- `src/routes`: paginas e rotas do Qwik City.

## Dados Estaticos

Por enquanto, o sistema usa dados locais em `src/data`, como:

- `user.ts`
- `services.ts`
- `service-products.ts`
- `promotions.ts`
- `search.ts`
- `accessibility.ts`
- `links.ts`

No futuro, estes dados podem ser ligados a uma API, base de dados, CMS ou outro servico de armazenamento.

## Como Rodar

```bash
npm install
npm start

funcionalidades actuais da plataforma
cotação semi-automática
upload de imagens
promoções com factura, IVA e total
acessibilidade
sessão/logout
dados estáticos
estrutura de pastas
comandos de validação
equipa/desenvolvimento da plataforma