const fs = require('fs');
const path = require('path');

console.log('🚀 Gerando Content Types Strapi automaticamente...\n');

// Definições dos Content Types baseados no nosso schema SQLite
const contentTypes = {
  cliente: {
    kind: 'collectionType',
    collectionName: 'clientes',
    info: {
      singularName: 'cliente',
      pluralName: 'clientes',
      displayName: 'Cliente',
      description: 'Clientes white-label (tenants do sistema)'
    },
    options: {
      draftAndPublish: true,
    },
    pluginOptions: {},
    attributes: {
      nome: {
        type: 'string',
        required: true,
        maxLength: 255
      },
      slug: {
        type: 'uid',
        targetField: 'nome',
        required: true
      },
      email_contato: {
        type: 'email',
        required: true
      },
      telefone: {
        type: 'string',
        maxLength: 20
      },
      configuracao_tema: {
        type: 'json',
        default: {}
      },
      pais: {
        type: 'string',
        default: 'BR',
        maxLength: 2
      },
      idioma_padrao: {
        type: 'string',
        default: 'pt-BR',
        maxLength: 5
      },
      moeda: {
        type: 'string',
        default: 'BRL',
        maxLength: 3
      },
      status: {
        type: 'enumeration',
        enum: ['ativo', 'suspenso', 'cancelado'],
        default: 'ativo'
      },
      plano: {
        type: 'enumeration',
        enum: ['basico', 'premium', 'enterprise'],
        default: 'basico'
      },
      limite_imoveis: {
        type: 'integer',
        default: 100,
        min: 1
      },
      limite_corretores: {
        type: 'integer',
        default: 5,
        min: 1
      },
      // Relacionamentos
      corretores: {
        type: 'relation',
        relation: 'oneToMany',
        target: 'api::corretor.corretor',
        mappedBy: 'cliente'
      },
      imoveis: {
        type: 'relation',
        relation: 'oneToMany',
        target: 'api::imovel.imovel',
        mappedBy: 'cliente'
      },
      leads: {
        type: 'relation',
        relation: 'oneToMany',
        target: 'api::lead.lead',
        mappedBy: 'cliente'
      }
    }
  },

  corretor: {
    kind: 'collectionType',
    collectionName: 'corretores',
    info: {
      singularName: 'corretor',
      pluralName: 'corretores',
      displayName: 'Corretor',
      description: 'Corretores/agentes imobiliários'
    },
    options: {
      draftAndPublish: true,
    },
    attributes: {
      nome: {
        type: 'string',
        required: true,
        maxLength: 255
      },
      email: {
        type: 'email',
        required: true
      },
      telefone: {
        type: 'string',
        maxLength: 20
      },
      celular: {
        type: 'string',
        maxLength: 20
      },
      whatsapp: {
        type: 'string',
        maxLength: 20
      },
      creci: {
        type: 'string',
        maxLength: 20
      },
      cpf_cnpj: {
        type: 'string',
        maxLength: 20
      },
      foto: {
        type: 'media',
        multiple: false,
        required: false,
        allowedTypes: ['images']
      },
      biografia: {
        type: 'text'
      },
      especialidades: {
        type: 'json',
        default: []
      },
      is_admin: {
        type: 'boolean',
        default: false
      },
      is_ativo: {
        type: 'boolean',
        default: true
      },
      pode_cadastrar_imoveis: {
        type: 'boolean',
        default: true
      },
      pode_gerenciar_leads: {
        type: 'boolean',
        default: true
      },
      comissao_personalizada: {
        type: 'decimal',
        min: 0,
        max: 100
      },
      redes_sociais: {
        type: 'json',
        default: {}
      },
      // Relacionamentos
      cliente: {
        type: 'relation',
        relation: 'manyToOne',
        target: 'api::cliente.cliente',
        inversedBy: 'corretores'
      },
      imoveis: {
        type: 'relation',
        relation: 'oneToMany',
        target: 'api::imovel.imovel',
        mappedBy: 'corretor'
      },
      leads: {
        type: 'relation',
        relation: 'oneToMany',
        target: 'api::lead.lead',
        mappedBy: 'corretor'
      }
    }
  },

  imovel: {
    kind: 'collectionType',
    collectionName: 'imoveis',
    info: {
      singularName: 'imovel',
      pluralName: 'imoveis',
      displayName: 'Imóvel',
      description: 'Propriedades/imóveis para venda e aluguel'
    },
    options: {
      draftAndPublish: true,
    },
    attributes: {
      codigo_interno: {
        type: 'string',
        maxLength: 50
      },
      titulo: {
        type: 'string',
        required: true,
        maxLength: 255
      },
      slug: {
        type: 'uid',
        targetField: 'titulo',
        required: true
      },
      descricao: {
        type: 'richtext'
      },
      tipo: {
        type: 'enumeration',
        enum: ['residencial', 'comercial', 'rural', 'terreno', 'lancamento'],
        required: true
      },
      subtipo: {
        type: 'string',
        maxLength: 50
      },
      finalidade: {
        type: 'enumeration',
        enum: ['venda', 'aluguel', 'ambos'],
        required: true
      },
      // Endereço
      endereco_logradouro: {
        type: 'string',
        required: true,
        maxLength: 255
      },
      endereco_numero: {
        type: 'string',
        maxLength: 20
      },
      endereco_complemento: {
        type: 'string',
        maxLength: 100
      },
      endereco_bairro: {
        type: 'string',
        required: true,
        maxLength: 100
      },
      endereco_cidade: {
        type: 'string',
        required: true,
        maxLength: 100
      },
      endereco_estado: {
        type: 'string',
        required: true,
        maxLength: 50
      },
      endereco_cep: {
        type: 'string',
        maxLength: 10
      },
      endereco_pais: {
        type: 'string',
        default: 'BR',
        maxLength: 2
      },
      // Coordenadas
      latitude: {
        type: 'decimal'
      },
      longitude: {
        type: 'decimal'
      },
      // Características
      area_total: {
        type: 'decimal',
        min: 0
      },
      area_construida: {
        type: 'decimal',
        min: 0
      },
      area_terreno: {
        type: 'decimal',
        min: 0
      },
      quartos: {
        type: 'integer',
        default: 0,
        min: 0
      },
      banheiros: {
        type: 'integer',
        default: 0,
        min: 0
      },
      suites: {
        type: 'integer',
        default: 0,
        min: 0
      },
      vagas_garagem: {
        type: 'integer',
        default: 0,
        min: 0
      },
      salas: {
        type: 'integer',
        default: 0,
        min: 0
      },
      andares: {
        type: 'integer',
        default: 1,
        min: 1
      },
      andar: {
        type: 'integer'
      },
      // Características booleanas
      mobiliado: {
        type: 'boolean',
        default: false
      },
      aceita_pets: {
        type: 'boolean',
        default: true
      },
      aceita_financiamento: {
        type: 'boolean',
        default: true
      },
      aceita_fgts: {
        type: 'boolean',
        default: true
      },
      // Características extras
      caracteristicas_extras: {
        type: 'json',
        default: {}
      },
      // Preços
      preco_venda: {
        type: 'decimal',
        min: 0
      },
      preco_aluguel: {
        type: 'decimal',
        min: 0
      },
      preco_condominio: {
        type: 'decimal',
        default: 0,
        min: 0
      },
      preco_iptu: {
        type: 'decimal',
        default: 0,
        min: 0
      },
      valor_escritura: {
        type: 'decimal',
        default: 0,
        min: 0
      },
      moeda: {
        type: 'string',
        default: 'BRL',
        maxLength: 3
      },
      // SEO
      meta_title: {
        type: 'string',
        maxLength: 255
      },
      meta_description: {
        type: 'text'
      },
      palavras_chave: {
        type: 'json',
        default: []
      },
      // Flags
      destaque: {
        type: 'boolean',
        default: false
      },
      exclusivo: {
        type: 'boolean',
        default: false
      },
      oportunidade: {
        type: 'boolean',
        default: false
      },
      // Status
      status: {
        type: 'enumeration',
        enum: ['disponivel', 'reservado', 'vendido', 'alugado', 'inativo', 'manutencao'],
        default: 'disponivel'
      },
      visibilidade: {
        type: 'enumeration',
        enum: ['publico', 'privado', 'rascunho'],
        default: 'publico'
      },
      data_disponibilidade: {
        type: 'date'
      },
      // Estatísticas
      visualizacoes: {
        type: 'integer',
        default: 0,
        min: 0
      },
      // Mídia
      imagens: {
        type: 'media',
        multiple: true,
        required: false,
        allowedTypes: ['images']
      },
      videos: {
        type: 'json',
        default: []
      },
      tour_virtual: {
        type: 'string'
      },
      // Relacionamentos
      cliente: {
        type: 'relation',
        relation: 'manyToOne',
        target: 'api::cliente.cliente',
        inversedBy: 'imoveis'
      },
      corretor: {
        type: 'relation',
        relation: 'manyToOne',
        target: 'api::corretor.corretor',
        inversedBy: 'imoveis'
      },
      leads: {
        type: 'relation',
        relation: 'oneToMany',
        target: 'api::lead.lead',
        mappedBy: 'imovel'
      },
      favoritos: {
        type: 'relation',
        relation: 'oneToMany',
        target: 'api::favorito.favorito',
        mappedBy: 'imovel'
      }
    }
  },

  lead: {
    kind: 'collectionType',
    collectionName: 'leads',
    info: {
      singularName: 'lead',
      pluralName: 'leads',
      displayName: 'Lead',
      description: 'Prospects/leads captados'
    },
    options: {
      draftAndPublish: true,
    },
    attributes: {
      nome: {
        type: 'string',
        required: true,
        maxLength: 255
      },
      email: {
        type: 'email'
      },
      telefone: {
        type: 'string',
        maxLength: 20
      },
      celular: {
        type: 'string',
        maxLength: 20
      },
      whatsapp: {
        type: 'string',
        maxLength: 20
      },
      // Interesse
      tipo_interesse: {
        type: 'enumeration',
        enum: ['compra', 'aluguel', 'venda', 'avaliacao', 'informacao'],
        required: true
      },
      orcamento_min: {
        type: 'decimal',
        min: 0
      },
      orcamento_max: {
        type: 'decimal',
        min: 0
      },
      preferencias_busca: {
        type: 'json',
        default: {}
      },
      mensagem: {
        type: 'text'
      },
      // Origem
      origem: {
        type: 'string',
        default: 'site'
      },
      origem_url: {
        type: 'string'
      },
      origem_detalhes: {
        type: 'json',
        default: {}
      },
      utm_source: {
        type: 'string'
      },
      utm_medium: {
        type: 'string'
      },
      utm_campaign: {
        type: 'string'
      },
      utm_content: {
        type: 'string'
      },
      utm_term: {
        type: 'string'
      },
      // Qualificação
      score: {
        type: 'integer',
        default: 0,
        min: 0,
        max: 100
      },
      temperatura: {
        type: 'enumeration',
        enum: ['frio', 'morno', 'quente'],
        default: 'frio'
      },
      perfil_cliente: {
        type: 'string'
      },
      // Comunicação
      historico_interacoes: {
        type: 'json',
        default: []
      },
      ultima_interacao: {
        type: 'datetime'
      },
      proxima_acao: {
        type: 'datetime'
      },
      // Status
      status: {
        type: 'enumeration',
        enum: ['novo', 'contatado', 'qualificado', 'proposta', 'negociacao', 'fechado', 'perdido'],
        default: 'novo'
      },
      sub_status: {
        type: 'string'
      },
      motivo_perda: {
        type: 'string'
      },
      valor_negociado: {
        type: 'decimal',
        min: 0
      },
      observacoes: {
        type: 'text'
      },
      // Dados técnicos
      ip_address: {
        type: 'string'
      },
      user_agent: {
        type: 'text'
      },
      session_id: {
        type: 'string'
      },
      // Relacionamentos
      cliente: {
        type: 'relation',
        relation: 'manyToOne',
        target: 'api::cliente.cliente',
        inversedBy: 'leads'
      },
      corretor: {
        type: 'relation',
        relation: 'manyToOne',
        target: 'api::corretor.corretor',
        inversedBy: 'leads'
      },
      imovel: {
        type: 'relation',
        relation: 'manyToOne',
        target: 'api::imovel.imovel',
        inversedBy: 'leads'
      }
    }
  }
};

// Função para criar arquivos de Content Types
function createContentTypeFiles() {
  const apiPath = path.join('src', 'api');
  
  if (!fs.existsSync(apiPath)) {
    fs.mkdirSync(apiPath, { recursive: true });
  }

  Object.entries(contentTypes).forEach(([name, schema]) => {
    const contentTypePath = path.join(apiPath, name);
    const contentTypeContentPath = path.join(contentTypePath, 'content-types', name);
    
    // Criar diretórios
    fs.mkdirSync(contentTypeContentPath, { recursive: true });
    
    // Criar schema.json
    const schemaFile = path.join(contentTypeContentPath, 'schema.json');
    fs.writeFileSync(schemaFile, JSON.stringify(schema, null, 2));
    
    console.log(`✅ Content Type criado: ${name}`);
    console.log(`   Arquivo: ${schemaFile}`);
  });
}

// Função para criar arquivos de controllers básicos
function createControllers() {
  Object.keys(contentTypes).forEach(name => {
    const controllerPath = path.join('src', 'api', name, 'controllers');
    fs.mkdirSync(controllerPath, { recursive: true });
    
    const controllerContent = `'use strict';

/**
 * ${name} controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::${name}.${name}');
`;
    
    const controllerFile = path.join(controllerPath, `${name}.js`);
    fs.writeFileSync(controllerFile, controllerContent);
    
    console.log(`✅ Controller criado: ${name}`);
  });
}

// Função para criar routes básicas
function createRoutes() {
  Object.keys(contentTypes).forEach(name => {
    const routesPath = path.join('src', 'api', name, 'routes');
    fs.mkdirSync(routesPath, { recursive: true });
    
    const routesContent = `'use strict';

/**
 * ${name} router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::${name}.${name}');
`;
    
    const routesFile = path.join(routesPath, `${name}.js`);
    fs.writeFileSync(routesFile, routesContent);
    
    console.log(`✅ Routes criadas: ${name}`);
  });
}

// Função para criar services básicos
function createServices() {
  Object.keys(contentTypes).forEach(name => {
    const servicesPath = path.join('src', 'api', name, 'services');
    fs.mkdirSync(servicesPath, { recursive: true });
    
    const serviceContent = `'use strict';

/**
 * ${name} service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::${name}.${name}');
`;
    
    const serviceFile = path.join(servicesPath, `${name}.js`);
    fs.writeFileSync(serviceFile, serviceContent);
    
    console.log(`✅ Service criado: ${name}`);
  });
}

// Executar geração
try {
  console.log('📁 Criando diretórios...');
  createContentTypeFiles();
  
  console.log('\n🎮 Criando controllers...');
  createControllers();
  
  console.log('\n🛣️  Criando routes...');
  createRoutes();
  
  console.log('\n⚙️  Criando services...');
  createServices();
  
  console.log('\n==========================================');
  console.log('🎉 CONTENT TYPES GERADOS COM SUCESSO!');
  console.log('==========================================');
  console.log('');
  console.log('📋 Content Types criados:');
  console.log('   - Cliente (com configurações white-label)');
  console.log('   - Corretor (com permissões granulares)');
  console.log('   - Imóvel (com características completas)');
  console.log('   - Lead (com CRM integrado)');
  console.log('');
  console.log('🚀 PRÓXIMOS PASSOS:');
  console.log('1. Reiniciar Strapi: npm run develop');
  console.log('2. Content Types aparecerão automaticamente');
  console.log('3. Configurar permissões em Settings > Roles');
  console.log('4. Testar APIs em Content Manager');
  console.log('');
  console.log('📡 APIs disponíveis após restart:');
  console.log('   GET  /api/clientes');
  console.log('   POST /api/clientes');
  console.log('   GET  /api/imoveis');
  console.log('   POST /api/leads');
  console.log('   ... e todas as outras');

} catch (error) {
  console.error('❌ Erro ao gerar Content Types:', error.message);
  console.log('\n🔧 SOLUÇÕES:');
  console.log('1. Verificar se está na pasta raiz do Strapi');
  console.log('2. Verificar permissões de escrita');
  console.log('3. Executar como Administrador se necessário');
}