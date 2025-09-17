# Criar arquivo diretamente pelo terminal
echo const Database = require('better-sqlite3'); > simple-db.js
echo const fs = require('fs'); >> simple-db.js
echo. >> simple-db.js
echo console.log('Criando banco SQLite simples...'); >> simple-db.js
echo. >> simple-db.js
echo const dbPath = 'backend/data/data.db'; >> simple-db.js
echo if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath); >> simple-db.js
echo. >> simple-db.js
echo const db = new Database(dbPath); >> simple-db.js
echo console.log('Banco criado'); >> simple-db.js
echo. >> simple-db.js
echo db.exec('CREATE TABLE clientes (id TEXT PRIMARY KEY, nome TEXT, slug TEXT, email TEXT)'); >> simple-db.js
echo db.exec('CREATE TABLE corretores (id TEXT PRIMARY KEY, cliente_id TEXT, nome TEXT, email TEXT)'); >> simple-db.js
echo db.exec('CREATE TABLE imoveis (id TEXT PRIMARY KEY, cliente_id TEXT, titulo TEXT, preco REAL)'); >> simple-db.js
echo db.exec('CREATE TABLE leads (id TEXT PRIMARY KEY, cliente_id TEXT, nome TEXT, email TEXT)'); >> simple-db.js
echo. >> simple-db.js
echo console.log('Tabelas criadas'); >> simple-db.js
echo. >> simple-db.js
echo db.exec("INSERT INTO clientes VALUES ('demo-br', 'Demo BR', 'demo-br', 'test@demo.br')"); >> simple-db.js
echo db.exec("INSERT INTO corretores VALUES ('corr-1', 'demo-br', 'João Silva', 'joao@demo.br')"); >> simple-db.js
echo db.exec("INSERT INTO imoveis VALUES ('imovel-1', 'demo-br', 'Apartamento Centro', 450000)"); >> simple-db.js
echo db.exec("INSERT INTO leads VALUES ('lead-1', 'demo-br', 'Maria Santos', 'maria@email.com')"); >> simple-db.js
echo. >> simple-db.js
echo console.log('Dados inseridos'); >> simple-db.js
echo. >> simple-db.js
echo const clientes = db.prepare('SELECT COUNT(*) as count FROM clientes').get(); >> simple-db.js
echo console.log('Clientes:', clientes.count); >> simple-db.js
echo. >> simple-db.js
echo db.close(); >> simple-db.js
echo console.log('Banco SQLite criado com sucesso!'); >> simple-db.js