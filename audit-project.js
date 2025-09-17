const fs = require('fs');
const path = require('path');

console.log('🔍 AUDITORIA COMPLETA - PROJETO IMOBILIÁRIO WHITE-LABEL\n');

// Função para verificar se arquivo/pasta existe
const exists = (filepath) => fs.existsSync(filepath);

// Função para ler arquivo JSON
const readJSON = (filepath) => {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (error) {
    return null;
  }
};

// Função para listar arquivos em diretório
const listFiles = (dir) => {
  try {
    return fs.readdirSync(dir).filter(file => !file.startsWith('.'));
  } catch (error) {
    return [];
  }
};

// Verificar estrutura geral do projeto
console.log('📁 ESTRUTURA DO PROJETO:');
console.log('==========================================');

const projectStructure = {
  'frontend/': exists('frontend'),
  'strapi-backend/': exists('strapi-backend'),
  'backend/': exists('backend'),
  'package.json': exists('package.json'),
  'README.md': exists('README.md')
};

Object.entries(projectStructure).forEach(([item, status]) => {
  console.log(`${status ? '✅' : '❌'} ${item}`);
});

// Auditoria do Backend (Strapi)
console.log('\n🔧 STRAPI BACKEND:');
console.log('==========================================');

if (exists('strapi-backend')) {
  const strapiFiles = {
    'package.json': exists('strapi-backend/package.json'),
    'data/data.db': exists('strapi-backend/data/data.db'),
    'config/database.js': exists('strapi-backend/config/database.js'),
    'config/server.ts': exists('strapi-backend/config/server.ts'),
    '.env': exists('strapi-backend/.env'),
    'src/api/': exists('strapi-backend/src/api')
  };

  Object.entries(strapiFiles).forEach(([file, status]) => {
    console.log(`${status ? '✅' : '❌'} ${file}`);
  });

  // Verificar Content Types
  if (exists('strapi-backend/src/api')) {
    const contentTypes = listFiles('strapi-backend/src/api');
    console.log(`\n📊 Content Types criados: ${contentTypes.length}`);
    contentTypes.forEach(ct => console.log(`   - ${ct}`));
  }

  // Verificar dependências
  const strapiPackage = readJSON('strapi-backend/package.json');
  if (strapiPackage) {
    console.log(`\n📦 Dependências principais:`);
    const key_deps = ['@strapi/strapi', 'better-sqlite3', '@strapi/plugin-users-permissions'];
    key_deps.forEach(dep => {
      const version = strapiPackage.dependencies?.[dep];
      console.log(`   ${version ? '✅' : '❌'} ${dep} ${version || 'não instalado'}`);
    });
  }

  // Verificar banco SQLite
  if (exists('strapi-backend/data/data.db')) {
    const stats = fs.statSync('strapi-backend/data/data.db');
    console.log(`\n💾 Banco SQLite: ${stats.size} bytes (${(stats.size/1024).toFixed(1)}KB)`);
  }
}

// Auditoria do Frontend
console.log('\n🎨 FRONTEND (NEXT.JS):');
console.log('==========================================');

if (exists('frontend')) {
  const frontendFiles = {
    'package.json': exists('frontend/package.json'),
    'next.config.js': exists('frontend/next.config.js'),
    'pages/': exists('frontend/pages'),
    'components/': exists('frontend/components'),
    'lib/': exists('frontend/lib'),
    'styles/': exists('frontend/styles')
  };

  Object.entries(frontendFiles).forEach(([file, status]) => {
    console.log(`${status ? '✅' : '❌'} ${file}`);
  });

  const frontendPackage = readJSON('frontend/package.json');
  if (frontendPackage) {
    console.log(`\n📦 Dependências chave:`);
    const key_deps = ['next', 'react', 'react-dom', 'axios'];
    key_deps.forEach(dep => {
      const version = frontendPackage.dependencies?.[dep];
      console.log(`   ${version ? '✅' : '❌'} ${dep} ${version || 'não instalado'}`);
    });
  }
} else {
  console.log('❌ Pasta frontend não encontrada');
}

// Verificar configurações
console.log('\n⚙️  CONFIGURAÇÕES:');
console.log('==========================================');

// Verificar .env do Strapi
if (exists('strapi-backend/.env')) {
  const envContent = fs.readFileSync('strapi-backend/.env', 'utf8');
  const requiredVars = ['DATABASE_FILENAME', 'JWT_SECRET', 'APP_KEYS'];
  
  requiredVars.forEach(variable => {
    const hasVar = envContent.includes(variable);
    console.log(`${hasVar ? '✅' : '❌'} ${variable}`);
  });
}

// Testar conectividade (se Strapi estiver rodando)
console.log('\n🌐 CONECTIVIDADE:');
console.log('==========================================');

const testEndpoints = async () => {
  const endpoints = [
    'http://localhost:1337',
    'http://localhost:1337/admin',
    'http://localhost:1337/api/clientes',
    'http://localhost:3000' // Frontend
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      console.log(`${response.ok ? '✅' : '❌'} ${endpoint} (${response.status})`);
    } catch (error) {
      console.log(`❌ ${endpoint} (offline/erro)`);
    }
  }
};

// Análise de melhorias
console.log('\n💡 ANÁLISE DE MELHORIAS:');
console.log('==========================================');

const improvements = [];

// Verificar se há testes
if (!exists('strapi-backend/tests') && !exists('frontend/__tests__')) {
  improvements.push('Adicionar testes unitários e de integração');
}

// Verificar documentação
if (!exists('README.md') || fs.readFileSync('README.md', 'utf8').length < 1000) {
  improvements.push('Melhorar documentação do projeto');
}

// Verificar TypeScript
const frontendPackage = readJSON('frontend/package.json');
if (frontendPackage && !frontendPackage.dependencies?.typescript) {
  improvements.push('Migrar frontend para TypeScript');
}

// Verificar Docker
if (!exists('docker-compose.yml') && !exists('Dockerfile')) {
  improvements.push('Adicionar containerização com Docker');
}

// Verificar CI/CD
if (!exists('.github/workflows')) {
  improvements.push('Configurar CI/CD (GitHub Actions)');
}

// Verificar segurança
if (exists('strapi-backend/.env')) {
  const envContent = fs.readFileSync('strapi-backend/.env', 'utf8');
  if (envContent.includes('123456') || envContent.includes('secret')) {
    improvements.push('Melhorar chaves de segurança (.env)');
  }
}

// Verificar performance
if (!exists('strapi-backend/config/middlewares.ts')) {
  improvements.push('Configurar middlewares de performance');
}

// Verificar monitoramento
improvements.push('Adicionar logging e monitoramento');
improvements.push('Configurar backup automático do banco');
improvements.push('Implementar cache Redis para performance');

console.log('🔧 MELHORIAS RECOMENDADAS:');
improvements.forEach((improvement, index) => {
  console.log(`${index + 1}. ${improvement}`);
});

// Scripts de teste sugeridos
console.log('\n🧪 SCRIPTS DE TESTE SUGERIDOS:');
console.log('==========================================');

const testScripts = [
  'npm run test -- Backend: rodar testes unitários',
  'npm run test:e2e -- Testes end-to-end',
  'npm run lint -- Verificar qualidade do código',
  'npm run audit -- Verificar vulnerabilidades',
  'npm run build -- Testar build de produção'
];

testScripts.forEach(script => console.log(`• ${script}`));

// Métricas do projeto
console.log('\n📊 MÉTRICAS DO PROJETO:');
console.log('==========================================');

const calculateMetrics = () => {
  let totalFiles = 0;
  let totalLines = 0;

  const countFilesInDir = (dir) => {
    try {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      files.forEach(file => {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
          countFilesInDir(fullPath);
        } else if (file.isFile() && (file.name.endsWith('.js') || file.name.endsWith('.ts') || file.name.endsWith('.jsx') || file.name.endsWith('.tsx'))) {
          totalFiles++;
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            totalLines += content.split('\n').length;
          } catch (e) {}
        }
      });
    } catch (e) {}
  };

  ['strapi-backend/src', 'frontend'].forEach(dir => {
    if (exists(dir)) countFilesInDir(dir);
  });

  console.log(`📄 Arquivos de código: ${totalFiles}`);
  console.log(`📏 Linhas de código: ${totalLines}`);
  console.log(`⏱️  Tempo estimado desenvolvimento: ${Math.round(totalLines / 50)} horas`);
};

calculateMetrics();

// Roadmap sugerido
console.log('\n🗺️  ROADMAP SUGERIDO:');
console.log('==========================================');

const roadmap = [
  'FASE 1 - Finalizar Backend (1-2 dias)',
  '  • Testar todas as APIs',
  '  • Configurar permissões',
  '  • Adicionar dados demo completos',
  '',
  'FASE 2 - Frontend Básico (3-5 dias)',
  '  • Lista de imóveis',
  '  • Formulário de leads',
  '  • Integração com Strapi',
  '',
  'FASE 3 - Multi-tenancy (2-3 dias)',
  '  • Sistema de subdomínios',
  '  • Temas personalizáveis',
  '  • Isolamento de dados',
  '',
  'FASE 4 - Funcionalidades Avançadas (5-7 dias)',
  '  • Upload de imagens',
  '  • Busca avançada',
  '  • Dashboard analytics',
  '',
  'FASE 5 - Deploy e Produção (2-3 dias)',
  '  • Configurar servidor',
  '  • SSL e domínio',
  '  • Backup e monitoramento'
];

roadmap.forEach(item => console.log(item));

console.log('\n==========================================');
console.log('✅ AUDITORIA COMPLETA FINALIZADA');
console.log('==========================================');

// Testar conectividade se estiver online
if (typeof fetch !== 'undefined') {
  testEndpoints().catch(() => {
    console.log('⚠️  Teste de conectividade falhou - Strapi pode estar offline');
  });
}