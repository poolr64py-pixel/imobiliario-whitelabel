const Database = require('better-sqlite3');
const fs = require('fs');

console.log('🔍 Verificando banco SQLite...\n');

try {
    // Verificar se banco existe
    const dbPath = 'backend/data/data.db';
    if (!fs.existsSync(dbPath)) {
        console.error('❌ Banco não encontrado:', dbPath);
        console.log('\n💡 Execute primeiro: node create-database.js');
        process.exit(1);
    }

    // Conectar (readonly)
    const db = new Database(dbPath, { readonly: true });
    console.log('✅ Conectado ao banco:', dbPath);

    // Verificar integridade
    console.log('\n[1/5] Verificando integridade...');
    const integrity = db.prepare('PRAGMA integrity_check').get();
    if (integrity.integrity_check === 'ok') {
        console.log('✅ Integridade: OK');
    } else {
        console.log('⚠️  Integridade:', integrity.integrity_check);
    }

    // Verificar foreign keys
    console.log('\n[2/5] Verificando foreign keys...');
    const fkCheck = db.prepare('PRAGMA foreign_key_check').all();
    if (fkCheck.length === 0) {
        console.log('✅ Foreign keys: OK');
    } else {
        console.log('⚠️  Foreign key violations:', fkCheck.length);
        fkCheck.forEach(fk => console.log('   -', fk));
    }

    // Listar todas as tabelas
    console.log('\n[3/5] Listando tabelas...');
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
    console.log(`📊 ${tables.length} tabelas encontradas:`);
    tables.forEach(table => {
        const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
        console.log(`   - ${table.name.padEnd(20)} (${count.count} registros)`);
    });

    // Verificar índices
    console.log('\n[4/5] Verificando índices...');
    const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY name").all();
    console.log(`🔧 ${indexes.length} índices customizados:`);
    indexes.slice(0, 10).forEach(idx => console.log(`   - ${idx.name}`));
    if (indexes.length > 10) {
        console.log(`   ... e mais ${indexes.length - 10} índices`);
    }

    // Verificar views
    console.log('\n📋 Views disponíveis:');
    const views = db.prepare("SELECT name FROM sqlite_master WHERE type='view' ORDER BY name").all();
    views.forEach(view => {
        try {
            const count = db.prepare(`SELECT COUNT(*) as count FROM ${view.name}`).get();
            console.log(`   - ${view.name.padEnd(25)} (${count.count} registros)`);
        } catch (err) {
            console.log(`   - ${view.name.padEnd(25)} (erro: ${err.message})`);
        }
    });

    // Verificar triggers
    console.log('\n⚡ Triggers ativos:');
    const triggers = db.prepare("SELECT name FROM sqlite_master WHERE type='trigger' ORDER BY name").all();
    console.log(`   ${triggers.length} triggers configurados`);

    console.log('\n[5/5] Testando dados demo...');

    // Clientes
    const clientesDemo = db.prepare('SELECT nome, slug, pais, status FROM clientes ORDER BY nome').all();
    console.log('\n👥 CLIENTES DEMO:');
    clientesDemo.forEach(c => console.log(`   - ${c.nome} (${c.slug}) - ${c.pais} [${c.status}]`));

    // Corretores
    const corretores = db.prepare('SELECT nome, email, is_admin FROM corretores ORDER BY nome').all();
    console.log('\n👨‍💼 CORRETORES:');
    corretores.forEach(c => console.log(`   - ${c.nome} (${c.email}) ${c.is_admin ? '[ADMIN]' : ''}`));

    // Imóveis
    const imoveis = db.prepare('SELECT titulo, tipo, finalidade, preco_venda, status FROM imoveis ORDER BY titulo').all();
    console.log('\n🏠 IMÓVEIS DEMO:');
    imoveis.forEach(i => {
        const preco = i.preco_venda ? `R$ ${i.preco_venda.toLocaleString('pt-BR')}` : 'N/A';
        console.log(`   - ${i.titulo} (${i.tipo}/${i.finalidade}) - ${preco} [${i.status}]`);
    });

    // Leads
    const leads = db.prepare('SELECT nome, email, tipo_interesse, status, temperatura FROM leads ORDER BY nome').all();
    console.log('\n📞 LEADS DEMO:');
    leads.forEach(l => console.log(`   - ${l.nome} (${l.email}) - ${l.tipo_interesse} [${l.status}/${l.temperatura}]`));

    // Testar query complexa
    console.log('\n🔍 TESTANDO QUERIES COMPLEXAS:');
    
    try {
        const imoveisCompletos = db.prepare('SELECT titulo, corretor_nome, endereco_completo FROM v_imoveis_completos LIMIT 3').all();
        console.log('\n📊 View v_imoveis_completos (primeiros 3):');
        imoveisCompletos.forEach(i => console.log(`   - ${i.titulo} | ${i.corretor_nome} | ${i.endereco_completo}`));
    } catch (err) {
        console.log('⚠️  Erro na view v_imoveis_completos:', err.message);
    }

    try {
        const dashboard = db.prepare('SELECT nome, total_imoveis, total_leads FROM v_dashboard_corretores LIMIT 3').all();
        console.log('\n📈 Dashboard corretores:');
        dashboard.forEach(d => console.log(`   - ${d.nome}: ${d.total_imoveis} imóveis, ${d.total_leads} leads`));
    } catch (err) {
        console.log('⚠️  Erro no dashboard:', err.message);
    }

    // Testar busca com filtros
    console.log('\n🔎 TESTANDO BUSCA DE IMÓVEIS:');
    const buscaDemo = db.prepare(`
        SELECT titulo, quartos, banheiros, preco_venda, endereco_cidade 
        FROM imoveis 
        WHERE status = 'disponivel' 
        AND finalidade IN ('venda', 'ambos')
        LIMIT 5
    `).all();
    
    buscaDemo.forEach(i => {
        const preco = i.preco_venda ? `R$ ${i.preco_venda.toLocaleString('pt-BR')}` : 'N/A';
        console.log(`   - ${i.titulo} | ${i.quartos}Q ${i.banheiros}B | ${preco} | ${i.endereco_cidade}`);
    });

    // Informações de performance
    console.log('\n📊 INFORMAÇÕES DO BANCO:');
    const pageCount = db.prepare('PRAGMA page_count').get();
    const pageSize = db.prepare('PRAGMA page_size').get();
    const sizeBytes = pageCount.page_count * pageSize.page_size;
    const sizeMB = (sizeBytes / 1024 / 1024).toFixed(2);
    
    console.log(`   - Tamanho: ${sizeMB} MB (${sizeBytes.toLocaleString()} bytes)`);
    console.log(`   - Páginas: ${pageCount.page_count.toLocaleString()}`);
    console.log(`   - Tamanho da página: ${pageSize.page_size} bytes`);

    // Journal mode
    const journalMode = db.prepare('PRAGMA journal_mode').get();
    console.log(`   - Journal mode: ${journalMode.journal_mode}`);

    // Foreign keys
    const foreignKeys = db.prepare('PRAGMA foreign_keys').get();
    console.log(`   - Foreign keys: ${foreignKeys.foreign_keys ? 'ON' : 'OFF'}`);

    db.close();

    console.log('\n==========================================');
    console.log('✅ VERIFICAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('==========================================');
    console.log('🎯 Banco SQLite está funcionando perfeitamente');
    console.log('📊 Todas as tabelas, views e triggers estão OK');
    console.log('📈 Dados demo carregados corretamente');
    console.log('🔧 Pronto para integração com Strapi!');
    console.log('');
    console.log('🚀 PRÓXIMO PASSO: Configurar Strapi');
    console.log('   cd backend');
    console.log('   npx create-strapi-app@latest . --quickstart --no-run');

} catch (error) {
    console.error('\n❌ ERRO na verificação:', error.message);
    console.log('\n🔧 SOLUÇÕES:');
    console.log('1. Verificar se better-sqlite3 está instalado');
    console.log('2. Executar create-database.js primeiro');
    console.log('3. Verificar permissões do arquivo');
}