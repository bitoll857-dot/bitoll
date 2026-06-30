# Diagramas da plataforma Bitoll

Este documento descreve os principais fluxos e entidades da plataforma Bitoll.
Os diagramas estao em Mermaid para poderem ser visualizados no GitHub, em editores compativeis ou em ferramentas de documentacao.

## Diagrama de sequencia: solicitacao de servico pelo cliente

```mermaid
sequenceDiagram
    autonumber
    actor Cliente
    participant App as Plataforma Bitoll
    participant Auth as Autenticacao Supabase
    participant DB as Base de dados Supabase
    participant Admin as Painel administrativo

    Cliente->>App: Acede a lista de servicos
    App->>DB: Carrega services, service_products e templates
    DB-->>App: Devolve servicos, produtos e regras de cotacao
    Cliente->>App: Seleciona servico, estrutura e dados do pedido
    App->>Auth: Confirma sessao do cliente
    Auth-->>App: Devolve utilizador autenticado
    App->>DB: Cria quote e quote_items
    DB-->>App: Confirma solicitacao criada
    App-->>Cliente: Mostra numero da solicitacao e resumo
    Admin->>DB: Consulta novas solicitacoes
    DB-->>Admin: Devolve pedidos pendentes
```

## Diagrama de sequencia: tratamento administrativo e acompanhamento

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin/Owner
    participant Painel as Painel administrativo
    participant DB as Base de dados Supabase
    participant Storage as Documentos/Storage
    actor Operador
    actor Cliente
    participant Perfil as Perfil do cliente
    participant WhatsApp

    Admin->>Painel: Abre solicitacao do cliente
    Painel->>DB: Consulta quote, profile e quote_items
    DB-->>Painel: Devolve dados do pedido
    Admin->>Painel: Define procedimento, datas e tecnico
    Admin->>Storage: Carrega fatura-recibo ou documento
    Storage-->>Painel: Devolve link do documento
    Painel->>DB: Atualiza status, progresso, datas, passos e receiptUrl
    DB-->>Painel: Confirma actualizacao
    Painel->>WhatsApp: Prepara mensagem para o cliente
    WhatsApp-->>Cliente: Envia acesso ou acompanhamento
    Operador->>Painel: Actualiza progresso do servico
    Painel->>DB: Guarda progresso, passos e estado
    Cliente->>Perfil: Abre o seu perfil
    Perfil->>DB: Consulta servicos do cliente
    DB-->>Perfil: Devolve datas, passos e fatura-recibo
    Perfil-->>Cliente: Mostra servicos, passos executados e botao de manutencao
```

## Diagrama de actividade: ciclo completo do servico

```mermaid
flowchart TD
    A([Inicio]) --> B[Cliente consulta servicos]
    B --> C[Cliente escolhe servico e estrutura]
    C --> D[Cliente envia solicitacao]
    D --> E[Plataforma cria cotacao]
    E --> F{Admin valida pedido}
    F -->|Pedido incompleto| G[Admin contacta cliente]
    G --> C
    F -->|Pedido valido| H[Admin confirma valores e procedimento]
    H --> I{Cliente aceita?}
    I -->|Nao| J[Solicitacao fica pendente ou rejeitada]
    J --> Z([Fim])
    I -->|Sim| K[Admin define inicio, fim e tecnico]
    K --> L[Admin anexa fatura-recibo]
    L --> M[Servico entra em actividade]
    M --> N[Operador executa passos registados]
    N --> O[Operador actualiza progresso]
    O --> P{Todos os passos foram concluidos?}
    P -->|Nao| N
    P -->|Sim| Q[Servico terminado]
    Q --> R[Cliente consulta historico no perfil]
    R --> S{Cliente precisa de manutencao?}
    S -->|Sim| T[Cliente solicita manutencao pelo botao]
    T --> U[Equipa recebe pedido de manutencao]
    U --> M
    S -->|Nao| Z([Fim])
```

## Diagrama de actividade: gestao de conteudo e operacao

```mermaid
flowchart TD
    A([Inicio administrativo]) --> B{Tipo de utilizador}
    B -->|Owner/Admin| C[Gerir servicos, produtos e templates]
    B -->|Operador| D[Ver servicos em progresso]
    C --> E[Configurar estruturas, campos e regras de cotacao]
    E --> F[Publicar servico activo]
    F --> G[Servico fica disponivel ao cliente]
    C --> H[Consultar solicitacoes]
    H --> I[Converter pedido em servico acompanhado]
    I --> J[Definir passos, datas e responsavel]
    J --> K[Anexar documentos do cliente]
    K --> L[Actualizar estado da solicitacao]
    D --> M[Actualizar progresso operacional]
    M --> N{Servico terminou?}
    N -->|Nao| D
    N -->|Sim| O[Mover para servicos terminados]
    G --> P([Fim])
    O --> P
```

## Diagrama de estados: solicitacao e servico

```mermaid
stateDiagram-v2
    [*] --> Pendente: Cliente envia solicitacao
    Pendente --> EmAnalise: Admin abre pedido
    EmAnalise --> Pendente: Faltam dados
    EmAnalise --> Aprovado: Pedido validado
    EmAnalise --> Rejeitado: Pedido recusado
    Aprovado --> EmActividade: Datas, tecnico e passos definidos
    EmActividade --> EmProgresso: Operador inicia execucao
    EmProgresso --> EmProgresso: Passo actualizado
    EmProgresso --> Terminado: Todos os passos concluidos
    Terminado --> ManutencaoSolicitada: Cliente pede manutencao
    ManutencaoSolicitada --> EmActividade: Equipa agenda manutencao
    Rejeitado --> [*]
    Terminado --> [*]
```

## Diagrama entidade-relacionamento

```mermaid
erDiagram
    PROFILES {
        uuid id PK
        text full_name
        text email
        text phone
        text customer_type
        text city
        text status
        boolean verified
        boolean must_change_password
        timestamptz created_at
    }

    ADMIN_USERS {
        uuid user_id PK, FK
        text role
        boolean active
        timestamptz created_at
    }

    ACCOUNTS {
        uuid id PK
        uuid owner_id FK
        timestamptz created_at
    }

    ACCOUNT_MEMBERS {
        uuid account_id FK
        uuid user_id FK
        text role
        timestamptz created_at
    }

    SERVICES {
        uuid id PK
        text slug UK
        text title
        text category
        text description
        numeric base_price
        boolean active
        text image_url
        jsonb features
        jsonb benefits
    }

    SERVICE_PRODUCTS {
        uuid id PK
        text service_slug FK
        text structure
        text name
        text category
        numeric unit_price
        boolean active
    }

    SERVICE_STRUCTURE_OPTIONS {
        uuid id PK
        text service_slug FK
        text structure
        jsonb steps
        numeric structure_cost_percentage
    }

    SERVICE_QUOTE_TEMPLATES {
        uuid id PK
        text service_slug FK
        text structure
        text title
        uuid labor_product_id FK
        boolean active
    }

    SERVICE_QUOTE_TEMPLATE_FIELDS {
        uuid id PK
        uuid template_id FK
        text field_key
        text input_type
        jsonb options
    }

    SERVICE_QUOTE_TEMPLATE_ITEMS {
        uuid id PK
        uuid template_id FK
        uuid product_id FK
        text name
        numeric default_quantity
        numeric unit_price
    }

    SERVICE_QUOTE_TEMPLATE_ITEM_RULES {
        uuid id PK
        uuid template_id FK
        uuid source_product_id FK
        uuid target_product_id FK
        numeric multiplier
        numeric divisor
        jsonb formula_steps
    }

    PROMOTIONS {
        uuid id PK
        text service_slug FK
        uuid quote_template_id FK
        text title
        numeric discount_value
        boolean active
    }

    QUOTES {
        uuid id PK
        uuid account_id FK
        uuid profile_id FK
        text quote_number UK
        text service_slug FK
        jsonb request_payload
        numeric subtotal
        numeric discount
        numeric tax
        numeric total
        text status
        numeric progress
        text next_step
        text technician
        uuid technician_id FK
        date estimated_completion
        jsonb updates
        timestamptz created_at
    }

    QUOTE_ITEMS {
        uuid id PK
        uuid quote_id FK
        text name
        numeric quantity
        text unit
        numeric unit_price
        numeric total
        boolean locked
    }

    CUSTOM_QUOTES {
        uuid id PK
        text quote_number UK
        uuid profile_id FK
        text customer_name
        text customer_phone
        text service_slug FK
        uuid source_quote_template_id FK
        jsonb selected_items
        text status
        numeric subtotal
        numeric total
    }

    CUSTOM_QUOTE_ITEMS {
        uuid id PK
        uuid custom_quote_id FK
        uuid product_id FK
        text name
        text category
        numeric quantity
        numeric unit_price
        numeric total
    }

    CHAT_THREADS {
        uuid id PK
        uuid profile_id FK
        uuid account_id FK
        text subject
        timestamptz created_at
    }

    CHAT_MESSAGES {
        uuid id PK
        uuid thread_id FK
        text role
        text content
        timestamptz created_at
    }

    PLATFORM_DOCUMENTS {
        uuid id PK
        text source_type
        uuid source_id
        text title
        text content
        jsonb metadata
    }

    PROFILES ||--o| ADMIN_USERS : "pode ser"
    PROFILES ||--o{ ACCOUNTS : "possui"
    ACCOUNTS ||--o{ ACCOUNT_MEMBERS : "tem membros"
    PROFILES ||--o{ ACCOUNT_MEMBERS : "participa"
    ACCOUNTS ||--o{ QUOTES : "recebe"
    PROFILES ||--o{ QUOTES : "solicita"
    PROFILES ||--o{ QUOTES : "executa como tecnico"
    SERVICES ||--o{ SERVICE_PRODUCTS : "tem produtos"
    SERVICES ||--o{ SERVICE_STRUCTURE_OPTIONS : "tem estruturas"
    SERVICES ||--o{ SERVICE_QUOTE_TEMPLATES : "tem templates"
    SERVICES ||--o{ PROMOTIONS : "tem promocoes"
    SERVICES ||--o{ QUOTES : "origina"
    SERVICE_QUOTE_TEMPLATES ||--o{ SERVICE_QUOTE_TEMPLATE_FIELDS : "define campos"
    SERVICE_QUOTE_TEMPLATES ||--o{ SERVICE_QUOTE_TEMPLATE_ITEMS : "define itens"
    SERVICE_QUOTE_TEMPLATES ||--o{ SERVICE_QUOTE_TEMPLATE_ITEM_RULES : "define regras"
    SERVICE_PRODUCTS ||--o{ SERVICE_QUOTE_TEMPLATE_ITEMS : "aparece em"
    SERVICE_PRODUCTS ||--o{ CUSTOM_QUOTE_ITEMS : "pode compor"
    SERVICE_QUOTE_TEMPLATES ||--o{ PROMOTIONS : "pode ter"
    QUOTES ||--o{ QUOTE_ITEMS : "tem itens"
    PROFILES ||--o{ CUSTOM_QUOTES : "recebe"
    SERVICES ||--o{ CUSTOM_QUOTES : "baseia"
    SERVICE_QUOTE_TEMPLATES ||--o{ CUSTOM_QUOTES : "gera"
    CUSTOM_QUOTES ||--o{ CUSTOM_QUOTE_ITEMS : "tem itens"
    PROFILES ||--o{ CHAT_THREADS : "abre"
    ACCOUNTS ||--o{ CHAT_THREADS : "agrupa"
    CHAT_THREADS ||--o{ CHAT_MESSAGES : "tem mensagens"
```

## Observacoes de implementacao

- Os documentos como fatura-recibo ficam representados operacionalmente por links no `request_payload` da solicitacao, enquanto os ficheiros podem viver no Storage.
- Os passos apresentados no perfil do cliente devem vir dos passos registados para execucao do servico, evitando repetir informacoes gerais da cotacao.
- A manutencao nasce a partir do servico terminado ou em acompanhamento e deve manter referencia ao cliente, solicitacao original e tipo de servico.
- A tabela `quotes` e o seu `request_payload` concentram hoje varios dados de acompanhamento: datas, passos, documento e informacoes adicionais do pedido.
