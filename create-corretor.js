const fs = require('fs');
const path = require('path');

const corretorSchema = {
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
    }
  }
};

function createContentType(name, schema) {
  const contentTypePath = path.join('src', 'api', name);
  fs.mkdirSync(contentTypePath, { recursive: true });
  
  const directories = ['content-types', 'controllers', 'routes', 'services'];
  directories.forEach(dir => {
    fs.mkdirSync(path.join(contentTypePath, dir), { recursive: true });
  });

  // Schema
  const schemaDir = path.join(contentTypePath, 'content-types', name);
  fs.mkdirSync(schemaDir, { recursive: true });
  fs.writeFileSync(path.join(schemaDir, 'schema.json'), JSON.stringify(schema, null, 2));

  // Controller
  fs.writeFileSync(path.join(contentTypePath, 'controllers', `${name}.js`), 
    `'use strict';\nconst { createCoreController } = require('@strapi/strapi').factories;\nmodule.exports = createCoreController('api::${name}.${name}');`);

  // Route
  fs.writeFileSync(path.join(contentTypePath, 'routes', `${name}.js`), 
    `'use strict';\nconst { createCoreRouter } = require('@strapi/strapi').factories;\nmodule.exports = createCoreRouter('api::${name}.${name}');`);

  // Service
  fs.writeFileSync(path.join(contentTypePath, 'services', `${name}.js`), 
    `'use strict';\nconst { createCoreService } = require('@strapi/strapi').factories;\nmodule.exports = createCoreService('api::${name}.${name}');`);

  console.log(`✅ Content Type ${name} criado!`);
}

createContentType('corretor', corretorSchema);