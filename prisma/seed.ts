import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar tenant de exemplo
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      nome: 'Imobiliária Demo',
      dominio: 'demo.localhost',
      subdominio: 'demo',
      slug: 'demo',
      ativo: true,
      idiomaPadrao: 'pt-BR',
      moedaPadrao: 'BRL',
      plano: 'PREMIUM',
      logoUrl: 'https://via.placeholder.com/200x60/3B82F6/ffffff?text=DEMO',
      configuracoes: JSON.stringify({
        descricao: 'Sua imobiliária de confiança há mais de 20 anos no mercado.',
        telefone: '+55 11 99999-9999',
        email: 'contato@demo.com.br',
        endereco: 'Rua das Flores, 123 - Centro - São Paulo, SP',
        whatsapp: '+5511999999999',
        facebook: 'https://facebook.com/demo',
        instagram: 'https://instagram.com/demo',
        horarioFuncionamento: 'Segunda a Sexta: 8h às 18h\nSábado: 9h às 15h',
        heroSubtitle: 'Encontre o imóvel dos seus sonhos com a melhor equipe da região',
        googleAnalyticsId: 'G-XXXXXXXXXX',
      }),
    },
  });

  // Criar configuração de tema
  await prisma.temaConfig.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      corPrimaria: '#3B82F6',
      corSecundaria: '#64748B',
      corDestaque: '#EF4444',
      fontePrimaria: 'Inter',
      layoutInicial: 'GRID',
      mostrarPrecos: true,
      exibirWatermark: true,
    },
  });

  // Criar usuário admin
  const adminUser = await prisma.usuario.upsert({
    where: { email: 'admin@demo.com.br' },
    update: {},
    create: {
      email: 'admin@demo.com.br',
      nome: 'Administrador',
      telefone: '+55 11 99999-9999',
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  // Criar corretores
  const corretor1User = await prisma.usuario.create({
    data: {
      email: 'joao@demo.com.br',
      nome: 'João Silva',
      telefone: '+55 11 98888-8888',
      role: 'CORRETOR',
      tenantId: tenant.id,
      foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    },
  });

  const corretor1 = await prisma.corretor.create({
    data: {
      usuarioId: corretor1User.id,
      creci: '67890-F',
      biografia: 'Especialista em imóveis residenciais com mais de 10 anos de experiência.',
      especializacao: 'Residencial, Apartamentos, Casas',
      whatsapp: '+5511988888888',
      instagram: '@joao.corretor',
      tenantId: tenant.id,
    },
  });

  const corretor2User = await prisma.usuario.create({
    data: {
      email: 'maria@demo.com.br',
      nome: 'Maria Santos',
      telefone: '+55 11 97777-7777',
      role: 'CORRETOR',
      tenantId: tenant.id,
      foto: 'https://images.unsplash.com/photo-1494790108755-2616b612b8c7?w=150&h=150&fit=crop&crop=face',
    },
  });

  const corretor2 = await prisma.corretor.create({
    data: {
      usuarioId: corretor2User.id,
      creci: '12345-F',
      biografia: 'Focada em imóveis comerciais e de alto padrão. Atendimento personalizado.',
      especializacao: 'Comercial, Alto Padrão, Terrenos',
      whatsapp: '+5511977777777',
      instagram: '@maria.imoveis',
      linkedin: 'https://linkedin.com/in/maria-santos',
      tenantId: tenant.id,
    },
  });

  // Criar imóveis de exemplo
  const imoveis = [
    {
      titulo: 'Casa Moderna com Piscina - Condomínio Fechado',
      descricao: 'Belíssima casa em condomínio fechado com toda infraestrutura. Possui 3 quartos sendo 1 suíte, sala ampla, cozinha planejada, área gourmet e piscina. Excelente localização próxima a escolas e shopping.',
      preco: 850000,
      tipo: 'CASA',
      categoria: 'VENDA',
      destaque: true,
      codigoReferencia: 'CS001',
      slug: 'casa-moderna-piscina-condominio',
      corretorId: corretor1.id,
      endereco: {
        rua: 'Rua das Palmeiras',
        numero: '123',
        bairro: 'Jardim das Flores',
        cidade: 'São Paulo',
        estado: 'SP',
        pais: 'Brasil',
        cep: '01234-567',
        coordenadas: JSON.stringify({ latitude: -23.5505, longitude: -46.6333 }),
      },
      caracteristicas: {
        quartos: 3,
        suites: 1,
        banheiros: 3,
        areaTotal: 250,
        areaConstruida: 180,
        vagas: 2,
        anoConstricao: 2020,
        conservacao: 'EXCELENTE',
        piscinaPrivada: true,
        jardimPrivado: true,
        amenidades: JSON.stringify(['Piscina', 'Área Gourmet', 'Jardim', 'Churrasqueira']),
      },
      imagens: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
      ],
    },
    {
      titulo: 'Apartamento Luxuoso Vista Mar - 4 Quartos',
      descricao: 'Apartamento de alto padrão com vista deslumbrante para o mar. 4 quartos, sendo 2 suítes, sala ampla com sacada, cozinha gourmet e 3 vagas na garagem. Prédio com piscina, academia e salão de festas.',
      preco: 1200000,
      tipo: 'APARTAMENTO',
      categoria: 'VENDA',
      destaque: true,
      urgente: true,
      codigoReferencia: 'AP001',
      slug: 'apartamento-luxuoso-vista-mar-4-quartos',
      corretorId: corretor2.id,
      endereco: {
        rua: 'Avenida Beira Mar',
        numero: '456',
        complemento: 'Apto 1501',
        bairro: 'Copacabana',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
        pais: 'Brasil',
        cep: '22070-900',
        coordenadas: JSON.stringify({ latitude: -22.9068, longitude: -43.1729 }),
      },
      caracteristicas: {
        quartos: 4,
        suites: 2,
        banheiros: 4,
        areaTotal: 150,
        areaPrivativa: 120,
        vagas: 3,
        anoConstricao: 2018,
        conservacao: 'NOVO',
        amenidades: JSON.stringify(['Vista Mar', 'Piscina', 'Academia', 'Salão de Festas', 'Portaria 24h']),
      },
      imagens: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop',
      ],
    },
    {
      titulo: 'Terreno Comercial - Esquina Movimentada',
      descricao: 'Excelente terreno comercial em esquina de rua movimentada. Ideal para construção de prédio comercial ou residencial. Documentação em dia, pronto para construir.',
      preco: 450000,
      tipo: 'TERRENO',
      categoria: 'VENDA',
      codigoReferencia: 'TR001',
      slug: 'terreno-comercial-esquina-movimentada',
      corretorId: corretor1.id,
      endereco: {
        rua: 'Rua do Comércio',
        numero: '789',
        bairro: 'Centro',
        cidade: 'Campinas',
        estado: 'SP',
        pais: 'Brasil',
        cep: '13010-100',
        coordenadas: JSON.stringify({ latitude: -22.9056, longitude: -47.0608 }),
      },
      caracteristicas: {
        quartos: 0,
        banheiros: 0,
        areaTotal: 500,
        vagas: 0,
        amenidades: JSON.stringify(['Esquina', 'Documentação em dia', 'Pronto para construir']),
      },
      imagens: [
        'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&h=600&fit=crop',
      ],
    },
    {
      titulo: 'Apartamento 2 Quartos - Aluguel Mobiliado',
      descricao: 'Apartamento mobiliado para aluguel, 2 quartos, sala, cozinha equipada e 1 vaga. Localização privilegiada próximo ao metrô. Ideal para executivos.',
      preco: 3500,
      tipo: 'APARTAMENTO',
      categoria: 'ALUGUEL',
      codigoReferencia: 'AL001',
      slug: 'apartamento-2-quartos-aluguel-mobiliado',
      corretorId: corretor2.id,
      endereco: {
        rua: 'Rua Augusta',
        numero: '1000',
        complemento: 'Apto 802',
        bairro: 'Consolação',
        cidade: 'São Paulo',
        estado: 'SP',
        pais: 'Brasil',
        cep: '01305-100',
        coordenadas: JSON.stringify({ latitude: -23.5558, longitude: -46.6396 }),
      },
      caracteristicas: {
        quartos: 2,
        banheiros: 2,
        areaTotal: 65,
        vagas: 1,
        anoConstricao: 2015,
        conservacao: 'BOM',
        mobiliado: 'COMPLETO',
        amenidades: JSON.stringify(['Mobiliado', 'Próximo ao Metrô', 'Portaria 24h']),
      },
      imagens: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop',
      ],
    },
    {
      titulo: 'Casa de Campo - Condomínio Rural',
      descricao: 'Linda casa de campo em condomínio rural fechado. 4 quartos, varanda gourmet, piscina natural e muito verde. Perfeita para fim de semana e feriados.',
      preco: 680000,
      tipo: 'CHACARA',
      categoria: 'VENDA',
      codigoReferencia: 'CH001',
      slug: 'casa-campo-condominio-rural',
      corretorId: corretor1.id,
      endereco: {
        rua: 'Estrada da Serra',
        numero: 'KM 25',
        bairro: 'Serra da Cantareira',
        cidade: 'Mairiporã',
        estado: 'SP',
        pais: 'Brasil',
        cep: '07600-000',
        coordenadas: JSON.stringify({ latitude: -23.3181, longitude: -46.5861 }),
      },
      caracteristicas: {
        quartos: 4,
        suites: 2,
        banheiros: 4,
        areaTotal: 2000,
        areaConstruida: 300,
        vagas: 4,
        anoConstricao: 2010,
        conservacao: 'BOM',
        piscinaPrivada: true,
        jardimPrivado: true,
        amenidades: JSON.stringify(['Piscina Natural', 'Área Gourmet', 'Muito Verde', 'Segurança 24h']),
      },
      imagens: [
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800&h=600&fit=crop',
      ],
    },
  ];

  // Criar imóveis
  for (const imovelData of imoveis) {
    const { endereco, caracteristicas, imagens, ...imovelInfo } = imovelData;
    
    const imovel = await prisma.imovel.create({
      data: {
        ...imovelInfo,
        tenantId: tenant.id,
        visualizacoes: Math.floor(Math.random() * 100) + 10,
      },
    });

    // Criar endereço
    await prisma.endereco.create({
      data: {
        ...endereco,
        imovelId: imovel.id,
      },
    });

    // Criar características
    await prisma.caracteristicas.create({
      data: {
        ...caracteristicas,
        imovelId: imovel.id,
      },
    });

    // Criar imagens
    for (let index = 0; index < imagens.length; index++) {
      const imageUrl = imagens[index];
      await prisma.imagem.create({
        data: {
          imovelId: imovel.id,
          url: imageUrl,
          alt: `${imovelInfo.titulo} - Imagem ${index + 1}`,
          ordem: index,
          principal: index === 0,
        },
      });
    }

    // Criar configuração SEO
    await prisma.seo.create({
      data: {
        imovelId: imovel.id,
        metaTitle: `${imovelInfo.titulo} | Imobiliária Demo`,
        metaDescription: imovelData.descricao.substring(0, 150) + '...',
        keywords: `${imovelInfo.tipo.toLowerCase()}, ${imovelInfo.categoria.toLowerCase()}, imóvel, ${endereco.cidade.toLowerCase()}`,
      },
    });
  }

  // Criar alguns leads de exemplo
  const leads = [
    {
      nome: 'Carlos Silva',
      email: 'carlos@email.com',
      telefone: '+55 11 99999-1111',
      whatsapp: '+5511999991111',
      mensagem: 'Tenho interesse na casa com piscina. Gostaria de agendar uma visita.',
      interesse: 'COMPRA',
      origem: 'SITE',
      status: 'NOVO',
    },
    {
      nome: 'Ana Paula',
      email: 'ana@email.com',
      telefone: '+55 11 99999-2222',
      mensagem: 'Procuro apartamento para alugar na região central.',
      interesse: 'ALUGUEL',
      origem: 'FACEBOOK',
      status: 'CONTATADO',
    },
    {
      nome: 'Roberto Santos',
      email: 'roberto@email.com',
      telefone: '+55 11 99999-3333',
      mensagem: 'Interesse no terreno comercial. Qual o preço final?',
      interesse: 'COMPRA',
      origem: 'GOOGLE',
      status: 'AGENDADO',
    },
  ];

  for (const leadData of leads) {
    await prisma.lead.create({
      data: {
        ...leadData,
        tenantId: tenant.id,
      },
    });
  }

  console.log('✅ Seed concluído com sucesso!');
  console.log('📊 Dados criados:');
  console.log(`   • 1 Tenant: ${tenant.nome}`);
  console.log(`   • 3 Usuários (1 admin + 2 corretores)`);
  console.log(`   • ${imoveis.length} Imóveis`);
  console.log(`   • ${leads.length} Leads`);
  console.log('');
  console.log('🌐 Acesse: http://demo.localhost:3000');
  console.log('📧 Login admin: admin@demo.com.br');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erro durante o seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });