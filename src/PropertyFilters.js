import React, { useState, useEffect, useCallback } from 'react';

const PropertyFilters = ({ 
  properties = [], 
  onFilterChange,
  showAdvanced = true,
  className = ""
}) => {
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: '',
    bedrooms: '',
    bathrooms: '',
    status: 'ativo',
    sortBy: 'newest'
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [availableCities, setAvailableCities] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [resultsCount, setResultsCount] = useState(0);

  // Extrair cidades únicas e calcular faixas de preço
  useEffect(() => {
    if (properties.length === 0) return;

    const cities = [...new Set(properties.map(p => p.cidade).filter(Boolean))].sort();
    setAvailableCities(cities);

    const prices = properties.map(p => p.preco).filter(p => p && p > 0);
    if (prices.length > 0) {
      setPriceRange({
        min: Math.min(...prices),
        max: Math.max(...prices)
      });
    }
  }, [properties]);

  // Aplicar filtros
  const applyFilters = useCallback(() => {
    if (!onFilterChange || typeof onFilterChange !== 'function') {
      console.warn('onFilterChange prop is not a function');
      return;
    }

    let filtered = [...properties];

    // Busca por texto
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(property => 
        property.titulo?.toLowerCase().includes(searchTerm) ||
        property.descricao?.toLowerCase().includes(searchTerm) ||
        property.cidade?.toLowerCase().includes(searchTerm) ||
        property.endereco?.toLowerCase().includes(searchTerm)
      );
    }

    // Filtro por cidade
    if (filters.city) {
      filtered = filtered.filter(property => property.cidade === filters.city);
    }

    // Filtro por tipo
    if (filters.propertyType) {
      filtered = filtered.filter(property => property.tipo === filters.propertyType);
    }

    // Filtro por preço
    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      filtered = filtered.filter(property => property.preco >= minPrice);
    }
    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      filtered = filtered.filter(property => property.preco <= maxPrice);
    }

    // Filtro por área
    if (filters.minArea) {
      const minArea = parseFloat(filters.minArea);
      filtered = filtered.filter(property => property.area >= minArea);
    }
    if (filters.maxArea) {
      const maxArea = parseFloat(filters.maxArea);
      filtered = filtered.filter(property => property.area <= maxArea);
    }

    // Filtro por quartos
    if (filters.bedrooms) {
      const bedrooms = parseInt(filters.bedrooms);
      filtered = filtered.filter(property => property.quartos >= bedrooms);
    }

    // Filtro por banheiros
    if (filters.bathrooms) {
      const bathrooms = parseInt(filters.bathrooms);
      filtered = filtered.filter(property => property.banheiros >= bathrooms);
    }

    // Filtro por status
    if (filters.status !== '') {
      filtered = filtered.filter(property => {
        if (filters.status === 'ativo') return property.ativo !== false;
        if (filters.status === 'inativo') return property.ativo === false;
        return true;
      });
    }

    // Ordenação
    switch (filters.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => (a.preco || 0) - (b.preco || 0));
        break;
      case 'price_desc':
        filtered.sort((a, b) => (b.preco || 0) - (a.preco || 0));
        break;
      case 'area_desc':
        filtered.sort((a, b) => (b.area || 0) - (a.area || 0));
        break;
      case 'title':
        filtered.sort((a, b) => (a.titulo || '').localeCompare(b.titulo || ''));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
    }

    setResultsCount(filtered.length);
    onFilterChange(filtered, filters);
  }, [properties, filters, onFilterChange]);

  // Executar filtros quando mudarem
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      city: '',
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      minArea: '',
      maxArea: '',
      bedrooms: '',
      bathrooms: '',
      status: 'ativo',
      sortBy: 'newest'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className={`bg-white p-6 rounded-lg shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Filtros de Busca</h2>
          <p className="text-sm text-gray-600 mt-1">
            {resultsCount} imóveis encontrados
          </p>
        </div>
        <button
          onClick={clearFilters}
          className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center space-x-1"
        >
          <span>🗑️</span>
          <span>Limpar filtros</span>
        </button>
      </div>

      {/* Busca por texto */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Buscar imóveis
        </label>
        <div className="relative">
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Digite cidade, bairro, tipo ou características..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">🔍</span>
          </div>
        </div>
      </div>

      {/* Filtros básicos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Cidade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cidade
          </label>
          <select
            value={filters.city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas as cidades</option>
            {availableCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Tipo de imóvel */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de imóvel
          </label>
          <select
            value={filters.propertyType}
            onChange={(e) => handleFilterChange('propertyType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos os tipos</option>
            <option value="casa">Casa</option>
            <option value="apartamento">Apartamento</option>
            <option value="terreno">Terreno</option>
            <option value="comercial">Comercial</option>
            <option value="rural">Rural</option>
          </select>
        </div>

        {/* Ordenação */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ordenar por
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="newest">Mais recentes</option>
            <option value="price_asc">Menor preço</option>
            <option value="price_desc">Maior preço</option>
            <option value="area_desc">Maior área</option>
            <option value="title">Nome A-Z</option>
          </select>
        </div>
      </div>

      {/* Toggle filtros avançados */}
      {showAdvanced && (
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors mb-4 flex items-center justify-center space-x-2"
        >
          <span>{showAdvancedFilters ? 'Ocultar' : 'Mostrar'} filtros avançados</span>
          <span className={`transform transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`}>
            ⌄
          </span>
        </button>
      )}

      {/* Filtros avançados */}
      {showAdvancedFilters && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          {/* Faixa de preço */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Faixa de preço (USD)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  placeholder={`Mín: ${formatPrice(priceRange.min)}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  placeholder={`Máx: ${formatPrice(priceRange.max)}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Área */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Área (m²)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  value={filters.minArea}
                  onChange={(e) => handleFilterChange('minArea', e.target.value)}
                  placeholder="Área mínima"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  value={filters.maxArea}
                  onChange={(e) => handleFilterChange('maxArea', e.target.value)}
                  placeholder="Área máxima"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Quartos e Banheiros */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quartos (mínimo)
              </label>
              <select
                value={filters.bedrooms}
                onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Qualquer quantidade</option>
                <option value="1">1+ quartos</option>
                <option value="2">2+ quartos</option>
                <option value="3">3+ quartos</option>
                <option value="4">4+ quartos</option>
                <option value="5">5+ quartos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banheiros (mínimo)
              </label>
              <select
                value={filters.bathrooms}
                onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Qualquer quantidade</option>
                <option value="1">1+ banheiros</option>
                <option value="2">2+ banheiros</option>
                <option value="3">3+ banheiros</option>
                <option value="4">4+ banheiros</option>
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status do imóvel
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="ativo"
                  checked={filters.status === 'ativo'}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Disponível</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value=""
                  checked={filters.status === ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Todos</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Resumo dos filtros ativos */}
      {(filters.search || filters.city || filters.propertyType || filters.minPrice || filters.maxPrice) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Filtros ativos:</p>
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Busca: "{filters.search}"
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.city && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {filters.city}
                <button
                  onClick={() => handleFilterChange('city', '')}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.propertyType && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {filters.propertyType}
                <button
                  onClick={() => handleFilterChange('propertyType', '')}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {filters.minPrice && `Min: ${formatPrice(filters.minPrice)}`}
                {filters.minPrice && filters.maxPrice && ' - '}
                {filters.maxPrice && `Max: ${formatPrice(filters.maxPrice)}`}
                <button
                  onClick={() => {
                    handleFilterChange('minPrice', '');
                    handleFilterChange('maxPrice', '');
                  }}
                  className="ml-2 text-yellow-600 hover:text-yellow-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyFilters;