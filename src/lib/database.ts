import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Criar ou reutilizar instância global
export const prisma: PrismaClient =
  globalThis.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  });

// Somente em desenvolvimento, salvar instância global para hot-reload
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Utility functions para multi-tenancy
export class TenantService {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  // Métodos para Imóveis
  async getImoveis(filters?: {
    tipo?: string;
    categoria?: string;
    status?: string;
    priceMin?: number;
    priceMax?: number;
    areaMin?: number;
    areaMax?: number;
    cidade?: string;
    bairro?: string;
    quartos?: number;
    banheiros?: number;
    vagas?: number;
    skip?: number;
    take?: number;
    orderBy?: any;
  }) {
    const where: any = {
      tenantId: this.tenantId,
      status: 'DISPONIVEL',
    };

    if (filters?.tipo) where.tipo = filters.tipo;
    if (filters?.categoria) where.categoria = filters.categoria;
    if (filters?.status) where.status = filters.status;

    if (filters?.priceMin || filters?.priceMax) {
      where.preco = {};
      if (filters.priceMin) where.preco.gte = filters.priceMin;
      if (filters.priceMax) where.preco.lte = filters.priceMax;
    }

    if (filters?.cidade || filters?.bairro) {
      where.endereco = {};
      if (filters.cidade) where.endereco.cidade = { contains: filters.cidade, mode: 'insensitive' };
      if (filters.bairro) where.endereco.bairro = { contains: filters.bairro, mode: 'insensitive' };
    }

    if (filters?.quartos || filters?.banheiros || filters?.vagas || filters?.areaMin || filters?.areaMax) {
      where.caracteristicas = {};
      if (filters.quartos) where.caracteristicas.quartos = { gte: filters.quartos };
      if (filters.banheiros) where.caracteristicas.banheiros = { gte: filters.banheiros };
      if (filters.vagas) where.caracteristicas.vagas = { gte: filters.vagas };

      if (filters.areaMin || filters.areaMax) {
        where.caracteristicas.areaTotal = {};
        if (filters.areaMin) where.caracteristicas.areaTotal.gte = filters.areaMin;
        if (filters.areaMax) where.caracteristicas.areaTotal.lte = filters.areaMax;
      }
    }

    return prisma.imovel.findMany({
      where,
      include: {
        endereco: true,
        caracteristicas: true,
        imagens: {
          orderBy: { ordem: 'asc' },
          take: 1,
        },
        corretor: {
          include: {
            usuario: true,
          },
        },
      },
      skip: filters?.skip || 0,
      take: filters?.take || 20,
      orderBy: filters?.orderBy || { createdAt: 'desc' },
    });
  }

  async getImovelBySlug(slug: string) {
    return prisma.imovel.findFirst({
      where: {
        slug,
        tenantId: this.tenantId,
      },
      include: {
        endereco: true,
        caracteristicas: true,
        imagens: {
          orderBy: { ordem: 'asc' },
        },
        videos: true,
        corretor: {
          include: {
            usuario: true,
          },
        },
        seo: true,
      },
    });
  }

  async incrementViews(imovelId: string) {
    return prisma.imovel.update({
      where: { id: imovelId },
      data: {
        visualizacoes: {
          increment: 1,
        },
      },
    });
  }

  // Métodos para Leads
  async createLead(data: {
    nome: string;
    email: string;
    telefone?: string;
    whatsapp?: string;
    mensagem?: string;
    imovelId?: string;
    origem?: string;
    interesse?: string;
  }) {
    const leadData = {
      nome: data.nome,
      email: data.email,
      telefone: data.telefone || '',
      whatsapp: data.whatsapp,
      mensagem: data.mensagem,
      imovelId: data.imovelId,
      origem: data.origem || 'SITE',
      interesse: data.interesse || 'CONTATO',
      tenantId: this.tenantId,
    };

    return prisma.lead.create({
      data: leadData,
    });
  }

  // Métodos para Corretores
  async getCorretores() {
    return prisma.corretor.findMany({
      where: {
        tenantId: this.tenantId,
        ativo: true,
      },
      include: {
        usuario: true,
        _count: {
          select: {
            imoveis: {
              where: {
                status: 'DISPONIVEL',
              },
            },
          },
        },
      },
    });
  }

  async getCorretorById(id: string) {
    return prisma.corretor.findFirst({
      where: {
        id,
        tenantId: this.tenantId,
        ativo: true,
      },
      include: {
        usuario: true,
        imoveis: {
          where: {
            status: 'DISPONIVEL',
          },
          include: {
            endereco: true,
            caracteristicas: true,
            imagens: {
              orderBy: { ordem: 'asc' },
              take: 1,
            },
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }
}

// Utility function para obter tenant service
export function getTenantService(tenantId: string) {
  return new TenantService(tenantId);
}

// Utility function para buscar tenant por domínio
export async function getTenantByDomain(domain: string) {
  return prisma.tenant.findFirst({
    where: {
      dominio: domain,
      ativo: true,
    },
  });
}

// Utility function para estatísticas
export async function getTenantStats(tenantId: string) {
  const [
    totalImoveis,
    imoveisDisponiveis,
    imoveisVendidos,
    imoveisAlugados,
    totalLeads,
    leadsNovos,
    totalCorretores,
  ] = await Promise.all([
    prisma.imovel.count({ where: { tenantId } }),
    prisma.imovel.count({ where: { tenantId, status: 'DISPONIVEL' } }),
    prisma.imovel.count({ where: { tenantId, status: 'VENDIDO' } }),
    prisma.imovel.count({ where: { tenantId, status: 'ALUGADO' } }),
    prisma.lead.count({ where: { tenantId } }),
    prisma.lead.count({ where: { tenantId, status: 'NOVO' } }),
    prisma.corretor.count({ where: { tenantId, ativo: true } }),
  ]);

  return {
    totalImoveis,
    imoveisDisponiveis,
    imoveisVendidos,
    imoveisAlugados,
    totalLeads,
    leadsNovos,
    totalCorretores,
  };
}

export default prisma;