# Changelog

Este arquivo regista a linha de desenvolvimento da plataforma Bitoll. O README deve continuar focado numa explicacao breve do sistema, das funcionalidades principais e de como executar/acessar o projeto.

## 30/06/2026 - Ferramenta IA, pedidos de foto e moedas do sistema

### Adicionado

- Rota `/ferramentas/gerador-prompt-foto` para pedidos de edicao de foto com acesso por ID de WhatsApp e senha.
- Fluxo de criacao de acesso com senha automatica, login, troca de ID e reposicao de senha por codigo temporario.
- Verificacao da sessao guardada contra a base de dados antes de liberar o painel da Ferramenta IA.
- Formulario de pedido de edicao com imagem visivel, tipo de foto, objetivo, itens a manter, estilo final, proporcao, texto na imagem e detalhes extras.
- Geracao de prompt tecnico a partir dos campos selecionados, sem texto suplementar fora dos parametros escolhidos.
- Diferenca de visibilidade entre cliente e admin: o cliente nao ve o prompt tecnico, enquanto o admin pode consultar o prompt e responder o pedido.
- Lista de pedidos para admin e lista de pedidos proprios para cliente.
- Painel de moedas com saldo disponivel, compras aprovadas/pendentes e moedas retidas.
- Compra de moedas por E-Mola, mKesh e M-Pesa com deteccao automatica pelo prefixo do numero de Mocambique.
- Regra de prefixos para carteiras: `86`, `87`, `88` para E-Mola; `82`, `83` para mKesh; `84`, `85` para M-Pesa.
- Bloqueio de compra por prefixo estrangeiro com instrucao para contactar o admin pelo WhatsApp `00258866136316`.
- Custo dinamico do pedido por campos selecionados, usando 10 moedas por campo/parametro.
- Bloqueio do formulario para cliente com menos de 100 moedas disponiveis.
- Preload no envio de transferencia do cliente e no processamento admin de aprovacao/retencao.
- Toasts de feedback para erros de acesso, transferencia, saldo insuficiente e operacoes administrativas.
- Tabelas e funcoes SQL para `photo_prompt_accounts`, `photo_prompt_requests` e `photo_prompt_wallet_transfers`.

### Alterado

- O link da Ferramenta IA passou a estar disponivel no header.
- A pesquisa dentro da rota da Ferramenta IA passou a direcionar o contexto para pedidos de edicao de imagem.
- O painel superior da Ferramenta IA foi compactado, com acesso ao painel de identidade, moedas e pedidos por botoes/modais.
- O saldo disponivel passou a somar moedas `pendentes` e `aprovadas`, descontando pedidos ja enviados.
- Compras de moedas deixaram de entrar como aprovadas automaticamente e passaram a entrar como `pendente`.
- Moedas `retidas` deixaram de contar no saldo disponivel.
- O admin passou a ter apenas as acoes `aprovar` e `reter` em transferencias de moedas.
- A nota informativa de compra foi ajustada para explicar que a compra fica pendente e pode ser retida se o ID da transacao nao for evidente.

### Corrigido

- Erro de funcao `gen_salt` ausente ao configurar corretamente o uso de `pgcrypto` no schema.
- Erro de referencia ambigua da coluna `whatsapp` nas funcoes de acesso da Ferramenta IA.
- Falha em que a funcao `refreshToolPanels$` nao era encontrada em determinados pontos do fluxo.
- Erro 400 no envio de compra de moedas causado por desalinhamento entre a tela e a funcao SQL de transferencia.
- Exibicao inadequada de opcoes administrativas para cliente comum.
- Fluxo de moedas em que o saldo nao refletia corretamente compras pendentes, aprovadas e retidas.

### Nota de base de dados

- Execute novamente `supabase/schema.sql` no SQL Editor da base de dados da Bitoll para atualizar defaults, constraints, funcoes RPC e politicas ligadas a contas, pedidos e transferencias da Ferramenta IA.

## 30/05/2026 - Admin, base de dados da Bitoll e cotacao padrao

### Adicionado

- Integracao do fluxo principal com a base de dados da Bitoll para servicos, artigos, promocoes, cotacoes e dados do cliente.
- Painel administrativo com area de owner para gerir servicos, artigos, estruturas, cotacoes padrao, promocoes e solicitacoes.
- Area de operador para acompanhar solicitacoes aprovadas e informar progresso do trabalho ao cliente.
- Tabela `service_structure_options` para controlar as opcoes de estrutura de cada servico com titulo, descricao, imagem, ordem e estado publico/oculto.
- Upload de imagens para servicos, artigos, promocoes e estruturas usando o bucket `bitoll-images`.
- Limite de imagem de 0.3MB antes do envio para a base de dados da Bitoll.
- Toasts de feedback para operacoes de criacao, edicao, upload, ativacao, desativacao e eliminacao no admin.
- Entidades de cotacao padrao com templates, campos, artigos da cotacao e regras entre artigos.
- Regras de calculo por artigo editavel pelo cliente usando formula em etapas: valor base, operador matematico e valor.
- Suporte a ate cinco passos de formula por artigo afetado, com arredondamento e quantidade minima.
- Ligacao de promocoes a cotacoes padrao para reaproveitar artigos e calculos no fluxo do cliente.

### Alterado

- Modal de produtos necessarios do servico passou a carregar opcoes de estrutura da base de dados da Bitoll em vez de usar apenas dados estaticos.
- Formulario de cotacao do cliente passou a respeitar artigos editaveis, quantidades padrao e regras definidas na cotacao padrao.
- Artigos do admin passaram a usar as estruturas cadastradas para o servico escolhido.
- Cotacao padrao passou a selecionar artigos do servico escolhido e do servico independente.
- Mao de obra passou a ser definida na cotacao padrao e vinculada a um artigo selecionado como multiplicador.
- Imagens exibidas para servicos, artigos e promocoes passaram a usar URLs guardadas na base de dados.
- URL da base de dados da Bitoll passou a ser normalizada para evitar uso incorreto de `/rest/v1/` como base publica.
- Sidebar do usuario foi ajustada para refletir melhor a sessao ativa sem depender de reiniciar o navegador.

### Corrigido

- Callback de autenticacao que podia voltar para `localhost:3000` em ambiente hospedado.
- Erro de PKCE/code verifier ao alinhar o fluxo de autenticacao com o dominio correto.
- Falta de toast em operacoes CRUD do admin.
- Falha de upload causada por politicas RLS/storage quando o bucket nao permitia escrita por gestores de conteudo.
- Estruturas de servico exibidas no cliente com dados estaticos que nao representavam a base de dados.
- Produtos do cliente em estruturas diferentes de basica que nao carregavam a cotacao padrao correta.
- Detalhes de itens no admin que eram mostrados em toast em vez de modal.

### Nota de base de dados

- O arquivo `supabase/schema.sql` precisa ser executado no SQL Editor da base de dados da Bitoll depois destas alteracoes para criar/atualizar tabelas, colunas e politicas RLS.

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
