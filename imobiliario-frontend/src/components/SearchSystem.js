// src/components/SearchSystem.js
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../localization';

const SearchSystem = ({ properties, onSearchResults, onFiltersChange }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    tipo: '',
    cidade: '',
    precoMin: '',
    precoMax: '',
    quartos: '',
    banheiros: '',
    areaMin: '',
    areaMax: ''
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sortBy, setSortBy] = useState('recent');

  // Extrair opções únicas das propriedades
  const filterOptions = useMemo(() => {
    const tipos = [...new Set(properties.map(p => p.tipo).filter(Boolean))];
    const cidades = [...new Set(properties.map(p => p.cidade).filter(Boolean))];
    const quartosOptions = [...new Set(properties.map(p => p.quartos).filter(Boolean))].sort((a, b) => a - b);
    const banheirosOptions = [...new Set(properties.map(p => p.banheiros).filter(Boolean))].sort((a, b) => a - b);

    return {
      tipos: tipos.map(tipo => ({ value: tipo, label: t(tipo) || tipo })),
      cidades: cidades.map(cidade => ({ value: cidade, label: cidade })),
      quartos: quartosOptions,
      banheiros: banheirosOptions
    };
  }, [properties, t]);

  // Aplicar busca e filtros
  const filteredResults = useMemo(() => {
    console.log('Iniciando filtros com', properties.length, 'propriedades');
    let results = [...properties];

    // Busca por texto
    // Busca por texto com normalização de acentos
if (searchTerm.trim()) {
  const normalizeText = (text) => {
    return text.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .trim();
  };
  
  const term = normalizeText(searchTerm);
  console.log('Buscando por (normalizado):', term);
  
  const beforeFilter = results.length;
  results = results.filter(property => 
    normalizeText(property.titulo || '').includes(term) ||
    normalizeText(property.descricao || '').includes(term) ||
    normalizeText(property.cidade || '').includes(term) ||
    normalizeText(property.endereco || '').includes(term) ||
    normalizeText(property.tipo || '').includes(term)
  );
      
      console.log(`Busca por texto: ${beforeFilter} → ${results.length} resultados`);
    }

    // Aplicar filtros
    if (filters.tipo) {
      const beforeFilter = results.length;
      results = results.filter(p => p.tipo === filters.tipo);
      console.log(`Filtro tipo "${filters.tipo}": ${beforeFilter} → ${results.length}`);
    }
    
    if (filters.cidade) {
      const beforeFilter = results.length;
      results = results.filter(p => p.cidade === filters.cidade);
      console.log(`Filtro cidade "${filters.cidade}": ${beforeFilter} → ${results.length}`);
    }
    
    if (filters.precoMin) {
      const beforeFilter = results.length;
      results = results.filter(p => p.preco >= parseInt(filters.precoMin));
      console.log(`Filtro preço mín ${filters.precoMin}: ${beforeFilter} → ${results.length}`);
    }
    
    if (filters.precoMax) {
      const beforeFilter = results.length;
      results = results.filter(p => p.preco <= parseInt(filters.precoMax));
      console.log(`Filtro preço máx ${filters.precoMax}: ${beforeFilter} → ${results.length}`);
    }
    
    if (filters.quartos) {
      const beforeFilter = results.length;
      results = results.filter(p => p.quartos === parseInt(filters.quartos));
      console.log(`Filtro quartos ${filters.quartos}: ${beforeFilter} → ${results.length}`);
    }
    
    if (filters.banheiros) {
      const beforeFilter = results.length;
      results = results.filter(p => p.banheiros === parseInt(filters.banheiros));
      console.log(`Filtro banheiros ${filters.banheiros}: ${beforeFilter} → ${results.length}`);
    }
    
    if (filters.areaMin) {
      const beforeFilter = results.length;
      results = results.filter(p => p.area >= parseInt(filters.areaMin));
      console.log(`Filtro área mín ${filters.areaMin}: ${beforeFilter} → ${results.length}`);
    }
    
    if (filters.areaMax) {
      const beforeFilter = results.length;
      results = results.filter(p => p.area <= parseInt(filters.areaMax));
      console.log(`Filtro área máx ${filters.areaMax}: ${beforeFilter} → ${results.length}`);
    }

    // Aplicar ordenação
    switch (sortBy) {
      case 'price-asc':
        results.sort((a, b) => (a.preco || 0) - (b.preco || 0));
        console.log('Ordenado por: menor preço');
        break;
      case 'price-desc':
        results.sort((a, b) => (b.preco || 0) - (a.preco || 0));
        console.log('Ordenado por: maior preço');
        break;
      case 'area-desc':
        results.sort((a, b) => (b.area || 0) - (a.area || 0));
        console.log('Ordenado por: maior área');
        break;
      case 'area-asc':
        results.sort((a, b) => (a.area || 0) - (b.area || 0));
        console.log('Ordenado por: menor área');
        break;
      case 'recent':
      default:
        results.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        console.log('Ordenado por: mais recentes');
        break;
    }

    console.log('Resultado final da busca:', results.length, 'imóveis');
    if (results.length > 0) {
      console.log('Primeiro resultado:', results[0].titulo);
    }

    return results;
  }, [properties, searchTerm, filters, sortBy]);

  // Notificar mudanças
  useEffect(() => {
    console.log('Enviando', filteredResults.length, 'resultados para o App');
    onSearchResults(filteredResults);
  }, [filteredResults, onSearchResults]);

  useEffect(() => {
    onFiltersChange({ searchTerm, filters, sortBy });
  }, [searchTerm, filters, sortBy, onFiltersChange]);

  // Debug das propriedades recebidas
  useEffect(() => {
    console.log('=== SearchSystem DEBUG ===');
    console.log('Propriedades recebidas:', properties.length);
    if (properties.length > 0) {
      console.log('Primeira propriedade:', properties[0].titulo);
      console.log('Estrutura da primeira propriedade:', {
        titulo: properties[0].titulo,
        cidade: properties[0].cidade,
        tipo: properties[0].tipo,
        preco: properties[0].preco
      });
    }
    console.log('Opções de filtro disponíveis:');
    console.log('- Tipos:', filterOptions.tipos.map(t => t.value));
    console.log('- Cidades:', filterOptions.cidades.map(c => c.value));
    console.log('========================');
  }, [properties, filterOptions]);

  const handleFilterChange = (key, value) => {
    console.log(`Filtro ${key} alterado para:`, value);
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    console.log('Limpando todos os filtros');
    setSearchTerm('');
    setFilters({
      tipo: '',
      cidade: '',
      precoMin: '',
      precoMax: '',
      quartos: '',
      banheiros: '',
      areaMin: '',
      areaMax: ''
    });
    setSortBy('recent');
  };

  const hasActiveFilters = searchTerm || Object.values(filters).some(v => v !== '') || sortBy !== 'recent';

  const handleSearchChange = (e) => {
    const value = e.target.value;
    console.log('Campo de busca alterado para:', value);
    setSearchTerm(value);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* DEBUG INFO */}
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
        <strong>DEBUG:</strong> {properties.length} propriedades carregadas | 
        Termo: "{searchTerm}" | 
        Resultados: {filteredResults.length}
        {hasActiveFilters && <span className="text-orange-600"> (filtros ativos)</span>}
      </div>

      {/* Busca Principal */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Busque por imóveis, cidade, tipo... (ex: duplex, casa, Fernando)"
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
          />
          <svg className="w-6 h-6 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Controles de Filtro */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            <span>{showAdvanced ? 'Ocultar Filtros' : 'Filtros Avançados'}</span>
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Limpar Filtros</span>
            </button>
          )}
        </div>

        {/* Ordenação */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="recent">Mais Recentes</option>
            <option value="price-asc">Menor Preço</option>
            <option value="price-desc">Maior Preço</option>
            <option value="area-desc">Maior Área</option>
            <option value="area-asc">Menor Área</option>
          </select>
        </div>
      </div>

      {/* Filtros Avançados */}
      {showAdvanced && (
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select
                value={filters.tipo}
                onChange={(e) => handleFilterChange('tipo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os tipos</option>
                {filterOptions.tipos.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>
            </div>

            {/* Cidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
              <select
                value={filters.cidade}
                onChange={(e) => handleFilterChange('cidade', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas as cidades</option>
                {filterOptions.cidades.map(cidade => (
                  <option key={cidade.value} value={cidade.value}>{cidade.label}</option>
                ))}
              </select>
            </div>

            {/* Quartos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quartos</label>
              <select
                value={filters.quartos}
                onChange={(e) => handleFilterChange('quartos', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Qualquer quantidade</option>
                {filterOptions.quartos.map(num => (
                  <option key={num} value={num}>{num} quarto{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            {/* Banheiros */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Banheiros</label>
              <select
                value={filters.banheiros}
                onChange={(e) => handleFilterChange('banheiros', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Qualquer quantidade</option>
                {filterOptions.banheiros.map(num => (
                  <option key={num} value={num}>{num} banheiro{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            {/* Preço Mínimo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preço Mínimo (US$)</label>
              <input
                type="number"
                placeholder="Ex: 50000"
                value={filters.precoMin}
                onChange={(e) => handleFilterChange('precoMin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Preço Máximo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preço Máximo (US$)</label>
              <input
                type="number"
                placeholder="Ex: 200000"
                value={filters.precoMax}
                onChange={(e) => handleFilterChange('precoMax', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Área Mínima */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Área Mínima (m²)</label>
              <input
                type="number"
                placeholder="Ex: 50"
                value={filters.areaMin}
                onChange={(e) => handleFilterChange('areaMin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Área Máxima */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Área Máxima (m²)</label>
              <input
                type="number"
                placeholder="Ex: 300"
                value={filters.areaMax}
                onChange={(e) => handleFilterChange('areaMax', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Resultados Count */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            <strong>{filteredResults.length}</strong> {filteredResults.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
            {hasActiveFilters && ` de ${properties.length} total`}
          </span>
          
          {filteredResults.length > 0 && (
            <span className="text-green-600">
              ✓ Resultados atualizados
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchSystem;