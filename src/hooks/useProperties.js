// src/hooks/useProperties.js
import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';
import { useTenant } from '../contexts/TenantContext';

export const useProperties = (initialFilters = {}) => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0
  });
  const { tenant } = useTenant();

  // Buscar propriedades
  const fetchProperties = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const searchFilters = {
  ...initialFilters,
  ...filters
};
      
      console.log('Buscando propriedades com filtros:', searchFilters);
      const response = await apiClient.getImoveis(searchFilters);
      
      if (response.data) {
        setProperties(response.data);
        setFilteredProperties(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.length
        }));
        console.log(`${response.data.length} propriedades carregadas`);
      }
    } catch (err) {
      console.error('Erro ao buscar propriedades:', err);
      setError(err.message || 'Erro ao carregar propriedades');
      setProperties([]);
      setFilteredProperties([]);
    } finally {
      setLoading(false);
    }
  }, [initialFilters, tenant?.id]);

  // Buscar propriedades com termo de busca
  const searchProperties = useCallback(async (query) => {
    if (!query.trim()) {
      setFilteredProperties(properties);
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.searchImoveis(query);
      if (response.data) {
        setFilteredProperties(response.data);
      }
    } catch (err) {
      console.error('Erro na busca:', err);
      setError('Erro na busca de propriedades');
    } finally {
      setLoading(false);
    }
  }, [properties]);

  // Filtrar propriedades localmente
  const filterProperties = useCallback((filters) => {
    let filtered = [...properties];

    if (filters.tipo) {
      filtered = filtered.filter(p => p.tipo === filters.tipo);
    }
    if (filters.cidade) {
      filtered = filtered.filter(p => p.cidade === filters.cidade);
    }
    if (filters.precoMin) {
      filtered = filtered.filter(p => p.preco >= parseInt(filters.precoMin));
    }
    if (filters.precoMax) {
      filtered = filtered.filter(p => p.preco <= parseInt(filters.precoMax));
    }
    if (filters.quartos) {
      filtered = filtered.filter(p => p.quartos === parseInt(filters.quartos));
    }
    if (filters.banheiros) {
      filtered = filtered.filter(p => p.banheiros === parseInt(filters.banheiros));
    }
    if (filters.areaMin) {
      filtered = filtered.filter(p => p.area >= parseInt(filters.areaMin));
    }
    if (filters.areaMax) {
      filtered = filtered.filter(p => p.area <= parseInt(filters.areaMax));
    }

    setFilteredProperties(filtered);
    setPagination(prev => ({ ...prev, current: 1, total: filtered.length }));
  }, [properties]);

  // Ordenar propriedades
  const sortProperties = useCallback((sortBy) => {
    const sorted = [...filteredProperties];
    
    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => (a.preco || 0) - (b.preco || 0));
        break;
      case 'price-desc':
        sorted.sort((a, b) => (b.preco || 0) - (a.preco || 0));
        break;
      case 'area-desc':
        sorted.sort((a, b) => (b.area || 0) - (a.area || 0));
        break;
      case 'area-asc':
        sorted.sort((a, b) => (a.area || 0) - (b.area || 0));
        break;
      case 'recent':
      default:
        sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
    }
    
    setFilteredProperties(sorted);
  }, [filteredProperties]);

  // Obter propriedades paginadas
  const getPaginatedProperties = useCallback(() => {
    const start = (pagination.current - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredProperties.slice(start, end);
  }, [filteredProperties, pagination]);

  // Navegar páginas
  const goToPage = useCallback((page) => {
    setPagination(prev => ({ ...prev, current: page }));
  }, []);

  // Atualizar tamanho da página
  const setPageSize = useCallback((size) => {
    setPagination(prev => ({ 
      ...prev, 
      pageSize: size, 
      current: 1 
    }));
  }, []);

  // Recarregar dados
  const refresh = useCallback(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Obter estatísticas
  const getStats = useCallback(() => {
    if (properties.length === 0) return null;

    const precos = properties.map(p => p.preco).filter(Boolean);
    const areas = properties.map(p => p.area).filter(Boolean);
    
    return {
      total: properties.length,
      tipos: [...new Set(properties.map(p => p.tipo).filter(Boolean))],
      cidades: [...new Set(properties.map(p => p.cidade).filter(Boolean))],
      precoMedio: precos.length ? Math.round(precos.reduce((a, b) => a + b, 0) / precos.length) : 0,
      precoMin: precos.length ? Math.min(...precos) : 0,
      precoMax: precos.length ? Math.max(...precos) : 0,
      areaMedio: areas.length ? Math.round(areas.reduce((a, b) => a + b, 0) / areas.length) : 0,
      quartos: [...new Set(properties.map(p => p.quartos).filter(Boolean))].sort(),
      banheiros: [...new Set(properties.map(p => p.banheiros).filter(Boolean))].sort()
    };
  }, [properties]);

  // Carregar dados iniciais
 // useEffect(() => {
 //   fetchProperties();
 // }, [fetchProperties]);

  return {
    properties,
    filteredProperties,
    paginatedProperties: getPaginatedProperties(),
    loading,
    error,
    pagination,
    stats: getStats(),
    // Actions
    fetchProperties,
    searchProperties,
    filterProperties,
    sortProperties,
    goToPage,
    setPageSize,
    refresh,
    // Utils
    hasProperties: properties.length > 0,
    hasFilteredProperties: filteredProperties.length > 0,
    totalPages: Math.ceil(filteredProperties.length / pagination.pageSize)
  };
};