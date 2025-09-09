// generate-simple-content-types.js
const fs = require('fs');
const path = require('path');

// Definir os Content Types de forma simples
const contentTypes = {
  corretor: {
    kind: 'collectionType',
    collectionName: 'corretores',
    info: {
      singularName: 'corretor',
      pluralName: 'corretores',
      displayName: 'Corretor'
    },
    options: {
      draftAndPublish: true
    },
    pluginOptions: {},
    attributes: {
      nome: {
        type: 'string',
        required: true
      },
      email: {
        type: 'email',
        required: true
      },
      telefone: {
        type: 'string'
      },
      especialidade: {
        type: 'string'
      },
      ativo: {
        type: 'boolean',
        default: true
      }
    }
  },
  
  imovel: {
    kind: 'collectionType',
    collectionName: 'imoveis',
    info: {
      singularName: 'imovel',
      pluralName: 'imoveis',
      displayName: 'Imóvel'
    },
    options: {
      draftAndPublish: true
    },
    pluginOptions: {},
    attributes: {
      titulo: {
        type: 'string',
        required: true
      },
      tipo: {
        type: 'enumeration',
        enum: ['casa', 'apartamento', 'terreno', 'comercial'],
        default: 'casa'
      },
      valor: {
        type: 'biginteger',
        required: true
      },
      area: {
        type: 'decimal'
      },
      quartos: {
        type: 'integer'
      },
      banheiros: {
        type: 'integer'
      },
      cidade: {
        type: 'string',
        required: true
      },
      estado: {
        type: 'string',
        required: true
      },
      endereco: {
        type: 'string'
      },
      descricao: {
        type: 'richtext'
      },
      ativo: {
        type: 'boolean',
        default: true
      }
    }
  },

  lead: {
    kind: 'collectionType',
    collectionName: 'leads',
    info: {
      singularName: 'lead',
      pluralName: 'leads',
      displayName: 'Lead'
    },
    options: {
      draftAndPublish: true
    },
    pluginOptions: {},
    attributes: {
      nome: {
        type: 'string',
        required: true
      },
      email: {
        type: 'email',
        required: true
      },
      telefone: {
        type: 'string'
      },
      mensagem: {
        type: 'text'
      },
      origem: {
        type: 'enumeration',
        enum: ['site', 'whatsapp', 'telefone', 'email'],
        default: 'site'
      },
      status: {
        type: 'enumeration',
        enum: ['novo', 'contato', 'convertido', 'perdido'],
        default: 'novo'
      }
    }
  }
};

// Função para criar os diretórios e arquivos
function createContentType(name, schema) {
  const contentTypePath = path.join('src', 'api', name);
  
  // Criar diretório principal
  if (!fs.existsSync(contentTypePath)) {
    fs.mkdirSync(contentTypePath, { recursive: true });
  }

  // Criar subdiretórios
  const directories = ['content-types', 'controllers', 'routes', 'services'];
  directories.forEach(dir => {
    const dirPath = path.join(contentTypePath, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });

  // Criar schema.json
  const schemaPath = path.join(contentTypePath, 'content-types', name, 'schema.json');
  const schemaDir = path.dirname(schemaPath);
  if (!fs.existsSync(schemaDir)) {
    fs.mkdirSync(schemaDir, { recursive: true });
  }
  fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));

  // Criar controller
  const controllerPath = path.join(contentTypePath, 'controllers', `${name}.js`);
  const controllerContent = `'use strict';

/**
 * ${name} controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::${name}.${name}');
`;
  fs.writeFileSync(controllerPath, controllerContent);

  // Criar route
  const routePath = path.join(contentTypePath, 'routes', `${name}.js`);
  const routeContent = `'use strict';

/**
 * ${name} router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::${name}.${name}');
`;
  fs.writeFileSync(routePath, routeContent);

  // Criar service
  const servicePath = path.join(contentTypePath, 'services', `${name}.js`);
  const serviceContent = `'use strict';

/**
 * ${name} service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::${name}.${name}');
`;
  fs.writeFileSync(servicePath, serviceContent);

  console.log(`✅ Content Type ${name} criado com sucesso!`);
}

// Executar criação dos Content Types
console.log('🚀 Criando Content Types...');

Object.entries(contentTypes).forEach(([name, schema]) => {
  createContentType(name, schema);
});

console.log('✨ Todos os Content Types foram criados!');
console.log('📝 Execute "npm run develop" para reiniciar o Strapi');