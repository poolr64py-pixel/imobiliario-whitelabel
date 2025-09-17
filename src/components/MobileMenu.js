// src/components/MobileMenu.js
import React, { useState, useEffect } from 'react';

const MobileMenu = ({ 
  isOpen, 
  onClose, 
  searchTerm, 
  onSearchChange,
  onNavigate,
  stats = null 
}) => {
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [activeSection, setActiveSection] = useState('home');

  // Sincronizar com o searchTerm externo
  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  // Fechar menu ao clicar fora ou ESC
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.mobile-menu-container')) {
        onClose();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (localSearch.trim()) {
      onSearchChange(localSearch.trim());
      onClose();
    }
  };

  const handleNavigation = (section, href = null) => {
    setActiveSection(section);
    onClose();
    
    if (href) {
      // Scroll suave para seção
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
    
    if (onNavigate) {
      onNavigate(section);
    }
  };

  const handleQuickSearch = (term) => {
    setLocalSearch(term);
    onSearchChange(term);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay com blur */}
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300" />
      
      {/* Menu Container */}
      <div className="mobile-menu-container fixed inset-y-0 right-0 max-w-sm w-full bg-white shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-out">
        <div className="flex flex-col h-full">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Menu</h3>
              {stats && (
                <p className="text-sm text-gray-600 mt-1">
                  {stats.total} imóveis disponíveis
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-white hover:shadow-md transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Busca */}
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar imóveis, cidade, tipo..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full pl-12 pr-16 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-600 hover:text-blue-700"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>

              {/* Filtros rápidos */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Casas', value: 'casa', icon: '🏠', color: 'from-green-400 to-green-500' },
                  { label: 'Apartamentos', value: 'apartamento', icon: '🏢', color: 'from-blue-400 to-blue-500' },
                  { label: 'Comercial', value: 'comercial', icon: '🏪', color: 'from-purple-400 to-purple-500' },
                  { label: 'Terrenos', value: 'terreno', icon: '🏞️', color: 'from-yellow-400 to-orange-500' }
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => handleQuickSearch(filter.value)}
                    className={`p-3 rounded-lg bg-gradient-to-r ${filter.color} text-white text-sm font-medium hover:scale-105 transform transition-all duration-200 shadow-sm flex items-center space-x-2`}
                  >
                    <span>{filter.icon}</span>
                    <span>{filter.label}</span>
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* Navegação */}
          <nav className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-2">
              {[
                { 
                  id: 'home', 
                  label: 'Início', 
                  href: '#top', 
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  )
                },
                { 
                  id: 'properties', 
                  label: 'Imóveis', 
                  href: '#imoveis', 
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  )
                },
                { 
                  id: 'about', 
                  label: 'Sobre Nós', 
                  href: '#sobre', 
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )
                },
                { 
                  id: 'contact', 
                  label: 'Contato', 
                  href: '#contato', 
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )
                }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id, item.href)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    activeSection === item.id
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  <div className={activeSection === item.id ? 'text-blue-500' : 'text-gray-400'}>
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Seção de Estatísticas */}
            {stats && (
              <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Nossos Números</h4>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-lg font-bold text-blue-600">{stats.total}</div>
                    <div className="text-xs text-gray-600">Imóveis</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-lg font-bold text-green-600">{stats.cidades?.length || 0}</div>
                    <div className="text-xs text-gray-600">Cidades</div>
                  </div>
                </div>
              </div>
            )}
          </nav>

          {/* Footer com contatos */}
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-800 text-center mb-4">
                Entre em Contato
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="tel:+595718400"
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Ligar</span>
                </a>

                <a
                  href="https://wa.me/595718400?text=Olá! Tenho interesse nos imóveis disponíveis."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors text-sm font-medium shadow-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  <span>WhatsApp</span>
                </a>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-gray-500">
                  Atendimento: Segunda a Sexta, 8h às 18h
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;