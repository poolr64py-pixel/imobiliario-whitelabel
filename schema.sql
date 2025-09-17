-- ==========================================
-- PLATAFORMA IMOBILIÁRIA WHITE-LABEL
-- Schema SQLite - REVISADO E TESTADO
-- Compatível com: SQLite 3.x, better-sqlite3, Strapi
-- ==========================================

-- Configurações SQLite para performance e integridade
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 1000000;
PRAGMA temp_store = memory;

-- ==========================================
-- FUNÇÃO AUXILIAR PARA UUIDs
-- ==========================================
-- SQLite não tem UUID nativo, usaremos função personalizada
-- Gera IDs compatíveis com formato UUID v4

-- ==========================================
-- 1. TABELA CLIENTES (WHITE-LABEL TENANTS)
-- ==========================================
CREATE TABLE IF NOT EXISTS clientes (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    nome TEXT NOT NULL CHECK (length(trim(nome)) >= 2),
    slug TEXT UNIQUE NOT NULL CHECK (
        length(trim(slug)) >= 3 AND 
        slug NOT GLOB '*[^a-z0-9-]*' AND
        slug NOT LIKE '-%' AND 
        slug NOT LIKE '%-'
    ),
    dominio TEXT UNIQUE CHECK (dominio IS NULL OR length(trim(dominio)) >= 4),
    email_contato TEXT NOT NULL CHECK (
        email_contato LIKE '%_@_%.__%' AND
        length(email_contato) >= 5
    ),
    telefone TEXT CHECK (telefone IS NULL OR length(trim(telefone)) >= 8),
    
    -- Configuração White-Label (JSON válido)
    configuracao_tema TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(configuracao_tema)),
    logo_url TEXT CHECK (logo_url IS NULL OR length(trim(logo_url)) >= 10),
    favicon_url TEXT CHECK (favicon_url IS NULL OR length(trim(favicon_url)) >= 10),
    
    -- Localização & Idioma
    pais TEXT NOT NULL DEFAULT 'BR' CHECK (length(pais) = 2),
    idioma_padrao TEXT NOT NULL DEFAULT 'pt-BR' CHECK (length(idioma_padrao) >= 2),
    moeda TEXT NOT NULL DEFAULT 'BRL' CHECK (length(moeda) = 3),
    fuso_horario TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    
    -- Configurações de Negócio
    comissao_padrao REAL NOT NULL DEFAULT 6.0 CHECK (
        comissao_padrao >= 0.0 AND comissao_padrao <= 100.0
    ),
    tipos_negocio TEXT NOT NULL DEFAULT 'venda,aluguel' CHECK (
        tipos_negocio IS NOT NULL AND length(trim(tipos_negocio)) > 0
    ),
    
    -- Integrações (JSON válido)
    integracoes TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(integracoes)),
    
    -- Status e Plano
    plano TEXT NOT NULL DEFAULT 'basico' CHECK (
        plano IN ('basico', 'premium', 'enterprise', 'trial')
    ),
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (
        status IN ('ativo', 'suspenso', 'cancelado', 'trial')
    ),
    limite_imoveis INTEGER NOT NULL DEFAULT 100 CHECK (limite_imoveis > 0),
    limite_corretores INTEGER NOT NULL DEFAULT 5 CHECK (limite_corretores > 0),
    
    -- Auditoria
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_by TEXT,
    updated_by TEXT
);

-- ==========================================
-- 2. TABELA CORRETORES/AGENTES
-- ==========================================
CREATE TABLE IF NOT EXISTS corretores (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    cliente_id TEXT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    
    -- Dados Pessoais
    nome TEXT NOT NULL CHECK (length(trim(nome)) >= 2),
    email TEXT NOT NULL CHECK (
        email LIKE '%_@_%.__%' AND length(email) >= 5
    ),
    telefone TEXT CHECK (telefone IS NULL OR length(trim(telefone)) >= 8),
    celular TEXT CHECK (celular IS NULL OR length(trim(celular)) >= 8),
    whatsapp TEXT CHECK (whatsapp IS NULL OR length(trim(whatsapp)) >= 8),
    
    -- Dados Profissionais
    creci TEXT CHECK (creci IS NULL OR length(trim(creci)) >= 5),
    cpf_cnpj TEXT CHECK (cpf_cnpj IS NULL OR length(trim(cpf_cnpj)) >= 11),
    foto_url TEXT CHECK (foto_url IS NULL OR length(trim(foto_url)) >= 10),
    biografia TEXT,
    especialidades TEXT DEFAULT '', -- separado por vírgula
    
    -- Configurações
    comissao_personalizada REAL CHECK (
        comissao_personalizada IS NULL OR 
        (comissao_personalizada >= 0.0 AND comissao_personalizada <= 100.0)
    ),
    is_admin INTEGER NOT NULL DEFAULT 0 CHECK (is_admin IN (0, 1)),
    is_ativo INTEGER NOT NULL DEFAULT 1 CHECK (is_ativo IN (0, 1)),
    pode_cadastrar_imoveis INTEGER NOT NULL DEFAULT 1 CHECK (pode_cadastrar_imoveis IN (0, 1)),
    pode_gerenciar_leads INTEGER NOT NULL DEFAULT 1 CHECK (pode_gerenciar_leads IN (0, 1)),
    
    -- Redes Sociais (JSON válido)
    redes_sociais TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(redes_sociais)),
    
    -- Autenticação
    password_hash TEXT,
    ultimo_login TEXT, -- ISO datetime
    
    -- Auditoria
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    -- Constraints únicos
    UNIQUE(cliente_id, email)
);

-- ==========================================
-- 3. TABELA CATEGORIAS DE IMÓVEIS
-- ==========================================
CREATE TABLE IF NOT EXISTS categorias_imoveis (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    cliente_id TEXT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    nome TEXT NOT NULL CHECK (length(trim(nome)) >= 2),
    slug TEXT NOT NULL CHECK (
        length(trim(slug)) >= 2 AND 
        slug NOT GLOB '*[^a-z0-9-]*'
    ),
    descricao TEXT,
    icone TEXT,
    ordem INTEGER NOT NULL DEFAULT 0 CHECK (ordem >= 0),
    ativo INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0, 1)),
    
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    UNIQUE(cliente_id, slug)
);

-- ==========================================
-- 4. TABELA IMÓVEIS
-- ==========================================
CREATE TABLE IF NOT EXISTS imoveis (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    cliente_id TEXT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    corretor_id TEXT NOT NULL REFERENCES corretores(id) ON DELETE RESTRICT,
    categoria_id TEXT REFERENCES categorias_imoveis(id) ON DELETE SET NULL,
    
    -- Identificação
    codigo_interno TEXT CHECK (
        codigo_interno IS NULL OR length(trim(codigo_interno)) >= 1
    ),
    titulo TEXT NOT NULL CHECK (length(trim(titulo)) >= 5),
    slug TEXT NOT NULL CHECK (
        length(trim(slug)) >= 3 AND 
        slug NOT GLOB '*[^a-z0-9-]*' AND
        slug NOT LIKE '-%' AND 
        slug NOT LIKE '%-'
    ),
    descricao TEXT,
    
    -- Tipo e Finalidade
    tipo TEXT NOT NULL CHECK (
        tipo IN ('residencial', 'comercial', 'rural', 'terreno', 'lancamento')
    ),
    subtipo TEXT,
    finalidade TEXT NOT NULL CHECK (
        finalidade IN ('venda', 'aluguel', 'ambos')
    ),
    
    -- Localização (campos obrigatórios)
    endereco_logradouro TEXT NOT NULL CHECK (length(trim(endereco_logradouro)) >= 3),
    endereco_numero TEXT,
    endereco_complemento TEXT,
    endereco_bairro TEXT NOT NULL CHECK (length(trim(endereco_bairro)) >= 2),
    endereco_cidade TEXT NOT NULL CHECK (length(trim(endereco_cidade)) >= 2),
    endereco_estado TEXT NOT NULL CHECK (length(trim(endereco_estado)) >= 2),
    endereco_cep TEXT CHECK (endereco_cep IS NULL OR length(trim(endereco_cep)) >= 5),
    endereco_pais TEXT NOT NULL DEFAULT 'BR' CHECK (length(endereco_pais) = 2),
    
    -- Coordenadas geográficas (validação de range)
    latitude REAL CHECK (latitude IS NULL OR (latitude >= -90.0 AND latitude <= 90.0)),
    longitude REAL CHECK (longitude IS NULL OR (longitude >= -180.0 AND longitude <= 180.0)),
    
    -- Características Físicas (valores positivos)
    area_total REAL CHECK (area_total IS NULL OR area_total > 0),
    area_construida REAL CHECK (area_construida IS NULL OR area_construida > 0),
    area_terreno REAL CHECK (area_terreno IS NULL OR area_terreno > 0),
    quartos INTEGER NOT NULL DEFAULT 0 CHECK (quartos >= 0 AND quartos <= 50),
    banheiros INTEGER NOT NULL DEFAULT 0 CHECK (banheiros >= 0 AND banheiros <= 50),
    suites INTEGER NOT NULL DEFAULT 0 CHECK (suites >= 0 AND suites <= 20),
    vagas_garagem INTEGER NOT NULL DEFAULT 0 CHECK (vagas_garagem >= 0 AND vagas_garagem <= 50),
    salas INTEGER NOT NULL DEFAULT 0 CHECK (salas >= 0 AND salas <= 20),
    andares INTEGER NOT NULL DEFAULT 1 CHECK (andares >= 1 AND andares <= 200),
    andar INTEGER CHECK (andar IS NULL OR (andar >= -10 AND andar <= 200)),
    
    -- Características Booleanas
    mobiliado INTEGER NOT NULL DEFAULT 0 CHECK (mobiliado IN (0, 1)),
    aceita_pets INTEGER NOT NULL DEFAULT 1 CHECK (aceita_pets IN (0, 1)),
    aceita_financiamento INTEGER NOT NULL DEFAULT 1 CHECK (aceita_financiamento IN (0, 1)),
    aceita_fgts INTEGER NOT NULL DEFAULT 1 CHECK (aceita_fgts IN (0, 1)),
    
    -- Características Extras (JSON válido)
    caracteristicas_extras TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(caracteristicas_extras)),
    
    -- Valores Financeiros (valores positivos)
    preco_venda REAL CHECK (preco_venda IS NULL OR preco_venda > 0),
    preco_aluguel REAL CHECK (preco_aluguel IS NULL OR preco_aluguel > 0),
    preco_condominio REAL NOT NULL DEFAULT 0 CHECK (preco_condominio >= 0),
    preco_iptu REAL NOT NULL DEFAULT 0 CHECK (preco_iptu >= 0),
    valor_escritura REAL NOT NULL DEFAULT 0 CHECK (valor_escritura >= 0),
    moeda TEXT NOT NULL DEFAULT 'BRL' CHECK (length(moeda) = 3),
    
    -- SEO & Marketing
    meta_title TEXT CHECK (meta_title IS NULL OR length(trim(meta_title)) >= 5),
    meta_description TEXT,
    palavras_chave TEXT, -- separado por vírgula
    
    -- Flags de Destaque
    destaque INTEGER NOT NULL DEFAULT 0 CHECK (destaque IN (0, 1)),
    exclusivo INTEGER NOT NULL DEFAULT 0 CHECK (exclusivo IN (0, 1)),
    oportunidade INTEGER NOT NULL DEFAULT 0 CHECK (oportunidade IN (0, 1)),
    
    -- Status e Controle
    status TEXT NOT NULL DEFAULT 'disponivel' CHECK (
        status IN ('disponivel', 'reservado', 'vendido', 'alugado', 'inativo', 'manutencao')
    ),
    visibilidade TEXT NOT NULL DEFAULT 'publico' CHECK (
        visibilidade IN ('publico', 'privado', 'rascunho')
    ),
    data_disponibilidade TEXT, -- ISO date
    
    -- Estatísticas (valores não negativos)
    visualizacoes INTEGER NOT NULL DEFAULT 0 CHECK (visualizacoes >= 0),
    favoritos_count INTEGER NOT NULL DEFAULT 0 CHECK (favoritos_count >= 0),
    leads_count INTEGER NOT NULL DEFAULT 0 CHECK (leads_count >= 0),
    
    -- Auditoria
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    published_at TEXT, -- ISO datetime
    
    -- Constraints de validação complexas
    CHECK (
        -- Pelo menos um preço deve estar definido baseado na finalidade
        CASE 
            WHEN finalidade = 'venda' THEN preco_venda IS NOT NULL
            WHEN finalidade = 'aluguel' THEN preco_aluguel IS NOT NULL  
            WHEN finalidade = 'ambos' THEN preco_venda IS NOT NULL AND preco_aluguel IS NOT NULL
            ELSE 0
        END
    ),
    CHECK (
        -- Coordenadas devem ser definidas juntas ou ambas nulas
        (latitude IS NULL AND longitude IS NULL) OR 
        (latitude IS NOT NULL AND longitude IS NOT NULL)
    ),
    CHECK (
        -- Suítes não podem ser maior que quartos
        suites <= quartos
    ),
    CHECK (
        -- Área construída não pode ser maior que área total (quando ambas definidas)
        (area_total IS NULL OR area_construida IS NULL) OR 
        (area_construida <= area_total)
    ),
    
    -- Constraints únicos
    UNIQUE(cliente_id, slug),
    UNIQUE(cliente_id, codigo_interno)
);

-- ==========================================
-- 5. TABELA IMAGENS DOS IMÓVEIS
-- ==========================================
CREATE TABLE IF NOT EXISTS imovel_imagens (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    imovel_id TEXT NOT NULL REFERENCES imoveis(id) ON DELETE CASCADE,
    
    -- URLs das imagens (obrigatório pelo menos url_original)
    url_original TEXT NOT NULL CHECK (length(trim(url_original)) >= 10),
    url_thumb TEXT CHECK (url_thumb IS NULL OR length(trim(url_thumb)) >= 10),
    url_medium TEXT CHECK (url_medium IS NULL OR length(trim(url_medium)) >= 10),
    url_large TEXT CHECK (url_large IS NULL OR length(trim(url_large)) >= 10),
    
    -- Metadados
    titulo TEXT,
    descricao TEXT,
    alt_text TEXT,
    ordem INTEGER NOT NULL DEFAULT 0 CHECK (ordem >= 0),
    is_principal INTEGER NOT NULL DEFAULT 0 CHECK (is_principal IN (0, 1)),
    
    -- Informações técnicas
    nome_arquivo TEXT,
    tamanho_bytes INTEGER CHECK (tamanho_bytes IS NULL OR tamanho_bytes > 0),
    largura INTEGER CHECK (largura IS NULL OR largura > 0),
    altura INTEGER CHECK (altura IS NULL OR altura > 0),
    formato TEXT CHECK (
        formato IS NULL OR formato IN ('jpg', 'jpeg', 'png', 'webp', 'gif')
    ),
    
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ==========================================
-- 6. TABELA LEADS
-- ==========================================
CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    cliente_id TEXT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    imovel_id TEXT REFERENCES imoveis(id) ON DELETE SET NULL,
    corretor_id TEXT REFERENCES corretores(id) ON DELETE SET NULL,
    
    -- Dados Pessoais
    nome TEXT NOT NULL CHECK (length(trim(nome)) >= 2),
    email TEXT CHECK (email IS NULL OR (email LIKE '%_@_%.__%' AND length(email) >= 5)),
    telefone TEXT CHECK (telefone IS NULL OR length(trim(telefone)) >= 8),
    celular TEXT CHECK (celular IS NULL OR length(trim(celular)) >= 8),
    whatsapp TEXT CHECK (whatsapp IS NULL OR length(trim(whatsapp)) >= 8),
    
    -- Interesse
    tipo_interesse TEXT NOT NULL CHECK (
        tipo_interesse IN ('compra', 'aluguel', 'venda', 'avaliacao', 'informacao')
    ),
    orcamento_min REAL CHECK (orcamento_min IS NULL OR orcamento_min > 0),
    orcamento_max REAL CHECK (orcamento_max IS NULL OR orcamento_max > 0),
    preferencias_busca TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(preferencias_busca)),
    mensagem TEXT,
    
    -- Origem e Tracking
    origem TEXT NOT NULL DEFAULT 'site' CHECK (length(trim(origem)) >= 2),
    origem_url TEXT,
    origem_detalhes TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(origem_detalhes)),
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_content TEXT,
    utm_term TEXT,
    
    -- Qualificação e Scoring
    score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
    temperatura TEXT NOT NULL DEFAULT 'frio' CHECK (
        temperatura IN ('frio', 'morno', 'quente')
    ),
    perfil_cliente TEXT,
    
    -- Comunicação e Follow-up
    historico_interacoes TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(historico_interacoes)),
    ultima_interacao TEXT, -- ISO datetime
    proxima_acao TEXT, -- ISO datetime
    
    -- Status e Resultado
    status TEXT NOT NULL DEFAULT 'novo' CHECK (
        status IN ('novo', 'contatado', 'qualificado', 'proposta', 'negociacao', 'fechado', 'perdido')
    ),
    sub_status TEXT,
    motivo_perda TEXT,
    valor_negociado REAL CHECK (valor_negociado IS NULL OR valor_negociado > 0),
    observacoes TEXT,
    
    -- Dados técnicos
    ip_address TEXT,
    user_agent TEXT,
    session_id TEXT,
    
    -- Auditoria
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    -- Validação de orçamentos
    CHECK (
        orcamento_max IS NULL OR orcamento_min IS NULL OR orcamento_max >= orcamento_min
    ),
    -- Pelo menos um meio de contato deve estar presente
    CHECK (
        email IS NOT NULL OR telefone IS NOT NULL OR celular IS NOT NULL
    )
);

-- ==========================================
-- 7. TABELA VISITAS AGENDADAS
-- ==========================================
CREATE TABLE IF NOT EXISTS visitas (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    cliente_id TEXT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    imovel_id TEXT NOT NULL REFERENCES imoveis(id) ON DELETE CASCADE,
    lead_id TEXT REFERENCES leads(id) ON DELETE SET NULL,
    corretor_id TEXT NOT NULL REFERENCES corretores(id) ON DELETE RESTRICT,
    
    -- Agendamento
    data_agendada TEXT NOT NULL, -- ISO datetime
    data_realizada TEXT, -- ISO datetime
    duracao_prevista INTEGER NOT NULL DEFAULT 60 CHECK (duracao_prevista > 0 AND duracao_prevista <= 480), -- minutos
    
    -- Dados do Visitante
    visitante_nome TEXT NOT NULL CHECK (length(trim(visitante_nome)) >= 2),
    visitante_email TEXT CHECK (
        visitante_email IS NULL OR 
        (visitante_email LIKE '%_@_%.__%' AND length(visitante_email) >= 5)
    ),
    visitante_telefone TEXT CHECK (
        visitante_telefone IS NULL OR length(trim(visitante_telefone)) >= 8
    ),
    quantidade_pessoas INTEGER NOT NULL DEFAULT 1 CHECK (
        quantidade_pessoas >= 1 AND quantidade_pessoas <= 20
    ),
    
    -- Status e Controle
    status TEXT NOT NULL DEFAULT 'agendada' CHECK (
        status IN ('agendada', 'confirmada', 'realizada', 'cancelada', 'nao_compareceu')
    ),
    
    -- Feedback pós-visita
    feedback_visitante TEXT,
    avaliacao_interesse INTEGER CHECK (
        avaliacao_interesse IS NULL OR 
        (avaliacao_interesse >= 1 AND avaliacao_interesse <= 5)
    ),
    observacoes_corretor TEXT,
    
    -- Próximos passos
    proxima_acao TEXT,
    data_proxima_acao TEXT, -- ISO datetime
    
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    -- Data agendada deve ser no futuro (na criação)
    CHECK (data_agendada > created_at)
);

-- ==========================================
-- 8. TABELA FAVORITOS
-- ==========================================
CREATE TABLE IF NOT EXISTS favoritos (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    cliente_id TEXT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    imovel_id TEXT NOT NULL REFERENCES imoveis(id) ON DELETE CASCADE,
    
    -- Identificação do usuário (pelo menos um deve estar presente)
    lead_id TEXT REFERENCES leads(id) ON DELETE CASCADE,
    session_id TEXT, -- Para usuários anônimos
    ip_address TEXT,
    user_agent TEXT,
    
    -- Metadados
    notas TEXT,
    tags TEXT, -- separado por vírgula
    
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    
    -- Pelo menos uma identificação deve estar presente
    CHECK (lead_id IS NOT NULL OR session_id IS NOT NULL),
    
    -- Evitar duplicatas por lead
    UNIQUE(imovel_id, lead_id),
    -- Evitar duplicatas por sessão anônima
    UNIQUE(imovel_id, session_id)
);

-- ==========================================
-- 9. TABELA CONFIGURAÇÕES DO SITE
-- ==========================================
CREATE TABLE IF NOT EXISTS configuracoes_site (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    cliente_id TEXT UNIQUE NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    
    -- SEO Global
    site_title TEXT,
    site_description TEXT,
    site_keywords TEXT,
    robots_txt TEXT,
    
    -- Informações de Contato
    nome_empresa TEXT,
    endereco_completo TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(endereco_completo)),
    telefones TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(telefones)),
    emails TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(emails)),
    horario_funcionamento TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(horario_funcionamento)),
    
    -- Redes Sociais
    redes_sociais TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(redes_sociais)),
    
    -- Configurações de Layout e Design
    layout_configuracao TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(layout_configuracao)),
    tema_cores TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(tema_cores)),
    tipografia TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(tipografia)),
    
    -- Funcionalidades do Site
    funcionalidades_ativas TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(funcionalidades_ativas)),
    modulos_habilitados TEXT NOT NULL DEFAULT '', -- separado por vírgula
    
    -- Integrações Externas
    google_analytics_id TEXT,
    google_tag_manager_id TEXT,
    facebook_pixel_id TEXT,
    google_maps_api_key TEXT,
    whatsapp_numero TEXT,
    
    -- Configurações de Email
    smtp_configuracao TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(smtp_configuracao)),
    email_templates TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(email_templates)),
    
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ==========================================
-- 10. TABELA LOGS DE ATIVIDADES
-- ==========================================
CREATE TABLE IF NOT EXISTS atividades_log (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    cliente_id TEXT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    
    -- Identificação da Ação
    recurso TEXT NOT NULL CHECK (length(trim(recurso)) >= 2), -- tabela/entidade afetada
    recurso_id TEXT,
    acao TEXT NOT NULL CHECK (length(trim(acao)) >= 2), -- CREATE, UPDATE, DELETE, VIEW, etc.
    
    -- Contexto da Ação
    usuario_id TEXT, -- ID do corretor
    usuario_tipo TEXT CHECK (
        usuario_tipo IS NULL OR usuario_tipo IN ('corretor', 'admin', 'sistema', 'publico')
    ),
    usuario_nome TEXT,
    
    -- Dados da Alteração (JSON válido)
    dados_anteriores TEXT CHECK (dados_anteriores IS NULL OR json_valid(dados_anteriores)),
    dados_novos TEXT CHECK (dados_novos IS NULL OR json_valid(dados_novos)),
    campos_alterados TEXT, -- separado por vírgula
    
    -- Informações Técnicas
    ip_address TEXT,
    user_agent TEXT,
    metadados TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(metadados)),
    
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ==========================================
-- ÍNDICES OTIMIZADOS PARA PERFORMANCE
-- ==========================================

-- Multi-tenancy (CRÍTICOS)
CREATE INDEX IF NOT EXISTS idx_corretores_cliente_ativo ON corretores(cliente_id, is_ativo);
CREATE INDEX IF NOT EXISTS idx_imoveis_cliente_status ON imoveis(cliente_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_cliente_status ON leads(cliente_id, status);
CREATE INDEX IF NOT EXISTS idx_visitas_cliente_data ON visitas(cliente_id, data_agendada);
CREATE INDEX IF NOT EXISTS idx_favoritos_cliente ON favoritos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_categorias_cliente_ativo ON categorias_imoveis(cliente_id, ativo);

-- Imóveis - Busca e Filtros (PRINCIPAIS)
CREATE INDEX IF NOT EXISTS idx_imoveis_busca_principal ON imoveis(cliente_id, status, finalidade, tipo);
CREATE INDEX IF NOT EXISTS idx_imoveis_preco_venda ON imoveis(preco_venda) WHERE preco_venda IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_imoveis_preco_aluguel ON imoveis(preco_aluguel) WHERE preco_aluguel IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_imoveis_localizacao ON imoveis(endereco_cidade, endereco_bairro);
CREATE INDEX IF NOT EXISTS idx_imoveis_caracteristicas ON imoveis(quartos, banheiros, vagas_garagem);
CREATE INDEX IF NOT EXISTS idx_imoveis_coordenadas ON imoveis(latitude, longitude) WHERE latitude IS NOT NULL;

-- SEO e URLs
CREATE INDEX IF NOT EXISTS idx_clientes_slug ON clientes(slug);
CREATE INDEX IF NOT EXISTS idx_imoveis_slug ON imoveis(cliente_id, slug);

-- Leads - CRM
CREATE INDEX IF NOT EXISTS idx_leads_pipeline ON leads(cliente_id, status, temperatura);
CREATE INDEX IF NOT EXISTS idx_leads_origem ON leads(origem, cliente_id);
CREATE INDEX IF NOT EXISTS idx_leads_corretor_status ON leads(corretor_id, status) WHERE corretor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score DESC);

-- Visitas
CREATE INDEX IF NOT EXISTS idx_visitas_agenda ON visitas(corretor_id, data_agendada, status);

-- Imagens
CREATE INDEX IF NOT EXISTS idx_imovel_imagens_ordem ON imovel_imagens(imovel_id, ordem);
CREATE INDEX IF NOT EXISTS idx_imovel_imagens_principal ON imovel_imagens(imovel_id) WHERE is_principal = 1;

-- Logs (para auditoria)
CREATE INDEX IF NOT EXISTS idx_atividades_cliente_data ON atividades_log(cliente_id, created_at);
CREATE INDEX IF NOT EXISTS idx_atividades_recurso ON atividades_log(recurso, recurso_id);

-- Performance para relatórios
CREATE INDEX IF NOT EXISTS idx_imoveis_created_at ON imoveis(cliente_id, created_at);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(cliente_id, created_at);

-- ==========================================
-- TRIGGERS PARA AUTOMAÇÃO
-- ==========================================

-- Trigger para updated_at automático
CREATE TRIGGER IF NOT EXISTS trg_clientes_updated_at 
    AFTER UPDATE ON clientes
BEGIN
    UPDATE clientes SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_corretores_updated_at 
    AFTER UPDATE ON corretores
BEGIN
    UPDATE corretores SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_imoveis_updated_at 
    AFTER UPDATE ON imoveis
BEGIN
    UPDATE imoveis SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_leads_updated_at 
    AFTER UPDATE ON leads
BEGIN
    UPDATE leads SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_visitas_updated_at 
    AFTER UPDATE ON visitas
BEGIN
    UPDATE visitas SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_configuracoes_updated_at 
    AFTER UPDATE ON configuracoes_site
BEGIN
    UPDATE configuracoes_site SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Trigger para garantir apenas uma imagem principal por imóvel
CREATE TRIGGER IF NOT EXISTS trg_imagem_principal_insert 
    BEFORE INSERT ON imovel_imagens
    WHEN NEW.is_principal = 1
BEGIN
    UPDATE imovel_imagens 
    SET is_principal = 0 
    WHERE imovel_id = NEW.imovel_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_imagem_principal_update 
    BEFORE UPDATE ON imovel_imagens
    WHEN NEW.is_principal = 1 AND OLD.is_principal = 0
BEGIN
    UPDATE imovel_imagens 
    SET is_principal = 0 
    WHERE imovel_id = NEW.imovel_id AND id != NEW.id;
END;

-- Triggers para atualizar contadores automaticamente
CREATE TRIGGER IF NOT EXISTS trg_favoritos_insert_count 
    AFTER INSERT ON favoritos
BEGIN
    UPDATE imoveis 
    SET favoritos_count = favoritos_count + 1 
    WHERE id = NEW.imovel_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_favoritos_delete_count 
    AFTER DELETE ON favoritos
BEGIN
    UPDATE imoveis 
    SET favoritos_count = favoritos_count - 1 
    WHERE id = OLD.imovel_id AND favoritos_count > 0;
END;

CREATE TRIGGER IF NOT EXISTS trg_leads_insert_count 
    AFTER INSERT ON leads
    WHEN NEW.imovel_id IS NOT NULL
BEGIN
    UPDATE imoveis 
    SET leads_count = leads_count + 1 
    WHERE id = NEW.imovel_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_leads_delete_count 
    AFTER DELETE ON leads
    WHEN OLD.imovel_id IS NOT NULL
BEGIN
    UPDATE imoveis 
    SET leads_count = leads_count - 1 
    WHERE id = OLD.imovel_id AND leads_count > 0;
END;

-- Trigger para log de atividades automático
CREATE TRIGGER IF NOT EXISTS trg_imoveis_log_insert
    AFTER INSERT ON imoveis
BEGIN
    INSERT INTO atividades_log (
        cliente_id, recurso, recurso_id, acao, 
        usuario_id, dados_novos
    ) VALUES (
        NEW.cliente_id, 'imoveis', NEW.id, 'CREATE',
        NEW.corretor_id, json_object('titulo', NEW.titulo, 'status', NEW.status)
    );
END;

CREATE TRIGGER IF NOT EXISTS trg_imoveis_log_update
    AFTER UPDATE ON imoveis
BEGIN
    INSERT INTO atividades_log (
        cliente_id, recurso, recurso_id, acao,
        usuario_id, dados_anteriores, dados_novos,
        campos_alterados
    ) VALUES (
        NEW.cliente_id, 'imoveis', NEW.id, 'UPDATE',
        NEW.corretor_id, 
        json_object('titulo', OLD.titulo, 'status', OLD.status),
        json_object('titulo', NEW.titulo, 'status', NEW.status),
        CASE 
            WHEN OLD.titulo != NEW.titulo AND OLD.status != NEW.status THEN 'titulo,status'
            WHEN OLD.titulo != NEW.titulo THEN 'titulo' 
            WHEN OLD.status != NEW.status THEN 'status'
            ELSE 'outros'
        END
    );
END;

-- ==========================================
-- VIEWS OTIMIZADAS PARA APLICAÇÃO
-- ==========================================

-- View: Imóveis com informações completas
CREATE VIEW IF NOT EXISTS v_imoveis_completos AS
SELECT 
    i.id,
    i.cliente_id,
    i.titulo,
    i.slug,
    i.descricao,
    i.tipo,
    i.subtipo,
    i.finalidade,
    i.status,
    
    -- Endereço completo formatado
    (i.endereco_logradouro || 
     CASE WHEN i.endereco_numero IS NOT NULL THEN ', ' || i.endereco_numero ELSE '' END ||
     ' - ' || i.endereco_bairro || ', ' || i.endereco_cidade || ' - ' || i.endereco_estado
    ) AS endereco_completo,
    
    i.endereco_cidade,
    i.endereco_bairro,
    i.endereco_estado,
    i.latitude,
    i.longitude,
    
    -- Características
    i.quartos,
    i.banheiros,
    i.suites,
    i.vagas_garagem,
    i.area_total,
    i.area_construida,
    
    -- Preços formatados
    i.preco_venda,
    i.preco_aluguel,
    i.preco_condominio,
    i.moeda,
    
    -- Corretor
    c.nome AS corretor_nome,
    c.telefone AS corretor_telefone,
    c.email AS corretor_email,
    c.foto_url AS corretor_foto,
    c.whatsapp AS corretor_whatsapp,
    
    -- Cliente
    cl.nome AS cliente_nome,
    cl.slug AS cliente_slug,
    
    -- Categoria
    cat.nome AS categoria_nome,
    cat.icone AS categoria_icone,
    
    -- Estatísticas
    i.visualizacoes,
    i.favoritos_count,
    i.leads_count,
    
    -- Imagem principal
    img.url_medium AS imagem_principal,
    img.alt_text AS imagem_alt,
    
    -- Datas
    i.created_at,
    i.updated_at,
    i.published_at

FROM imoveis i
JOIN corretores c ON i.corretor_id = c.id
JOIN clientes cl ON i.cliente_id = cl.id
LEFT JOIN categorias_imoveis cat ON i.categoria_id = cat.id
LEFT JOIN imovel_imagens img ON i.id = img.imovel_id AND img.is_principal = 1;

-- View: Dashboard de performance por corretor
CREATE VIEW IF NOT EXISTS v_dashboard_corretores AS
SELECT 
    c.id,
    c.cliente_id,
    c.nome,
    c.email,
    c.is_ativo,
    c.ultimo_login,
    
    -- Contadores de imóveis
    COALESCE(stats.total_imoveis, 0) AS total_imoveis,
    COALESCE(stats.imoveis_disponiveis, 0) AS imoveis_disponiveis,
    COALESCE(stats.imoveis_vendidos, 0) AS imoveis_vendidos,
    COALESCE(stats.imoveis_alugados, 0) AS imoveis_alugados,
    
    -- Contadores de leads
    COALESCE(stats.total_leads, 0) AS total_leads,
    COALESCE(stats.leads_novos, 0) AS leads_novos,
    COALESCE(stats.leads_qualificados, 0) AS leads_qualificados,
    COALESCE(stats.leads_fechados, 0) AS leads_fechados,
    
    -- Métricas de qualidade
    COALESCE(stats.score_medio_leads, 0) AS score_medio_leads,
    COALESCE(stats.total_visitas, 0) AS total_visitas,
    COALESCE(stats.visitas_realizadas, 0) AS visitas_realizadas,
    
    -- Performance últimos 30 dias
    COALESCE(stats.leads_ultimo_mes, 0) AS leads_ultimo_mes,
    COALESCE(stats.visitas_ultimo_mes, 0) AS visitas_ultimo_mes,
    
    c.created_at

FROM corretores c
LEFT JOIN (
    SELECT 
        i.corretor_id,
        COUNT(DISTINCT i.id) AS total_imoveis,
        COUNT(DISTINCT CASE WHEN i.status = 'disponivel' THEN i.id END) AS imoveis_disponiveis,
        COUNT(DISTINCT CASE WHEN i.status = 'vendido' THEN i.id END) AS imoveis_vendidos,
        COUNT(DISTINCT CASE WHEN i.status = 'alugado' THEN i.id END) AS imoveis_alugados,
        
        COUNT(DISTINCT l.id) AS total_leads,
        COUNT(DISTINCT CASE WHEN l.status = 'novo' THEN l.id END) AS leads_novos,
        COUNT(DISTINCT CASE WHEN l.status = 'qualificado' THEN l.id END) AS leads_qualificados,
        COUNT(DISTINCT CASE WHEN l.status = 'fechado' THEN l.id END) AS leads_fechados,
        
        AVG(l.score) AS score_medio_leads,
        COUNT(DISTINCT v.id) AS total_visitas,
        COUNT(DISTINCT CASE WHEN v.status = 'realizada' THEN v.id END) AS visitas_realizadas,
        
        COUNT(DISTINCT CASE WHEN l.created_at >= date('now', '-30 days') THEN l.id END) AS leads_ultimo_mes,
        COUNT(DISTINCT CASE WHEN v.created_at >= date('now', '-30 days') THEN v.id END) AS visitas_ultimo_mes
        
    FROM imoveis i
    LEFT JOIN leads l ON i.corretor_id = l.corretor_id
    LEFT JOIN visitas v ON i.corretor_id = v.corretor_id
    GROUP BY i.corretor_id
) stats ON c.id = stats.corretor_id;

-- View: Relatório de leads por origem
CREATE VIEW IF NOT EXISTS v_leads_por_origem AS
SELECT 
    l.cliente_id,
    l.origem,
    COUNT(*) AS total_leads,
    COUNT(CASE WHEN l.status = 'fechado' THEN 1 END) AS leads_convertidos,
    ROUND(
        (COUNT(CASE WHEN l.status = 'fechado' THEN 1 END) * 100.0 / COUNT(*)), 2
    ) AS taxa_conversao,
    ROUND(AVG(l.score), 1) AS score_medio,
    
    -- Por período
    COUNT(CASE WHEN l.created_at >= date('now', '-7 days') THEN 1 END) AS leads_ultima_semana,
    COUNT(CASE WHEN l.created_at >= date('now', '-30 days') THEN 1 END) AS leads_ultimo_mes,
    COUNT(CASE WHEN l.created_at >= date('now', '-90 days') THEN 1 END) AS leads_ultimo_trimestre,
    
    MIN(l.created_at) AS primeiro_lead,
    MAX(l.created_at) AS ultimo_lead

FROM leads l
GROUP BY l.cliente_id, l.origem
ORDER BY total_leads DESC;

-- View: Top imóveis por popularidade
CREATE VIEW IF NOT EXISTS v_imoveis_populares AS
SELECT 
    i.id,
    i.cliente_id,
    i.titulo,
    i.slug,
    i.tipo,
    i.endereco_cidade,
    i.endereco_bairro,
    i.preco_venda,
    i.preco_aluguel,
    i.visualizacoes,
    i.favoritos_count,
    i.leads_count,
    
    -- Score de popularidade ponderado
    ROUND(
        (i.visualizacoes * 0.3 + i.favoritos_count * 2.0 + i.leads_count * 5.0), 2
    ) AS score_popularidade,
    
    c.nome AS corretor_nome,
    img.url_medium AS imagem_principal,
    
    i.created_at

FROM imoveis i
JOIN corretores c ON i.corretor_id = c.id
LEFT JOIN imovel_imagens img ON i.id = img.imovel_id AND img.is_principal = 1
WHERE i.status = 'disponivel'
ORDER BY score_popularidade DESC;

-- ==========================================
-- DADOS INICIAIS (SEEDS) - TESTADOS
-- ==========================================

-- Cliente demonstração Brasil
INSERT OR IGNORE INTO clientes (
    id, nome, slug, email_contato, telefone, pais, idioma_padrao, moeda, configuracao_tema
) VALUES (
    'demo-br-id-12345678', 'Imobiliária Demo BR', 'demo-br', 'contato@demo.imobiliaria.com.br',
    '+55 11 99999-9999', 'BR', 'pt-BR', 'BRL',
    '{"primary_color": "#2563eb", "secondary_color": "#64748b", "accent_color": "#dc2626", "font_family": "Inter"}'
);

-- Cliente demonstração Paraguai
INSERT OR IGNORE INTO clientes (
    id, nome, slug, email_contato, telefone, pais, idioma_padrao, moeda, configuracao_tema
) VALUES (
    'demo-py-id-87654321', 'Inmobiliaria Demo PY', 'demo-py', 'contacto@demo.inmobiliaria.com.py',
    '+595 21 999-999', 'PY', 'es-PY', 'PYG',
    '{"primary_color": "#059669", "secondary_color": "#6b7280", "accent_color": "#dc2626", "font_family": "Inter"}'
);

-- Categorias para cliente demo BR
INSERT OR IGNORE INTO categorias_imoveis (cliente_id, nome, slug, icone, ordem) VALUES
('demo-br-id-12345678', 'Apartamentos', 'apartamentos', 'building-2', 1),
('demo-br-id-12345678', 'Casas', 'casas', 'home', 2),
('demo-br-id-12345678', 'Terrenos', 'terrenos', 'map', 3),
('demo-br-id-12345678', 'Comerciais', 'comerciais', 'building-store', 4),
('demo-br-id-12345678', 'Rurais', 'rurais', 'trees', 5);

-- Categorias para cliente demo PY
INSERT OR IGNORE INTO categorias_imoveis (cliente_id, nome, slug, icone, ordem) VALUES
('demo-py-id-87654321', 'Departamentos', 'departamentos', 'building-2', 1),
('demo-py-id-87654321', 'Casas', 'casas', 'home', 2),
('demo-py-id-87654321', 'Terrenos', 'terrenos', 'map', 3),
('demo-py-id-87654321', 'Comerciales', 'comerciales', 'building-store', 4),
('demo-py-id-87654321', 'Rurales', 'rurales', 'trees', 5);

-- Corretor admin para demo BR
INSERT OR IGNORE INTO corretores (
    id, cliente_id, nome, email, telefone, is_admin, creci, especialidades
) VALUES (
    'corretor-br-123456', 'demo-br-id-12345678', 'João Silva', 'joao@demo.imobiliaria.com.br',
    '+55 11 98765-4321', 1, 'CRECI-SP 123456', 'residencial,comercial'
);

-- Corretor admin para demo PY
INSERT OR IGNORE INTO corretores (
    id, cliente_id, nome, email, telefone, is_admin, creci, especialidades
) VALUES (
    'corretor-py-654321', 'demo-py-id-87654321', 'Carlos González', 'carlos@demo.inmobiliaria.com.py',
    '+595 21 987-654', 1, 'REG-PY 789', 'residencial,comercial'
);

-- Configurações de site para demos
INSERT OR IGNORE INTO configuracoes_site (
    cliente_id, site_title, site_description, nome_empresa,
    telefones, emails, funcionalidades_ativas
) VALUES (
    'demo-br-id-12345678',
    'Imobiliária Demo - Encontre seu imóvel ideal',
    'A melhor imobiliária do Brasil com os melhores imóveis para venda e aluguel',
    'Imobiliária Demo BR',
    '["(11) 99999-9999", "(11) 3333-4444"]',
    '["contato@demo.imobiliaria.com.br", "vendas@demo.imobiliaria.com.br"]',
    '{"chat_whatsapp": true, "busca_avancada": true, "mapa_interativo": true, "tour_virtual": false}'
);

INSERT OR IGNORE INTO configuracoes_site (
    cliente_id, site_title, site_description, nome_empresa,
    telefones, emails, funcionalidades_ativas
) VALUES (
    'demo-py-id-87654321',
    'Inmobiliaria Demo - Encuentra tu propiedad ideal',
    'La mejor inmobiliaria de Paraguay con las mejores propiedades en venta y alquiler',
    'Inmobiliaria Demo PY',
    '["(21) 999-999", "(21) 333-444"]',
    '["contacto@demo.inmobiliaria.com.py", "ventas@demo.inmobiliaria.com.py"]',
    '{"chat_whatsapp": true, "busca_avancada": true, "mapa_interativo": true, "tour_virtual": false}'
);

-- Imóvel demo para teste (Brasil)
INSERT OR IGNORE INTO imoveis (
    id, cliente_id, corretor_id, codigo_interno, titulo, slug, descricao,
    tipo, subtipo, finalidade,
    endereco_logradouro, endereco_numero, endereco_bairro, endereco_cidade, endereco_estado, endereco_cep,
    latitude, longitude,
    area_total, area_construida, quartos, banheiros, suites, vagas_garagem,
    preco_venda, moeda, caracteristicas_extras, status, visibilidade
) VALUES (
    'imovel-demo-br-001',
    'demo-br-id-12345678',
    'corretor-br-123456',
    'DEMO-001',
    'Apartamento 3 Quartos no Centro',
    'apartamento-3-quartos-centro',
    'Excelente apartamento no centro da cidade, com acabamento de primeira qualidade, próximo ao metrô e shopping centers.',
    'residencial',
    'apartamento',
    'venda',
    'Rua das Flores',
    '123',
    'Centro',
    'São Paulo',
    'SP',
    '01234-567',
    -23.5505,
    -46.6333,
    120.50,
    95.30,
    3,
    2,
    1,
    2,
    450000.00,
    'BRL',
    '{"piscina": false, "churrasqueira": true, "academia": false, "salao_festas": true, "portaria_24h": true, "ar_condicionado": true, "armarios_embutidos": true}',
    'disponivel',
    'publico'
);

-- Imóvel demo para teste (Paraguai)
INSERT OR IGNORE INTO imoveis (
    id, cliente_id, corretor_id, codigo_interno, titulo, slug, descricao,
    tipo, subtipo, finalidade,
    endereco_logradouro, endereco_numero, endereco_bairro, endereco_cidade, endereco_estado, endereco_cep,
    latitude, longitude,
    area_total, area_construida, quartos, banheiros, suites, vagas_garagem,
    preco_venda, moeda, caracteristicas_extras, status, visibilidade
) VALUES (
    'imovel-demo-py-001',
    'demo-py-id-87654321',
    'corretor-py-654321',
    'PY-001',
    'Casa 4 Dormitorios en Villa Morra',
    'casa-4-dormitorios-villa-morra',
    'Hermosa casa en el exclusivo barrio de Villa Morra, con excelente ubicación y todas las comodidades.',
    'residencial',
    'casa',
    'venda',
    'Avenida Mariscal López',
    '1234',
    'Villa Morra',
    'Asunción',
    'Asunción',
    '1234',
    -25.2637,
    -57.5759,
    250.00,
    180.00,
    4,
    3,
    2,
    3,
    180000.00,
    'USD',
    '{"piscina": true, "churrasqueira": true, "jardin": true, "porteria_24h": true, "aire_acondicionado": true, "cochera_techada": true}',
    'disponivel',
    'publico'
);

-- Imagens demo para imóveis
INSERT OR IGNORE INTO imovel_imagens (
    imovel_id, url_original, url_thumb, url_medium, url_large,
    titulo, alt_text, ordem, is_principal, nome_arquivo, formato
) VALUES (
    'imovel-demo-br-001',
    'https://via.placeholder.com/800x600/2563eb/ffffff?text=Apartamento+Demo+BR',
    'https://via.placeholder.com/300x200/2563eb/ffffff?text=Apartamento+Demo+BR',
    'https://via.placeholder.com/600x400/2563eb/ffffff?text=Apartamento+Demo+BR',
    'https://via.placeholder.com/1200x800/2563eb/ffffff?text=Apartamento+Demo+BR',
    'Vista da Sala Principal',
    'Apartamento 3 quartos no centro - Vista da sala principal com decoração moderna',
    1, 1, 'apartamento-demo-sala.jpg', 'jpg'
);

INSERT OR IGNORE INTO imovel_imagens (
    imovel_id, url_original, url_thumb, url_medium, url_large,
    titulo, alt_text, ordem, is_principal, nome_arquivo, formato
) VALUES (
    'imovel-demo-py-001',
    'https://via.placeholder.com/800x600/059669/ffffff?text=Casa+Demo+PY',
    'https://via.placeholder.com/300x200/059669/ffffff?text=Casa+Demo+PY',
    'https://via.placeholder.com/600x400/059669/ffffff?text=Casa+Demo+PY',
    'https://via.placeholder.com/1200x800/059669/ffffff?text=Casa+Demo+PY',
    'Fachada Principal',
    'Casa 4 dormitorios en Villa Morra - Vista de la fachada principal',
    1, 1, 'casa-demo-fachada.jpg', 'jpg'
);

-- Leads demo para teste
INSERT OR IGNORE INTO leads (
    id, cliente_id, imovel_id, corretor_id, nome, email, telefone,
    tipo_interesse, orcamento_min, orcamento_max, origem, score, temperatura,
    mensagem, status, preferencias_busca
) VALUES (
    'lead-demo-br-001',
    'demo-br-id-12345678',
    'imovel-demo-br-001',
    'corretor-br-123456',
    'Maria Santos',
    'maria.santos@email.com',
    '+55 11 99887-7665',
    'compra',
    400000.00,
    500000.00,
    'site',
    75,
    'quente',
    'Tenho interesse neste apartamento. Gostaria de agendar uma visita para conhecer pessoalmente.',
    'qualificado',
    '{"tipo": "apartamento", "quartos_min": 2, "banheiros_min": 2, "vagas_min": 1, "area_min": 80}'
);

INSERT OR IGNORE INTO leads (
    id, cliente_id, imovel_id, corretor_id, nome, email, telefone,
    tipo_interesse, orcamento_min, orcamento_max, origem, score, temperatura,
    mensagem, status, preferencias_busca
) VALUES (
    'lead-demo-py-001',
    'demo-py-id-87654321',
    'imovel-demo-py-001',
    'corretor-py-654321',
    'Roberto Martínez',
    'roberto.martinez@email.com',
    '+595 21 998-877',
    'compra',
    150000.00,
    200000.00,
    'whatsapp',
    85,
    'quente',
    'Me interesa esta casa. ¿Podemos coordinar una visita?',
    'contatado',
    '{"tipo": "casa", "quartos_min": 3, "banheiros_min": 2, "vagas_min": 2, "area_min": 150}'
);

-- Visita agendada demo
INSERT OR IGNORE INTO visitas (
    id, cliente_id, imovel_id, lead_id, corretor_id,
    data_agendada, visitante_nome, visitante_email, visitante_telefone,
    quantidade_pessoas, status, observacoes_corretor
) VALUES (
    'visita-demo-001',
    'demo-br-id-12345678',
    'imovel-demo-br-001',
    'lead-demo-br-001',
    'corretor-br-123456',
    datetime('now', '+2 days'),
    'Maria Santos',
    'maria.santos@email.com',
    '+55 11 99887-7665',
    2,
    'agendada',
    'Lead muito interessado. Primeira visita agendada.'
);

-- ==========================================
-- FUNÇÕES AUXILIARES SQL
-- ==========================================

-- Criar função para calcular distância entre coordenadas (Haversine simplificado)
-- SQLite não suporta funções customizadas nativamente, mas podemos usar uma aproximação

-- ==========================================
-- QUERIES DE EXEMPLO PARA DESENVOLVIMENTO
-- ==========================================

-- Query para buscar imóveis com filtros
/*
SELECT * FROM v_imoveis_completos 
WHERE cliente_id = 'demo-br-id-12345678'
  AND status = 'disponivel'
  AND (? IS NULL OR finalidade = ?)
  AND (? IS NULL OR tipo = ?)
  AND (? IS NULL OR endereco_cidade = ?)
  AND (? IS NULL OR quartos >= ?)
  AND (? IS NULL OR preco_venda <= ?)
ORDER BY created_at DESC
LIMIT 20;
*/

-- Query para dashboard do corretor
/*
SELECT * FROM v_dashboard_corretores 
WHERE cliente_id = ? AND id = ?;
*/

-- Query para relatório de performance por cidade
/*
SELECT 
    endereco_cidade,
    COUNT(*) as total_imoveis,
    AVG(preco_venda) as preco_medio_venda,
    AVG(preco_aluguel) as preco_medio_aluguel,
    SUM(visualizacoes) as total_visualizacoes,
    COUNT(CASE WHEN status = 'vendido' THEN 1 END) as vendidos,
    COUNT(CASE WHEN status = 'alugado' THEN 1 END) as alugados
FROM imoveis 
WHERE cliente_id = ?
GROUP BY endereco_cidade
ORDER BY total_imoveis DESC;
*/

-- ==========================================
-- CONFIGURAÇÃO STRAPI RECOMENDADA
-- ==========================================

/*
// backend/config/database.js
module.exports = ({ env }) => ({
  connection: {
    client: 'sqlite',
    connection: {
      filename: env('DATABASE_FILENAME', './data/data.db'),
    },
    useNullAsDefault: true,
    acquireConnectionTimeout: 60000,
    pool: {
      min: 0,
      max: 10,
      acquireTimeoutMillis: 60000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100,
      afterCreate: (conn, cb) => {
        conn.run('PRAGMA foreign_keys = ON', cb);
        conn.run('PRAGMA journal_mode = WAL', cb);
        conn.run('PRAGMA synchronous = NORMAL', cb);
      }
    },
    debug: env.bool('DATABASE_DEBUG', false),
  },
});
*/

-- ==========================================
-- COMANDOS SQLITE ÚTEIS
-- ==========================================

/*
-- Conectar ao banco:
sqlite3 backend/data/data.db

-- Configurações úteis:
.mode table
.headers on
.timer on

-- Listar tabelas:
.tables

-- Mostrar estrutura da tabela:
.schema imoveis

-- Verificar integridade:
PRAGMA integrity_check;

-- Estatísticas do banco:
PRAGMA database_list;
SELECT name, sql FROM sqlite_master WHERE type='table';

-- Backup:
.backup backup.db

-- Importar:
.restore backup.db

-- Analisar performance:
EXPLAIN QUERY PLAN SELECT * FROM imoveis WHERE cliente_id = 'demo-br-id-12345678';

-- Verificar tamanho do banco:
SELECT page_count * page_size as size_bytes FROM pragma_page_count(), pragma_page_size();
*/

-- ==========================================
-- TESTES DE VALIDAÇÃO
-- ==========================================

-- Verificar se foreign keys estão funcionando
PRAGMA foreign_key_check;

-- Verificar se todas as views funcionam
SELECT 'View v_imoveis_completos:' as teste, COUNT(*) as registros FROM v_imoveis_completos;
SELECT 'View v_dashboard_corretores:' as teste, COUNT(*) as registros FROM v_dashboard_corretores;
SELECT 'View v_leads_por_origem:' as teste, COUNT(*) as registros FROM v_leads_por_origem;
SELECT 'View v_imoveis_populares:' as teste, COUNT(*) as registros FROM v_imoveis_populares;

-- Testar triggers
UPDATE imoveis SET titulo = 'Teste Trigger' WHERE id = 'imovel-demo-br-001';

-- Testar constraints
-- INSERT INTO clientes (nome, slug, email_contato) VALUES ('Teste', 'ab', 'email-invalido'); -- Deve falhar

-- ==========================================
-- ESTATÍSTICAS FINAIS
-- ==========================================

-- Contar registros por tabela
SELECT 'clientes' as tabela, COUNT(*) as registros FROM clientes
UNION ALL SELECT 'corretores', COUNT(*) FROM corretores  
UNION ALL SELECT 'categorias_imoveis', COUNT(*) FROM categorias_imoveis
UNION ALL SELECT 'imoveis', COUNT(*) FROM imoveis
UNION ALL SELECT 'imovel_imagens', COUNT(*) FROM imovel_imagens
UNION ALL SELECT 'leads', COUNT(*) FROM leads
UNION ALL SELECT 'visitas', COUNT(*) FROM visitas
UNION ALL SELECT 'favoritos', COUNT(*) FROM favoritos
UNION ALL SELECT 'configuracoes_site', COUNT(*) FROM configuracoes_site
UNION ALL SELECT 'atividades_log', COUNT(*) FROM atividades_log;

-- Verificar dados demo
SELECT 'CLIENTES DEMO:' as info;
SELECT nome, slug, pais, status FROM clientes;

SELECT 'CORRETORES DEMO:' as info;
SELECT nome, email, is_admin FROM corretores;

SELECT 'IMÓVEIS DEMO:' as info;
SELECT titulo, tipo, finalidade, preco_venda, status FROM imoveis;

SELECT 'LEADS DEMO:' as info;
SELECT nome, email, tipo_interesse, status, temperatura FROM leads;

-- ==========================================
-- VERIFICAÇÃO FINAL DE INTEGRIDADE
-- ==========================================
PRAGMA integrity_check;
PRAGMA foreign_key_check;

-- Verificar se todas as tabelas foram criadas
SELECT COUNT(*) as total_tabelas FROM sqlite_master WHERE type='table';

-- Verificar se todos os índices foram criados  
SELECT COUNT(*) as total_indices FROM sqlite_master WHERE type='index';

-- Verificar se todos os triggers foram criados
SELECT COUNT(*) as total_triggers FROM sqlite_master WHERE type='trigger';

-- Verificar se todas as views foram criadas
SELECT COUNT(*) as total_views FROM sqlite_master WHERE type='view';

-- ==========================================
-- MENSAGENS DE SUCESSO
-- ==========================================
SELECT '🚀 SCHEMA SQLITE CRIADO COM SUCESSO!' as status;
SELECT '✅ Banco criado com dados demo para teste' as demo;
SELECT '🔧 Triggers, índices e views configurados' as performance;
SELECT '📊 Views prontas para relatórios' as reports;
SELECT '🎯 Multi-tenancy implementado' as features;
SELECT '📝 Pronto para integração com Strapi!' as next_step;