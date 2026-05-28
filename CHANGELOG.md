# Changelog

Este arquivo regista a linha de desenvolvimento da plataforma Bitoll. O README deve continuar focado numa explicacao breve do sistema, das funcionalidades principais e de como executar/acessar o projeto.

## 28/05/2026 - Historico consolidado

### Adicionado

- Estrutura principal da Home com `Header`, `Hero`, `NossosServicos`, `Sobre`, `CTA` e `Footer`.
- Modal de login e modal de registo para simular entrada e criacao de conta.
- Sidebar do usuario com dados de perfil, estado da sessao e acoes de conta.
- Modal de acessibilidade com preferencias guardadas em `localStorage`.
- Guia interativo do visitante para orientar o primeiro contacto com a plataforma.
- Pesquisa global para servicos, promocoes e dados simulados.
- Botoes flutuantes globais para usuario logado consultar servicos terminados, servicos em andamento e chat GSB.
- Dados simulados de usuario, sessao e projetos em arquivos locais, incluindo `users.data.ts`, `user.ts` e `customer-projects.ts`.
- Formulario de cotacao em modal ampliado para receber pedidos mais completos.
- Preenchimento automatico de dados do cliente logado no fluxo de cotacao.
- Bloqueio de cotacao para visitante sem login, com aviso por toast e chamada para iniciar sessao.
- Upload de imagens da obra no formulario de cotacao.
- Analise semi-automatica para estimativa de materiais em servicos como cerca eletrica.
- Campos tecnicos para estimativa, como comprimento, largura do muro, altura, cantos, entradas, tipo de portao e numero de linhas.
- Lista de artigos necessarios por servico ou promocao.
- Artigos recomendados bloqueados contra remocao quando fazem parte da solucao base.
- Modal de pesquisa para adicionar artigos extras a cotacao.
- Calculo fiscal da cotacao com subtotal, desconto, IVA de 12% e total final.
- Toasts de notificacao no canto inferior esquerdo.
- Pagina e modal de promocoes com estrutura proxima de fatura.
- Dados de promocoes com marca, modelo, sistema, quantidade, subtotal, desconto, IVA, total, artigos e imagem representativa.
- Modal sobre a equipa/desenvolvedores.
- Assinatura profissional no rodape com creditos de desenvolvimento, analise e UX.

### Alterado

- Botao de usuario da navbar passou a abrir a sidebar com informacoes do usuario.
- Avatar do usuario passou a depender do estado real de login.
- Estado sem login passou a mostrar icone generico.
- Estado logado sem foto passou a mostrar avatar com cor mais viva.
- Formulario de login e registo passou a abrir centralizado com fundo desfocado.
- Acessibilidade foi ajustada para funcionar tambem no menu mobile.
- Cartoes de servicos foram reorganizados para dar suporte ao fluxo de detalhes e cotacao.
- Botao "Avancar" dos servicos passou a abrir modal ampliado com artigos necessarios.
- Listagem de artigos passou de cards para tabela.
- Promocoes passaram a apresentar informacoes mais completas, incluindo IVA, desconto e total.
- Botao de cotacao das promocoes passou a seguir a mesma logica dos servicos.
- Notificacoes simples foram substituidas por toasts.
- Sidebar do usuario foi ajustada para limpar dados visuais depois do logout.
- Componentes protegidos passaram a aparecer apenas depois da verificacao real da sessao.
- Fluxo de abertura do modal de cotacao passou a aceitar dados iniciais conforme origem da solicitacao.
- `QuoteRequestModal` passou a suportar pre-selecao de servico, titulo dinamico e origem do pedido.
- Opcoes de servicos e props relacionadas ao fluxo de cotacao foram reorganizadas para reutilizacao entre Hero, promocoes e servicos.

### Corrigido

- Problema em que componentes apareciam como usuario logado antes da autenticacao terminar.
- Problema de estado ativo incorreto na sidebar depois do logout.
- Problema de toast ausente ao tentar remover artigo bloqueado.
- Inconsistencias entre necessidades de servicos e promocoes.
- Botoes sem acao foram ligados aos fluxos corretos.
- Navbar passou a identificar corretamente o link ativo.
- Avisos existentes no sistema foram analisados e reduzidos.
- Erros de importacao relacionados a componentes movidos foram corrigidos.
- Modal de cotacao que nao abria em alguns fluxos.
- Falta de propagacao de dados iniciais no formulario de cotacao.
- Falhas na selecao dinamica de servicos.
- Problemas de tipagem relacionados a callbacks QRL e props do modal.

### Planeado

- Trocar dados estaticos por banco de dados.
- Integrar login real com Google.
- Guardar cotacoes reais por cliente.
- Criar historico real de projetos por cliente.
- Melhorar analise automatica por imagem com apoio de IA.
- Criar documentacao mais completa da equipa.
- Criar dashboard administrativo.
- Criar sistema real de notificacoes e atualizacoes da plataforma.
