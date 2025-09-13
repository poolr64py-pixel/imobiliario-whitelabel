// src/services/api.js
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:1337/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Métodos para Imóveis
  async getImoveis(filters = {}) {
    const params = new URLSearchParams();
    params.append('populate', '*');
    params.append('sort', 'createdAt:desc');
    
    if (filters.cidade) params.append('filters[cidade][$eq]', filters.cidade);
    if (filters.tipo) params.append('filters[tipo][$eq]', filters.tipo);
    if (filters.precoMin) params.append('filters[preco][$gte]', filters.precoMin);
    if (filters.precoMax) params.append('filters[preco][$lte]', filters.precoMax);
    if (filters.quartos) params.append('filters[quartos][$eq]', filters.quartos);
    if (filters.cliente) params.append('filters[cliente][id][$eq]', filters.cliente);
    
    return this.request(`/imovels?${params.toString()}`);
  }

  async getImovel(id) {
    return this.request(`/imovels/${id}?populate=*`);
  }

  async searchImoveis(query) {
    const params = new URLSearchParams();
    params.append('populate', '*');
    params.append('filters[$or][0][titulo][$containsi]', query);
    params.append('filters[$or][1][descricao][$containsi]', query);
    params.append('filters[$or][2][cidade][$containsi]', query);
    params.append('filters[$or][3][endereco][$containsi]', query);
    
    return this.request(`/imovels?${params.toString()}`);
  }

  // Métodos para Clientes
  async getClientes() {
    return this.request('/clientes?populate=*');
  }

  async getCliente(id) {
    return this.request(`/clientes/${id}?populate=*`);
  }

  // Métodos para Leads
  async createLead(leadData) {
    return this.request('/leads', {
      method: 'POST',
      body: JSON.stringify({ data: leadData }),
    });
  }

  async getLeads(filters = {}) {
    const params = new URLSearchParams();
    params.append('populate', '*');
    params.append('sort', 'createdAt:desc');
    
    if (filters.status) params.append('filters[status][$eq]', filters.status);
    if (filters.origem) params.append('filters[origem][$eq]', filters.origem);
    
    return this.request(`/leads?${params.toString()}`);
  }

  async updateLead(id, data) {
    return this.request(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }

  // Métodos para Corretores
  async getCorretores() {
    return this.request('/corretors?populate=*');
  }

  // Método de teste de conectividade
  async testConnection() {
    try {
      const response = await fetch(this.baseURL.replace('/api', ''));
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Instância singleton
const apiClient = new ApiClient();
export default apiClient;