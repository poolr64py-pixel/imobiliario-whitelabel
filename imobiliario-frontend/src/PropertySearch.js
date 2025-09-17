import React, { useState, useEffect, useCallback, useRef } from 'react';

const PropertySearch = ({ 
  properties = [], 
  onSearchResults,
  placeholder = "Buscar imóveis por cidade, tipo ou características...",
  autoFocus = false,
  showSuggestionsEnabled = true 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Carregar histórico de busca do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('property_search_history');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (error) {
        console.error('Erro ao carregar histórico de busca:', error);
      }
    }
  }, []);

  // Auto focus
  useEffect(() => {
    if (autoFocus && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [autoFocus]);

  // Salvar no histórico
  const saveToHistory = useCallback((term) => {
    if (!term.trim() || term.length < 3) return;
    
    const newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('property_search_history', JSON.stringify(newHistory));
  }, [searchHistory]);

  // Função de busca principal
  const searchProperties = useCallback((term) => {
    if (!term.trim()) {
      onSearchResults(properties, term);
      return;
    }

    setIsSearching(true);
    
    const searchTermLower = term.toLowerCase().trim();
    const searchWords = searchTermLower.split(/\s+/);
    
    const results = properties.filter(property => {
      const searchableText = [
        property.titulo,
        property.descricao,
        property.cidade,
        property.endereco,
        property.tipo,
        property.bairro
      ].join(' ').toLowerCase();

      // Busca por todas as palavras (AND)
      const matchesAllWords = searchWords.every(word => 
        searchableText.includes(word)
      );

      // Busca por qualquer palavra (OR) para resultados mais amplos
      const matchesAnyWord = searchWords.some(word => 
        searchableText.includes(word)
      );

      // Priorizar matches exatos
      if (matchesAllWords) return true;
      
      // Se não encontrou match exato, aceitar match parcial apenas se for busca longa
      return searchWords.length === 1 ? matchesAnyWord : false;
    });

    // Ordenar resultados por relevância
    const sortedResults = results.sort((a, b) => {
      // Título tem prioridade
      const aTitleMatch = a.titulo?.toLowerCase().includes(searchTermLower) ? 1 : 0;
      const bTitleMatch = b.titulo?.toLowerCase().includes(searchTermLower) ? 1 : 0;
      
      if (aTitleMatch !== bTitleMatch) {
        return bTitleMatch - aTitleMatch;
      }
      
      // Depois cidade
      const aCityMatch = a.cidade?.toLowerCase().includes(searchTermLower) ? 1 : 0;
      const bCityMatch = b.cidade?.toLowerCase().includes(searchTermLower) ? 1 : 0;
      
      return bCityMatch - aCityMatch;
    });

    setTimeout(() => {
      setIsSearching(false);
      onSearchResults(sortedResults, term);
      if (sortedResults.length > 0) {
        saveToHistory(term);
      }
    }, 300);
    
  }, [properties, onSearchResults, saveToHistory]);

  // Gerar sugestões
  const generateSuggestions = useCallback((term) => {
    if (!term.trim() || term.length < 2) {
      setSuggestions([]);
      return;
    }

    const termLower = term.toLowerCase();
    const suggestionSet = new Set();

    // Sugestões de cidades
    properties.forEach(property => {
      if (property.cidade && property.cidade.toLowerCase().includes(termLower)) {
        suggestionSet.add({
          type: 'city',
          text: property.cidade,
          label: `${property.cidade} (cidade)`,
          icon: '📍'
        });
      }
    });

    // Sugestões de tipos
    const types = ['casa', 'apartamento', 'terreno', 'comercial', 'rural'];
    types.forEach(type => {
      if (type.includes(termLower)) {
        suggestionSet.add({
          type: 'propertyType',
          text: type,
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} (tipo)`,
          icon: '🏠'
        });
      }
    });

    // Sugestões de títulos
    properties.forEach(property => {
      if (property.titulo && property.titulo.toLowerCase().includes(termLower)) {
        suggestionSet.add({
          type: 'title',
          text: property.titulo,
          label: property.titulo,
          icon: '📄'
        });
      }
    });

    // Adicionar histórico se relevante
    searchHistory.forEach(historyItem => {
      if (historyItem.toLowerCase().includes(termLower)) {
        suggestionSet.add({
          type: 'history',
          text: historyItem,
          label: `${historyItem} (recente)`,
          icon: '🕐'
        });
      }
    });

    setSuggestions(Array.from(suggestionSet).slice(0, 8));
  }, [properties, searchHistory]);

  // Debounce para sugestões
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showSuggestionsEnabled) {
        generateSuggestions(searchTerm);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm, generateSuggestions, showSuggestionsEnabled]);

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      searchProperties(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, searchProperties]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestion >= 0) {
          selectSuggestion(suggestions[selectedSuggestion]);
        } else {
          setShowSuggestions(false);
          saveToHistory(searchTerm);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
        break;
      default:
        // Não fazer nada para outras teclas
        break;
    }
  };

  const selectSuggestion = (suggestion) => {
    setSearchTerm(suggestion.text);
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
    searchProperties(suggestion.text);
    saveToHistory(suggestion.text);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedSuggestion(-1);
    
    if (value.trim() && showSuggestionsEnabled) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleInputFocus = () => {
    if (searchTerm.trim() && showSuggestionsEnabled) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay para permitir clique nas sugestões
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedSuggestion(-1);
    }, 200);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
    onSearchResults(properties, '');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('property_search_history');
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-400 text-lg">
            {isSearching ? '⏳' : '🔍'}
          </span>
        </div>
        
        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
        />
        
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <span className="text-lg">✕</span>
          </button>
        )}
        
        {isSearching && (
          <div className="absolute inset-y-0 right-10 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.type}-${suggestion.text}-${index}`}
              onClick={() => selectSuggestion(suggestion)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0 ${
                index === selectedSuggestion ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <span className="text-lg">{suggestion.icon}</span>
              <div className="flex-1">
                <div className="text-gray-900">{suggestion.label}</div>
                {suggestion.type === 'history' && (
                  <div className="text-xs text-gray-500">Busca anterior</div>
                )}
              </div>
              {suggestion.type === 'history' && (
                <span className="text-xs text-gray-400">↗</span>
              )}
            </button>
          ))}
          
          {/* Clear History Option */}
          {searchHistory.length > 0 && suggestions.some(s => s.type === 'history') && (
            <div className="border-t border-gray-200">
              <button
                onClick={clearHistory}
                className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
              >
                🗑️ Limpar histórico de busca
              </button>
            </div>
          )}
        </div>
      )}

      {/* Search Stats */}
      {searchTerm && !isSearching && (
        <div className="mt-2 text-sm text-gray-600 text-center">
          {searchTerm.length < 3 ? 
            'Digite pelo menos 3 caracteres para buscar' : 
            `Buscando por "${searchTerm}"`
          }
        </div>
      )}

      {/* Quick Search Buttons */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {['Assunção', 'Casa', 'Apartamento', 'Terreno'].map(term => (
          <button
            key={term}
            onClick={() => {
              setSearchTerm(term);
              searchProperties(term);
              saveToHistory(term);
            }}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PropertySearch;