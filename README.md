# Plataforma Imobiliária White-Label

Sistema imobiliário multi-tenant com internacionalização completa, desenvolvido com Next.js 14, TypeScript e Prisma.

## Características Implementadas

### Internacionalização (i18n)
- **4 idiomas suportados**: Português (Brasil), Espanhol (Paraguai), Guarani (Paraguai), Inglês (EUA)
- **Roteamento automático**: `/pt-BR`, `/es-PY`, `/gn-PY`, `/en-US`
- **Middleware configurado** para redirecionamento por locale
- **Traduções organizadas** por namespace (common, hero, stats)

### Multi-tenancy
- **Isolamento por tenant** com configurações independentes
- **Temas customizáveis** (cores, logos, CSS)
- **Configurações por inquilino** (idioma padrão, moeda, plano)

### Dashboard Administrativo
- **Interface integrada** em `/[locale]/admin`
- **Visualização do banco** com estrutura das tabelas
- **Navegação por tabs** (Tenants, Imóveis, Leads, Corretores, Usuários)
- **Integração com Prisma Studio**

## Stack Tecnológica

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Prisma** - ORM para banco de dados
- **SQLite** - Banco de dados (desenvolvimento)
- **next-intl** - Sistema de internacionalização
- **Tailwind CSS** - Framework CSS
- **Heroicons** - Ícones

## Instalação

```bash
# Clone o repositório
git clone [URL_DO_REPOSITORIO]
cd imobiliario-whitelabel

# Instale as dependências
npm install

# Configure o banco
npx prisma db push

# Inicie o servidor
npm run dev
```

## Estrutura do Projeto

```
src/
├── app/
│   ├── [locale]/           # Rotas internacionalizadas
│   │   ├── admin/         # Dashboard administrativo
│   │   ├── layout.tsx     # Layout com i18n
│   │   └── page.tsx       # Página inicial
│   ├── globals.css
│   └── layout.tsx         # Layout raiz
├── components/
│   ├── layout/
│   │   └── Header.tsx     # Cabeçalho com troca de idiomas
│   └── providers/
│       └── TenantProvider.tsx # Context de tenant
├── lib/
│   └── routing.ts         # Configuração de rotas i18n
├── messages/              # Arquivos de tradução
│   ├── pt-BR.json
│   ├── en-US.json
│   ├── es-PY.json
│   └── gn-PY.json
├── i18n.ts               # Configuração do next-intl
└── middleware.ts         # Middleware de roteamento

prisma/
├── schema.prisma         # Schema do banco
└── seed.ts              # Dados de exemplo
```

## Banco de Dados

### Modelos Principais

- **Tenant** - Inquilinos da plataforma
- **Usuario** - Usuários do sistema
- **Corretor** - Corretores imobiliários
- **Imovel** - Propriedades imobiliárias
- **Lead** - Leads de vendas
- **TemaConfig** - Configurações de tema

### Comandos Úteis

```bash
# Visualizar/editar dados
npx prisma studio

# Reset do banco
npx prisma migrate reset

# Popular com dados de exemplo
npx prisma db seed
```

## Rotas Disponíveis

- `/` - Redireciona para `/pt-BR`
- `/pt-BR` - Página inicial em português
- `/en-US` - Página inicial em inglês
- `/es-PY` - Página inicial em espanhol
- `/gn-PY` - Página inicial em guarani
- `/[locale]/admin` - Dashboard administrativo

## Configuração de Idiomas

### Adicionar Novo Idioma

1. Criar arquivo em `messages/[locale].json`
2. Adicionar locale em `src/lib/routing.ts`
3. Atualizar matcher no `middleware.ts`
4. Adicionar bandeira no componente Header

### Estrutura de Tradução

```json
{
  "common": {
    "home": "Início",
    "properties": "Imóveis",
    "about": "Sobre",
    "contact": "Contato"
  },
  "hero": {
    "title": "Encontre o imóvel dos seus sonhos",
    "subtitle": "A melhor seleção de imóveis da região"
  }
}
```

## Sistema Multi-tenant

O sistema detecta automaticamente o tenant através de:
- Subdomínio
- Domínio customizado
- Configuração no banco de dados

Cada tenant possui:
- Configurações independentes
- Tema personalizado
- Dados isolados
- Idioma padrão

## Próximos Passos

- [ ] Implementar autenticação
- [ ] Adicionar CRUD completo de imóveis
- [ ] Integração com mapas
- [ ] Sistema de upload de imagens
- [ ] API REST completa
- [ ] Deploy em produção

## Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Servidor de produção
npm run db:push      # Sincronizar schema
npm run db:seed      # Popular banco
npm run db:studio    # Abrir Prisma Studio
```

## Licença

MIT