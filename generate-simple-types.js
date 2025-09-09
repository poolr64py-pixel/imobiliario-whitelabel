const fs = require('fs');
const path = require('path');

console.log('🚀 Gerando Content Types Strapi - Versão Simplificada...\n');

// Content Types simplificados sem relações circulares
const contentTypes = {
  cliente: {
    kind: 'collectionType',
    collectionName: 'clientes',
    info: {
      singularName: 'cliente',
      pluralName: 'clientes',
      displayName: 'Cliente',
      description: 'Clientes white-label'
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
      configuracao_tema: {
        type: 'json',
        default: {}
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
      description: 'Corretores/agentes'
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
      is_admin: {
        type: 'boolean',
        default: false
      },
      is_ativo: {
        type: 'boolean',
        default: true
      },
      biografia: {
        type: 'text'
      },
      foto: {
        type: 'media',
        multiple: false,
        allowedTypes: ['images']
      },
      // Relação simples com cliente
      cliente: {
        type: 'relation',
        relation: 'manyToOne',
        target: 'api::cliente.cliente'
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
      description: 'Propriedades para venda/aluguel'
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
        enum: ['residencial', 'comercial', 'rural', 'terreno'],
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
      // Coordenadas
      latitude: {
        type: 'decimal'
      },
      longitude: {
        type: 'decimal'
      },
      // Características básicas
      area_total: {
        type: 'decimal',
        min: 0
      },
      area_construida: {
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
      moeda: {
        type: 'string',
        default: 'BRL',
        maxLength: 3
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
      // Status
      status: {
        type: 'enumeration',
        enum: ['disponivel', 'reservado', 'vendido', 'alugado', 'inativo'],
        default: 'disponivel'
      },
      visibilidade: {
        type: 'enumeration',
        enum: ['publico', 'privado', 'rascunho'],
        default: 'publico'
      },
      // Mídia
      imagens: {
        type: 'media',
        multiple: true,
        allowedTypes: ['images']
      },
      // SEO básico
      meta_title: {
        type: 'string',
        maxLength: 255
      },
      meta_description: {
        type: 'text'
      },
      // Relações básicas
      cliente: {
        type: 'relation',
        relation: 'manyToOne',
        target: 'api::cliente.cliente'
      },
      corretor: {
        type: 'relation',
        relation: 'manyToOne',
        target: 'api::corretor.corretor'
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
      description: 'Prospects captados'
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
      mensagem: {
        type: 'text'
      },
      // Origem
      origem: {
        type: 'string',
        default: 'site'
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
      // Status
      status: {
        type: 'enumeration',
        enum: ['novo', 'contatado', 'qualificado', 'negociacao', 'fechado', 'perdido'],
        default: 'novo'
      },
      observacoes: {
        type: 'text'
      },
      // Relações básicas
      cliente: {
        type: 'relation',
        relation: 'manyToOne',
        target: 'api::cliente.cliente'
      },
      corretor: {
        type: 'relation',
        relation: 'manyToOne',
        target: 'api::corretor.corretor'
      },
      imovel: {
        type: 'relation',
        relation: 'manyToOne',
        target: 'api::imovel.imovel'
      }
    }
  }
};

// Funções para criar arquivos (mesmo código anterior)
function createContentTypeFiles() {
  const apiPath = path.join('src', 'api');
  
  if (!fs.existsSync(apiPath)) {
    fs.mkdirSync(apiPath, { recursive: true });
  }

  Object.entries(contentTypes).forEach(([name, schema]) => {
    const contentTypePath = path.join(apiPath, name);
    const contentTypeContentPath = path.join(contentTypePath, 'content-types', name);
    
    fs.mkdirSync(contentTypeContentPath, { recursive: true });
    
    const schemaFile = path.join(contentTypeContentPath, 'schema.json');
    fs.writeFileSync(schemaFile, JSON.stringify(schema, null, 2));
    
    console.log(`✅ Content Type criado: ${name}`);
  });
}

function createControllers() {
  Object.keys(contentTypes).forEach(name => {
    const controllerPath = path.join('src', 'api', name, 'controllers');
    fs.mkdirSync(controllerPath, { recursive: true });
    
    const controllerContent = `'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::${name}.${name}');
`;
    
    const controllerFile = path.join(controllerPath, `${name}.js`);
    fs.writeFileSync(controllerFile, controllerContent);
  });
}

function createRoutes() {
  Object.keys(contentTypes).forEach(name => {
    const routesPath = path.join('src', 'api', name, 'routes');
    fs.mkdirSync(routesPath, { recursive: true });
    
    const routesContent = `'use strict';

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::${name}.${name}');
`;
    
    const routesFile = path.join(routesPath, `${name}.js`);
    fs.writeFileSync(routesFile, routesContent);
  });
}

function createServices() {
  Object.keys(contentTypes).forEach(name => {
    const servicesPath = path.join('src', 'api', name, 'services');
    fs.mkdirSync(servicesPath, { recursive: true });
    
    const serviceContent = `'use strict';

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::${name}.${name}');
`;
    
    const serviceFile = path.join(servicesPath, `${name}.js`);
    fs.writeFileSync(serviceFile, serviceContent);
  });
}

// Executar
try {
  createContentTypeFiles();
  createControllers();
  createRoutes();
  createServices();
  
  console.log('\n==========================================');
  console.log('🎉 CONTENT TYPES SIMPLIFICADOS CRIADOS!');
  console.log('==========================================');
  console.log('✅ Cliente - Gerenciamento de tenants');
  console.log('✅ Corretor - Agentes por cliente');
  console.log('✅ Imóvel - Propriedades completas');
  console.log('✅ Lead - CRM de prospects');
  console.log('\n🚀 Reinicie Strapi: npm run develop');

} catch (error) {
  console.error('❌ Erro:', error.message);
}