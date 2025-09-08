export interface Tenant { 
  id: string; 
  nome: string; 
  dominio: string; 
  logo?: string; 
  configuracoes: TenantConfig; 
} 
 
export interface TenantConfig { 
  tema: { 
    corPrimaria: string; 
    corSecundaria: string; 
    logoUrl?: string; 
  }; 
  funcionalidades: { 
    mostrarWatermark: boolean; 
    permitirCadastro: boolean; 
    mostrarPrecos: boolean; 
    whatsappIntegration: boolean; 
  }; 
  contato: { 
    telefone?: string; 
    whatsapp?: string; 
    email?: string; 
    endereco?: string; 
  }; 
  seo: { 
    titulo: string; 
    descricao: string; 
    palavrasChave: string[]; 
  }; 
} 
