import React, { useState, useMemo, useCallback } from 'react';

const PropertyMap = ({ 
  properties = [], 
  selectedProperty = null, 
  onPropertySelect = null,
  height = '400px',
  center = { lat: -25.2637, lng: -57.5759 }, // Assunção, Paraguai
  zoom = 12 
}) => {
  const [mapError, setMapError] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(selectedProperty?.id || null);
  const [mapView, setMapView] = useState('roadmap'); // roadmap, satellite, hybrid, terrain

  // Simular coordenadas para propriedades que não têm coordenadas reais
  const getPropertyCoordinates = useCallback((property, index) => {
    if (property.latitude && property.longitude) {
      return { lat: parseFloat(property.latitude), lng: parseFloat(property.longitude) };
    }

    // Gerar coordenadas simuladas baseadas na cidade e índice
    const cityCoords = {
      'Assunção': { lat: -25.2637, lng: -57.5759 },
      'Fernando de la Mora': { lat: -25.3356, lng: -57.5194 },
      'San Lorenzo': { lat: -25.3333, lng: -57.5000 },
      'Lambaré': { lat: -25.3425, lng: -57.6269 },
      'Luque': { lat: -25.2667, lng: -57.4833 }
    };

    const baseCoords = cityCoords[property.cidade] || center;
    
    // Adicionar variação aleatória baseada no ID da propriedade para consistência
    const seed = property.id || index;
    const offsetLat = ((seed * 7) % 100 - 50) * 0.001; // ±0.05 graus
    const offsetLng = ((seed * 11) % 100 - 50) * 0.001;

    return {
      lat: baseCoords.lat + offsetLat,
      lng: baseCoords.lng + offsetLng
    };
  }, [center]);

  // Propriedades com coordenadas
  const propertiesWithCoords = useMemo(() => {
    return properties.map((property, index) => ({
      ...property,
      coordinates: getPropertyCoordinates(property, index)
    }));
  }, [properties, getPropertyCoordinates]);

  // Simulação de mapa (para demonstração - substitua por Google Maps ou OpenStreetMap)
  const MapSimulation = () => {
    const [hoveredProperty, setHoveredProperty] = useState(null);

    return (
      <div className="relative w-full h-full bg-gradient-to-br from-green-100 to-blue-100 rounded-lg overflow-hidden">
        {/* Simulação de tiles de mapa */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-8 grid-rows-6 h-full">
            {Array.from({ length: 48 }, (_, i) => (
              <div 
                key={i} 
                className={`border border-gray-300 ${
                  i % 3 === 0 ? 'bg-green-50' : i % 2 === 0 ? 'bg-blue-50' : 'bg-yellow-50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Controles do mapa */}
        <div className="absolute top-4 right-4 z-10 space-y-2">
          <div className="bg-white rounded-lg shadow-md p-2">
            <button 
              onClick={() => setMapView(mapView === 'roadmap' ? 'satellite' : 'roadmap')}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
            >
              {mapView === 'roadmap' ? '🛰️' : '🗺️'}
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md flex flex-col">
            <button className="p-2 hover:bg-gray-100 text-lg font-bold">+</button>
            <button className="p-2 hover:bg-gray-100 text-lg font-bold border-t">−</button>
          </div>
        </div>

        {/* Marcadores de propriedades */}
        {propertiesWithCoords.map((property, index) => {
          const x = ((property.coordinates.lng - center.lng) * 800 + 400) + 50;
          const y = ((center.lat - property.coordinates.lat) * 600 + 200) + 50;
          
          // Verificar se está dentro da área visível
          if (x < 0 || x > 500 || y < 0 || y > 400) return null;

          const isSelected = selectedMarker === property.id;
          const isHovered = hoveredProperty === property.id;

          return (
            <div
              key={property.id || index}
              className={`absolute transform -translate-x-1/2 -translate-y-full cursor-pointer transition-all duration-200 z-20 ${
                isSelected ? 'scale-125' : isHovered ? 'scale-110' : 'scale-100'
              }`}
              style={{ left: `${x}px`, top: `${y}px` }}
              onMouseEnter={() => setHoveredProperty(property.id)}
              onMouseLeave={() => setHoveredProperty(null)}
              onClick={() => {
                setSelectedMarker(property.id);
                onPropertySelect && onPropertySelect(property);
              }}
            >
              {/* Pin do marcador */}
              <div className={`relative ${isSelected ? 'animate-bounce' : ''}`}>
                <div 
                  className={`w-6 h-8 rounded-t-full rounded-bl-full transform rotate-45 shadow-lg ${
                    isSelected 
                      ? 'bg-red-500 border-2 border-white' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                />
                <div 
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full flex items-center justify-center transform rotate-45 text-xs font-bold ${
                    isSelected ? 'text-red-500' : 'text-blue-500'
                  }`}
                >
                  {property.preco ? '$' : '🏠'}
                </div>
              </div>

              {/* Tooltip */}
              {(isHovered || isSelected) && (
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-3 min-w-64 z-30 border">
                  <div className="text-sm font-semibold text-gray-800 mb-1">
                    {property.titulo}
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    📍 {property.endereco || property.cidade}
                  </div>
                  <div className="text-sm font-bold text-green-600 mb-2">
                    {property.preco ? `$${property.preco.toLocaleString()}` : 'Preço consultar'}
                  </div>
                  <div className="flex space-x-3 text-xs text-gray-500">
                    {property.area && <span>📐 {property.area}m²</span>}
                    {property.quartos && <span>🛏️ {property.quartos}</span>}
                    {property.banheiros && <span>🚿 {property.banheiros}</span>}
                  </div>
                  
                  {/* Seta do tooltip */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-white"></div>
                </div>
              )}
            </div>
          );
        })}

        {/* Legenda */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 text-xs">
          <div className="font-semibold mb-2">Legenda</div>
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Propriedade disponível</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Propriedade selecionada</span>
          </div>
        </div>

        {/* Informações do mapa */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md p-2 text-xs">
          <div className="font-semibold">Mostrando {propertiesWithCoords.length} propriedades</div>
          <div className="text-gray-500">Região: Assunção, Paraguai</div>
        </div>
      </div>
    );
  };

  // Lista lateral de propriedades
  const PropertyList = () => (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">
          Propriedades no mapa ({propertiesWithCoords.length})
        </h3>
      </div>
      
      <div className="divide-y divide-gray-100">
        {propertiesWithCoords.map((property, index) => (
          <div
            key={property.id || index}
            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
              selectedMarker === property.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
            }`}
            onClick={() => {
              setSelectedMarker(property.id);
              onPropertySelect && onPropertySelect(property);
            }}
          >
            <div className="flex items-start space-x-3">
              {/* Imagem miniatura */}
              <div className="w-16 h-12 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                {property.imagens && property.imagens.length > 0 ? (
                  <img
                    src={`http://localhost:1337${property.imagens[0].url}`}
                    alt={property.titulo}
                    className="w-full h-full object-cover"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    🏠
                  </div>
                )}
              </div>

              {/* Informações */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-gray-800 truncate">
                  {property.titulo}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  📍 {property.cidade}
                </p>
                <p className="text-sm font-semibold text-green-600 mt-1">
                  {property.preco ? `$${property.preco.toLocaleString()}` : 'Consultar'}
                </p>
                
                <div className="flex space-x-2 mt-2 text-xs text-gray-500">
                  {property.area && <span>📐 {property.area}m²</span>}
                  {property.quartos && <span>🛏️ {property.quartos}</span>}
                  {property.banheiros && <span>🚿 {property.banheiros}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {propertiesWithCoords.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <div className="text-4xl mb-2">🗺️</div>
          <p>Nenhuma propriedade para mostrar no mapa</p>
        </div>
      )}
    </div>
  );

  if (mapError) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center" style={{ height }}>
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Erro ao carregar mapa
        </h3>
        <p className="text-gray-500 mb-4">
          Não foi possível carregar o componente de mapa.
        </p>
        <button 
          onClick={() => setMapError(false)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden border"
      style={{ height }}
    >
      <div className="flex h-full">
        {/* Área do mapa */}
        <div className="flex-1 relative">
          <MapSimulation />
        </div>

        {/* Lista lateral */}
        <PropertyList />
      </div>
    </div>
  );
};

export default PropertyMap;