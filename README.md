# 🏠 Plataforma Imobiliária White-Label

Uma plataforma moderna e completa para imobiliárias, desenvolvida com **Next.js 14**, **TypeScript**, **Prisma** e **PostgreSQL**. Suporte completo a **multi-tenancy**, **internacionalização** (Brasil e Paraguai) e **customização de marca**.

## ✨ Características Principais

### 🎯 **Multi-Tenancy Completo**
- Subdomínios personalizados (`cliente.seudominio.com`)
- Domínios próprios (`www.clienteimoveis.com.br`)
- Isolamento completo de dados por cliente
- Configurações independentes de tema e funcionalidades

### 🌍 **Internacionalização**
- **Português (Brasil)** - `pt-BR`
- **Espanhol (Paraguai)** - `es-PY` 
- **Guarani (Paraguai)** - `gn-PY`
- **Inglês (EUA)** - `en-US`
- Moedas: Real (BRL), Dólar (USD), Guarani (PYG)

### 🎨 **Customização Visual**
- Cores primárias, secundárias e de destaque
- Fontes customizáveis (Inter, Roboto, Poppins)
- Logo personalizado (claro/escuro)
- CSS customizado por cliente
- Layout inicial configurável

### 🏢 **Gestão Imobiliária**
- **Tipos de Imóveis**: Casa, Apartamento, Terreno, Comercial, Rural, etc.
- **Categorias**: Venda, Aluguel, Temporada
- **Características Detalhadas**: Quartos, banheiros, área, vagas, etc.
- **Galeria de Imagens** com navegação
- **Vídeos e Tours 360°**
- **Geolocalização** com mapas

### 👥 **Sistema de Usuários**
- **Administradores**: Gestão completa da plataforma
- **Gerentes**: Supervisão de equipes
- **Corretores**: Gestão de imóveis e leads
- **Usuários**: Acesso público

### 📊 **CRM Integrado**
- **Leads**: Captura e gestão automática
- **Pipeline de Vendas**: Acompanhamento completo
- **Relatórios**: Analytics e métricas
- **Integração WhatsApp**: Atendimento direto

## 🚀 Instalação e Configuração

### 📋 Pré-requisitos

- **Node.js** 18+ 
- **PostgreSQL** 12+
- **npm** ou **yarn**
- **Git**

### 1️⃣ Clone o Repositório

```bash
git clone https://github.com/seu-usuario/imobiliario-whitelabel.git
cd imobiliario-whitelabel
```

### 2️⃣ Instale as Dependências

```bash
npm install
```

### 3️⃣ Configure o Banco de Dados

```bash
# Inicie o PostgreSQL via Docker (opcional)
docker run --name postgres-imobiliario \
  -e POSTGRES_DB=imobiliario_whitelabel \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:15-alpine
```

### 4️⃣ Configure as Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Edite as variáveis necessárias
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/imobiliario_whitelabel"
NEXT_PUBLIC_BASE_DOMAIN="localhost:3000"
```

### 5️⃣ Execute as Migrações

```bash
# Gerar cliente Prisma
npm run db:generate

# Executar migrações
npm run db:push

# Popular com dados de exemplo
npm run db:seed
```

### 6️⃣ Inicie o Servidor

```bash
npm run dev
```

🎉 **Pronto!** Acesse `http://demo.localhost:3000`

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── [locale]/          # Rotas internacionalizadas
│   ├── globals.css        # Estilos globais
│   └── layout.tsx         # Layout raiz
├── components/            # Componentes React
│   ├── layout/           # Header, Footer, etc.
│   ├── providers/        # Context Providers
│   ├── sections/         # Seções de página
│   └── ui/               # Componentes UI reutilizáveis
├── lib/                  # Utilitários e configurações
│   ├── database.ts       # Cliente Prisma
│   ├── tenant.ts         # Lógica de multi-tenancy
│   └── utils.ts          # Funções auxiliares
├── messages/             # Traduções i18n
├── middleware.ts         # Middleware Next.js
└── i18n.ts              # Configuração i18n

prisma/
├── schema.prisma         # Schema do banco
└── seed.ts              # Dados de exemplo

public/
├── locales/             # Arquivos de tradução
└── images/              # Imagens estáticas
```

## 🔧 Principais Tecnologias

### **Frontend**
- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **Framer Motion** - Animações
- **Next-Intl** - Internacionalização
- **React Hook Form** - Formulários
- **Headless UI** - Componentes acessíveis

### **Backend**
- **Prisma ORM** - Banco de dados type-safe
- **PostgreSQL** - Banco relacional
- **Next.js API Routes** - API integrada
- **Zod** - Validação de schemas

### **Infraestrutura**
- **Vercel** - Deploy e hosting
- **Cloudinary** - CDN para imagens
- **Redis** - Cache (opcional)
- **Docker** - Containerização

## 🏗️ Funcionalidades Detalhadas

### **Multi-Tenancy**
```typescript
// Middleware automático detecta tenant por:
// - Subdomínio: cliente.plataforma.com
// - Domínio customizado: www.clienteimoveis.com.br
// - Header personalizado

const tenant = await getCurrentTenant();
const tenantService = getTenantService(tenant.id);
```

### **Internacionalização**
```typescript
// Suporte a 4 idiomas com Next-Intl
import { useTranslations } from 'next-intl';

const t = useTranslations('property');
t('title'); // Título traduzido automaticamente
```

### **Customização de Tema**
```typescript
// CSS dinâmico baseado na configuração do tenant
const customCSS = generateCustomCSS(tenant.temaConfig);
// Cores, fontes e layout aplicados automaticamente
```

### **Gestão de Imóveis**
```typescript
// API type-safe com Prisma
const properties = await tenantService.getImoveis({
  tipo: 'CASA',
  categoria: 'VENDA',
  priceMin: 100000,
  priceMax: 500000,
  cidade: 'São Paulo'
});
```

## 📊 Planos e Recursos

| Recurso | Básico | Premium | Enterprise |
|---------|--------|---------|------------|
| **Imóveis** | 50 | Ilimitado | Ilimitado |
| **Usuários** | 3 | 10 | Ilimitado |
| **Subdomínio** | ✅ | ✅ | ✅ |
| **Domínio Próprio** | ❌ | ✅ | ✅ |
| **Tema Customizado** | ❌ | ✅ | ✅ |
| **API Access** | ❌ | ❌ | ✅ |
| **White Label** | ❌ | ❌ | ✅ |
| **Analytics Avançado** | ❌ | ❌ | ✅ |

## 🚀 Deploy

### **Vercel (Recomendado)**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configurar variáveis de ambiente no dashboard
# Conectar banco PostgreSQL (Supabase, Railway, etc.)
```

### **Docker**

```bash
# Build da imagem
docker build -t imobiliario-whitelabel .

# Executar container
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e NEXTAUTH_SECRET="..." \
  imobiliario-whitelabel
```

## 🔒 Segurança

- **Headers de Segurança**: CSP, HSTS, X-Frame-Options
- **Validação**: Zod schemas em todas as APIs
- **Sanitização**: Inputs sanitizados automaticamente
- **Rate Limiting**: Proteção contra spam
- **HTTPS**: Obrigatório em produção

## 📈 Performance

- **SSR + SSG**: Renderização otimizada
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Carregamento sob demanda
- **CDN**: Cloudinary para assets
- **Cache**: Redis para dados frequentes

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

- **Email**: suporte@plataforma-imobiliaria.com
- **WhatsApp**: +55 11 99999-9999
- **Documentação**: [docs.plataforma-imobiliaria.com](https://docs.plataforma-imobiliaria.com)

---

<div align="center">

**Desenvolvido com ❤️ para o mercado imobiliário brasileiro e paraguaio**

[Site](https://plataforma-imobiliaria.com) • [Demo](https://demo.plataforma-imobiliaria.com) • [Documentação](https://docs.plataforma-imobiliaria.com)

</div>