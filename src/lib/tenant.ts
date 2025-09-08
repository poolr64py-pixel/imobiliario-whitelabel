import { Tenant } from '@/types'; 
import { headers } from 'next/headers'; 
 
const mockTenants: Record<string, Tenant> = { 
  'localhost:3000': { 
    id: '1', 
    nome: 'Imobiliaria Sao Paulo', 
    dominio: 'localhost:3000', 
    configuracoes: { 
      tema: { 
        corPrimaria: '#2563eb', 
        corSecundaria: '#64748b', 
      }, 
      funcionalidades: { 
        mostrarWatermark: true, 
        permitirCadastro: true, 
        mostrarPrecos: true, 
        whatsappIntegration: true, 
      }, 
      contato: { 
        telefone: '(11) 99999-9999', 
        whatsapp: '5511999999999', 
        email: 'contato@imobiliariasp.com', 
        endereco: 'Sao Paulo, SP', 
      }, 
      seo: { 
        titulo: 'Imobiliaria Sao Paulo', 
        descricao: 'A melhor imobiliaria de Sao Paulo', 
        palavrasChave: ['imoveis', 'casas', 'apartamentos'], 
      }, 
    }, 
  }, 
}; 
 
export async function getCurrentTenant(): Promise<Tenant | null> { 
  const headersList = headers(); 
  const host = headersList.get('host') || 'localhost:3000'; 
  return mockTenants[host] || mockTenants['localhost:3000']; 
} 
