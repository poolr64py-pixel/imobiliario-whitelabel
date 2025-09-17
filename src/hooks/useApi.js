import { useCallback } from 'react';
import { useTenant } from '../contexts/TenantContext';

export const useApi = () => {
  const { tenant } = useTenant();
  const API_BASE = 'http://localhost:1337/api';

  const apiCall = useCallback(async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Adicionar filtro por cliente nas consultas
    let url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    
    // Se é uma consulta de imóveis, filtrar por cliente
    if (tenant?.id && endpoint.includes('/imovels')) {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}filters[cliente][id][$eq]=${tenant.id}`;
    }
    
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }, [tenant?.id]);

  return { apiCall };
};