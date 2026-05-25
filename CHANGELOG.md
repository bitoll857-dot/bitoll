## Melhorias no Sistema de Solicitação de Orçamento

### Adicionado
- Sistema dinâmico de inicialização do formulário de orçamento
- Suporte a `initialData` no QuoteRequestModal
- Pré-seleção automática do serviço no formulário
- Título dinâmico no modal baseado no serviço selecionado
- Rastreamento da origem da solicitação (`hero`, `promotion`, `service-products`)
- Fluxo reutilizável de abertura de orçamento entre componentes

### Atualizado
- Botões de orçamento da Hero Section
- Fluxo de solicitação nas promoções
- Fluxo de solicitação nos produtos de serviços
- Arquitetura do formulário de orçamento
- Componente SelectField para suportar valor controlado
- Estrutura do type Promotion com suporte a `service`

### Melhorado
- Gerenciamento de estado dos modais
- Inicialização dinâmica do formulário
- Comunicação entre componentes
- Reutilização e escalabilidade do sistema de orçamento
- Experiência de orçamento específica por serviço

### Refatorado
- Tipagem das props do modal de orçamento
- Tipagem do callback `onRequestQuote$`
- Estrutura dos campos do formulário
- Organização compartilhada das opções de serviços

### Corrigido
- Modal de orçamento que não abria
- Falta de propagação do `initialData`
- Funcionamento do valor no SelectField
- Problemas de tipagem com QRL
- Falha na seleção dinâmica de serviços
- Inconsistências na inicialização do modal