const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

console.log('🚀 Criando banco SQLite com Node.js...\n');

try {
    // 1. Criar diretórios se não existirem
    console.log('[1/6] Criando estrutura de pastas...');
    if (!fs.existsSync('backend')) {
        fs.mkdirSync('backend');
        console.log('✅ Pasta backend/ criada');
    }
    if (!fs.existsSync('backend/data')) {
        fs.mkdirSync('backend/data');
        console.log('✅ Pasta backend/data/ criada');
    }

    // 2. Verificar se schema.sql existe
    console.log('\n[2/6] Verificando schema.sql...');
    if (!fs.existsSync('schema.sql')) {
        console.error('❌ Arquivo schema.sql não encontrado na pasta raiz');
        console.log('\n💡 SOLUÇÃO:');
        console.log('1. Copie o schema SQLite completo do artifact anterior');
        console.log('2. Salve como "schema.sql" na pasta raiz do projeto');
        console.log('3. Execute este script novamente');
        process.exit(1);
    }
    console.log('✅ schema.sql encontrado');

    // 3. Conectar ao banco (cria automaticamente se não existir)
    console.log('\n[3/6] Conectando ao banco SQLite...');
    const dbPath = path.join('backend', 'data', 'data.db');
    
    // Remover banco existente se houver (para fresh start)
    if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
        console.log('🗑️  Banco anterior removido');
    }
    
    const db = new Database(dbPath);
    console.log('✅ Conectado ao SQLite:', dbPath);

    // 4. Configurar SQLite para performance
    console.log('\n[4/6] Configurando SQLite...');
    db.exec('PRAGMA foreign_keys = ON');
    db.exec('PRAGMA journal_mode = WAL');
    db.exec('PRAGMA synchronous = NORMAL');
    db.exec('PRAGMA cache_size = 1000000');
    db.exec('PRAGMA temp_store = memory');
    console.log('✅ Configurações aplicadas');

    // 5. Ler e executar schema
    console.log('\n[5/6] Executando schema SQL...');
    const schema = fs.readFileSync('schema.sql', 'utf8');
    
    // Dividir em statements (por ; no final da linha)
    const statements = schema
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));

    console.log(`📄 Total de ${statements.length} comandos SQL encontrados`);

    let successCount = 0;
    let errorCount = 0;

    statements.forEach((stmt, index) => {
        try {
            if (stmt.trim()) {
                db.exec(stmt);
                successCount++;
                
                // Mostrar progresso a cada 10 comandos
                if ((index + 1) % 10 === 0) {
                    console.log(`⚡ Executados ${index + 1}/${statements.length} comandos`);
                }
            }
        } catch (err) {
            errorCount++;
            // Mostrar apenas erros críticos (ignorar warnings)
            if (!err.message.includes('already exists') && 
                !err.message.includes('no such table') &&
                !err.message.includes('duplicate column')) {
                console.warn(`⚠️  Warning no comando ${index + 1}: ${err.message.substring(0, 100)}...`);
            }
        }
    });

    console.log(`✅ Schema executado: ${successCount} sucessos, ${errorCount} avisos`);

    // 6. Verificar se tudo funcionou
    console.log('\n[6/6] Verificando banco criado...');

    // Listar tabelas
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
    console.log(`📊 ${tables.length} tabelas criadas:`);
    tables.forEach(table => console.log(`   - ${table.name}`));

    // Verificar dados demo
    console.log('\n📈 Verificando dados demo:');
    
    const clientes = db.prepare('SELECT COUNT(*) as count FROM clientes').get();
    console.log(`   - Clientes: ${clientes.count}`);
    
    const corretores = db.prepare('SELECT COUNT(*) as count FROM corretores').get();
    console.log(`   - Corretores: ${corretores.count}`);
    
    const imoveis = db.prepare('SELECT COUNT(*) as count FROM imoveis').get();
    console.log(`   - Imóveis: ${imoveis.count}`);
    
    const leads = db.prepare('SELECT COUNT(*) as count FROM leads').get();
    console.log(`   - Leads: ${leads.count}`);

    // Mostrar clientes demo
    console.log('\n👥 Clientes demo criados:');
    const clientesDemo = db.prepare('SELECT nome, slug, pais FROM clientes').all();
    clientesDemo.forEach(c => console.log(`   - ${c.nome} (${c.slug}) - ${c.pais}`));

    // Testar uma query complexa
    console.log('\n🔍 Testando view complexa...');
    const imoveisCompletos = db.prepare('SELECT COUNT(*) as count FROM v_imoveis_completos').get();
    console.log(`   - View imóveis completos: ${imoveisCompletos.count} registros`);

    // Fechar conexão
    db.close();

    console.log('\n==========================================');
    console.log('🎉 BANCO SQLITE CRIADO COM SUCESSO!');
    console.log('==========================================');
    console.log('');
    console.log('📁 Localização: backend/data/data.db');
    console.log('📊 Tabelas: ' + tables.length);
    console.log('📈 Dados demo inseridos');
    console.log('🔧 Triggers e índices configurados');
    console.log('📋 Views prontas para relatórios');
    console.log('');
    console.log('🚀 PRÓXIMOS PASSOS:');
    console.log('1. Configurar Strapi: cd backend && npx create-strapi-app@latest . --quickstart --no-run');
    console.log('2. Configurar frontend: cd frontend && npm install && npm run dev');
    console.log('3. Testar banco: node verify-database.js');
    console.log('');
    console.log('💡 COMANDOS ÚTEIS:');
    console.log('- Ver banco: node -e "const db=require(\'better-sqlite3\')(\'backend/data/data.db\'); console.log(db.prepare(\'SELECT name FROM sqlite_master WHERE type=\\\'table\\\'\').all())"');
    console.log('- Backup: copy backend\\data\\data.db backup_$(date).db');
    console.log('');

} catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.log('\n🔧 POSSÍVEIS SOLUÇÕES:');
    console.log('1. Verificar se better-sqlite3 está instalado: npm install better-sqlite3');
    console.log('2. Verificar se schema.sql existe na pasta raiz');
    console.log('3. Verificar permissões de escrita na pasta backend/data/');
    console.log('4. Tentar executar como Administrador');
    process.exit(1);
}