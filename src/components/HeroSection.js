// src/components/HeroSection.js
import React, { useState } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useTranslation } from '../localization';

const HeroSection = ({ onSearch, stats }) => {
  const { tenant } = useTenant();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  const quickSearches = [
    { label: 'Casas', value: 'casa', icon: '🏠' },
    { label: 'Apartamentos', value: 'apartamento', icon: '🏢' },
    { label: 'Comercial', value: 'comercial', icon: '🏪' },
    { label: 'Terrenos', value: 'terreno', icon: '🏞️' }
  ];

  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background com gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
        {/* Padrão geométrico */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }} />
        </div>
        
        {/* Efeito de sobreposição */}
        <div className="absolute inset-0 bg-black bg-opacity-20" />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 text-center text-white">
        {/* Título Principal */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
            {tenant?.nome || 'Encontre seu'}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              Imóvel dos Sonhos
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-2 max-w-3xl mx-auto leading-relaxed">
            {tenant?.descricao || 'Especialistas em imóveis com as melhores oportunidades do mercado'}
          </p>
          
          {stats && (
            <p className="text-lg text-blue-200">
              Mais de <span className="font-bold text-yellow-400">{stats.total}</span> imóveis disponíveis
              {stats.cidades.length > 0 && (
                <span> em <span className="font-bold">{stats.cidades.length}</span> cidades</span>
              )}
            </p>
          )}
        </div>

        {/* Barra de Busca */}
        <div className="mb-12">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-2 flex items-center">
              <div className="flex-1 flex items-center">
                <svg className="w-6 h-6 text-gray-400 ml-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar por imóveis, cidade, bairro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 py-4 text-lg text-gray-800 placeholder-gray-500 border-none outline-none bg-transparent"
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Buscar
              </button>
            </div>
          </form>

          {/* Busca Rápida */}
          <div className="mt-6">
            <p className="text-blue-200 mb-4 text-sm">Busca rápida:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {quickSearches.map((item) => (
                <button
                  key={item.value}
                  onClick={() => onSearch(item.value)}
                  className="bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-sm border border-white border-opacity-20 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center space-x-2"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
              <div className="text-3xl font-bold text-yellow-400 mb-2">
                {stats.total}
              </div>
              <div className="text-blue-100 text-sm">
                Imóveis Disponíveis
              </div>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {stats.cidades.length}
              </div>
              <div className="text-blue-100 text-sm">
                Cidades Atendidas
              </div>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
              <div className="text-3xl font-bold text-orange-400 mb-2">
                {stats.tipos.length}
              </div>
              <div className="text-blue-100 text-sm">
                Tipos de Imóvel
              </div>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {stats.precoMedio ? `$${(stats.precoMedio / 1000).toFixed(0)}K` : 'N/A'}
              </div>
              <div className="text-blue-100 text-sm">
                Preço Médio
              </div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              <span>Fale no WhatsApp</span>
            </button>
            
            <button className="bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300">
              Ver Todos os Imóveis
            </button>
          </div>
        </div>
      </div>

      {/* Elemento decorativo */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" fill="none" className="w-full h-16 text-white">
          <path d="M0,120 L1200,120 L1200,0 C800,80 400,40 0,0 Z" fill="currentColor"/>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;