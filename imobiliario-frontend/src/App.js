import React, { useState, useEffect, useCallback } from 'react';
import PropertyDetails from './PropertyDetails';
import { 
  LocalizationProvider, 
  useTranslation, 
  LanguageSelector, 
  PriceFormatter,
  ExchangeRateInfo 
} from './localization';
import SearchSystem from './components/SearchSystem';
// eslint-disable-next-line no-unused-vars
import ImageGallery from './ImageGallery';
import CRMLeads from './CRMLeads';
// eslint-disable-next-line no-unused-vars
import PropertyMap from './PropertyMap';
import { TenantProvider, useTenant } from './contexts/TenantContext';
import TenantSelector from './TenantSelector';

// Componente Header
const Header = ({ cliente }) => {
  const { t } = useTranslation();
  const [showCRM, setShowCRM] = useState(false);
  
  return (
    <header className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            {cliente?.nome || t('specialistTitle')}
          </h1>
          <p className="text-blue-100">{cliente?.email_contato || 'Carregando...'}</p>
        </div>
        <nav className="flex space-x-4 items-center">
          <TenantSelector />
          <button className="bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded transition-colors">
            Imóveis
          </button>
          <button 
            onClick={() => setShowCRM(!showCRM)}
            className="bg-purple-500 hover:bg-purple-700 px-4 py-2 rounded transition-colors"
          >
            CRM
          </button>
          <button className="bg-green-500 hover:bg-green-700 px-4 py-2 rounded transition-colors">
            {t('contact')}
          </button>
          <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors">
            WhatsApp
          </button>
          <LanguageSelector className="ml-4" />
        </nav>
      </div>
      
      {/* CRM Panel */}
      {showCRM && (
        <div className="container mx-auto mt-4">
          <div className="bg-white rounded-lg shadow-lg">
            <CRMLeads />
          </div>
        </div>
      )}
    </header>
  );
};

// Componente Card de Imóvel
const ImovelCard = ({ imovel, onViewDetails, onWhatsApp }) => {
  const [imageError, setImageError] = useState(false);
  const { t } = useTranslation();
  
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <div className="relative h-48 bg-gray-200">
        {imovel.imagens && imovel.imagens.length > 0 ? (
          <img
            src={imageError ? '/placeholder-house.jpg' : `http://localhost:1337${imovel.imagens[0].url}`}
            alt={imovel.titulo}
            className="w-full h-full object-cover"
            onError={() => {
              setImageError(true);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">🏠</div>
              <p className="text-sm">Sem imagem</p>
            </div>
          </div>
        )}

        {imovel.ativo && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
            {t('available')}
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-gray-800 line-clamp-2">
          {imovel.titulo}
        </h3>

        <p className="text-gray-600 mb-2 flex items-center">
          <span className="mr-1">📍</span>
          {imovel.cidade}
        </p>

        <div className="mb-3">
          <PriceFormatter price={imovel.preco} />
        </div>

        <div className="flex flex-wrap gap-2 mb-4 text-sm text-gray-600">
          {imovel.area && (
            <span className="bg-gray-100 px-2 py-1 rounded">
              📐 {imovel.area}m²
            </span>
          )}
          {imovel.quartos && (
            <span className="bg-gray-100 px-2 py-1 rounded">
              🛏️ {imovel.quartos} {t('bedrooms')}
            </span>
          )}
          {imovel.banheiros && (
            <span className="bg-gray-100 px-2 py-1 rounded">
              🚿 {imovel.banheiros} {t('bathrooms')}
            </span>
          )}
          {imovel.tipo && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {t(imovel.tipo)}
            </span>
          )}
        </div>

        <p className="text-gray-700 mb-4 line-clamp-3 text-sm">
          {imovel.descricao}
        </p>

        <div className="flex space-x-2">
          <button
            onClick={() => onViewDetails(imovel)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors text-sm font-medium"
          >
            {t('viewDetails')}
          </button>
          <button
            onClick={() => onWhatsApp(imovel)}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition-colors text-sm font-medium"
          >
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente Formulário de Lead
const LeadForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    mensagem: '',
    origem: 'site',
    interesse: ''
  });
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nome || !formData.email) {
      alert('Por favor, preencha pelo menos nome e email.');
      return;
    }

    setEnviando(true);
    try {
      await onSubmit(formData);
      setFormData({ nome: '', email: '', telefone: '', mensagem: '', origem: 'site', interesse: '' });
      setSucesso(true);
      setTimeout(() => setSucesso(false), 5000);
    } catch (error) {
      console.error('Erro no envio:', error);
      alert(t('errorMessage'));
    } finally {
      setEnviando(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (sucesso) {
    return (
      <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-2">✅</div>
          <h3 className="text-xl font-semibold text-green-800 mb-2">
            {t('successMessage')}
          </h3>
          <p className="text-green-600 mb-4">
            Entraremos em contato em breve pelo WhatsApp ou email.
          </p>
          <button
            onClick={() => setSucesso(false)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Enviar Nova Mensagem
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Interessado? Entre em contato!</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            name="nome"
            placeholder={t('name')}
            value={formData.nome}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:border-blue-500 focus:outline-none"
            required
          />
          <input
            type="email"
            name="email"
            placeholder={t('email')}
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:border-blue-500 focus:outline-none"
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="tel"
            name="telefone"
            placeholder={t('phone')}
            value={formData.telefone}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:border-blue-500 focus:outline-none"
          />
          <select
            name="interesse"
            value={formData.interesse}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="">{t('interest')}</option>
            <option value="comprar">{t('buy')}</option>
            <option value="vender">{t('sell')}</option>
            <option value="alugar">{t('rent')}</option>
            <option value="investir">{t('invest')}</option>
            <option value="avaliar">{t('evaluate')}</option>
          </select>
        </div>

        <textarea
          name="mensagem"
          placeholder={t('message')}
          value={formData.mensagem}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg h-24 focus:border-blue-500 focus:outline-none resize-none"
          rows={3}
        />

        <button
          type="submit"
          disabled={enviando}
          className={`w-full py-3 rounded-lg font-semibold transition-colors ${
            enviando
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {enviando ? t('sending') : t('send')}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Ao enviar, você concorda em ser contatado via WhatsApp, email ou telefone.
        </p>
      </form>
    </div>
  );
};

// Componente principal App - ÚNICA MUDANÇA: Movido o useTenant() para cá
function App() {
  const [cliente, setCliente] = useState(null);
  const [imoveis, setImoveis] = useState([]);
  const [imoveisFiltrados, setImoveisFiltrados] = useState([]);
  const [corretores, setCorretores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  
  // MOVIDO PARA DENTRO: Agora useTenant() é chamado dentro do TenantProvider
  const { tenant, loading: tenantLoading } = useTenant();
  const { t } = useTranslation();
  const API_BASE = 'http://localhost:1337/api';

  const handleViewDetails = useCallback((imovel) => {
    setSelectedProperty(imovel);
    setShowPropertyModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowPropertyModal(false);
    setSelectedProperty(null);
  }, []);

  const handleWhatsApp = useCallback((imovel) => {
    const message = `${t('whatsappMessage')}: ${imovel.titulo} - ${imovel.preco ? `US$ ${imovel.preco.toLocaleString()}` : 'Consultar preço'}`;
    const phoneNumber = '595XXXXXXXXX';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }, [t]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErro(null);

    try {
      const requests = [
        fetch(`${API_BASE}/clientes`).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/imovels?populate=*`).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/corretors`).catch(() => ({ ok: false }))
      ];

      console.log('URL da API:', `${API_BASE}/imovels?populate=*`);

      const [clientesResponse, imoveisResponse, corretoresResponse] = await Promise.all(requests);

      if (clientesResponse.ok) {
        const clienteData = await clientesResponse.json();
        setCliente(clienteData.data?.[0] || null);
      }

      if (imoveisResponse.ok) {
        const imoveisData = await imoveisResponse.json();
        console.log('Total de imóveis recebidos:', imoveisData.data?.length);
        
        let properties = imoveisData.data || [];
        
        // DEBUG do tenant - CORRIGIDO: agora tenant será definido
        console.log('=== TENANT DEBUG ===');
        console.log('tenant objeto completo:', tenant);
        console.log('tenant?.id:', tenant?.id);
        console.log('tenant?.nome:', tenant?.nome);
        console.log('Condição tenant?.id && tenant.id !== default:', tenant?.id && tenant.id !== 'default');
        
        // Sistema multi-tenant inteligente
        if (tenant?.id && tenant.id !== 'default') {
          const originalCount = properties.length;
          
          properties = properties.filter(imovel => {
            const hasCorrectClient = imovel.cliente && 
                                   imovel.cliente.id && 
                                   imovel.cliente.id.toString() === tenant.id.toString();
            
            const hasNoClient = !imovel.cliente;
            
            return hasCorrectClient || hasNoClient;
          });
          
          console.log(`Filtro tenant "${tenant.nome}": ${originalCount} → ${properties.length} imóveis`);
          console.log('- Imóveis do cliente + imóveis sem cliente definido');
        } else {
          console.log('Nenhum tenant específico, mostrando todos os imóveis');
        }
        
        if (properties.length > 0) {
          console.log('Primeiro imóvel:', properties[0].titulo);
        }
        
        setImoveis(properties);
        setImoveisFiltrados(properties);
      }

      if (corretoresResponse.ok) {
        const corretoresData = await corretoresResponse.json();
        setCorretores(corretoresData.data || []);
      }

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setErro('Erro ao carregar dados. Verifique se o servidor está rodando.');
    } finally {
      setLoading(false);
    }
  }, [API_BASE, tenant]);

  const criarLead = useCallback(async (dadosLead) => {
    try {
      const response = await fetch(`${API_BASE}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            ...dadosLead,
            origem: 'site'
          }
        }),
      });

      if (response.ok) {
        return true;
      } else {
        throw new Error('Erro ao enviar mensagem');
      }
    } catch (error) {
      console.error('Erro ao criar lead:', error);
      throw error;
    }
  }, [API_BASE]);

  const handleSearchResults = useCallback((results) => {
    setImoveisFiltrados(results);
  }, []);

  // AGUARDAR TENANT CARREGAR: Só busca dados quando tenant estiver pronto
  useEffect(() => {
    if (!tenantLoading) {
      fetchData();
    }
  }, [fetchData, tenantLoading]);

  // LOADING COMBINADO: Aguarda tanto tenant quanto dados
  if (loading || tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700 mb-2">{t('loading')}</div>
          <div className="text-gray-500">
            {tenantLoading ? 'Configurando tenant...' : 'Conectando com o servidor...'}
          </div>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erro de Conexão</h2>
          <p className="text-gray-700 mb-4">{erro}</p>
          <button
            onClick={fetchData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      
      <Header cliente={cliente} />

      <main className="container mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Encontre o Imóvel dos Seus Sonhos
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {t('specialistTitle')}
          </p>

          <div className="mb-8">
            <SearchSystem
              properties={imoveis}
              onSearchResults={handleSearchResults}
              onFiltersChange={(filters) => console.log('Filtros aplicados:', filters)}
            />
          </div>

          <ExchangeRateInfo className="max-w-4xl mx-auto mb-8" />
        </section>

        <section className="mb-6">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              {imoveisFiltrados.length} {t('results')}
              {tenant?.nome && (
                <span className="ml-2 text-blue-600 font-medium">
                  - {tenant.nome}
                </span>
              )}
            </p>
          </div>
        </section>

        <section className="mb-12">
          {imoveisFiltrados.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {imoveisFiltrados.map((imovel) => (
                <ImovelCard
                  key={imovel.id || imovel.documentId}
                  imovel={imovel}
                  onViewDetails={handleViewDetails}
                  onWhatsApp={handleWhatsApp}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {t('noResults')}
              </h3>
              <p className="text-gray-500">
                Tente ajustar os filtros ou termos de busca
              </p>
            </div>
          )}
        </section>

        <section className="grid md:grid-cols-2 gap-8">
          <LeadForm onSubmit={criarLead} />

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Nossa Equipe</h3>
            {corretores.length > 0 ? (
              corretores.map((corretor) => (
                <div key={corretor.id || corretor.documentId} className="mb-4 p-4 bg-gray-50 rounded border">
                  <h4 className="font-semibold text-lg">{corretor.nome}</h4>
                  {corretor.especialidade && (
                    <p className="text-gray-600 text-sm">{corretor.especialidade}</p>
                  )}
                  <p className="text-blue-600 mt-1">{corretor.email}</p>
                  {corretor.telefone && (
                    <p className="text-gray-700">{corretor.telefone}</p>
                  )}
                  <button className="mt-2 bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded text-sm">
                    WhatsApp
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-600">Carregando informações da equipe...</p>
            )}
          </div>
        </section>
      </main>

      {showPropertyModal && (
        <PropertyDetails
          imovel={selectedProperty}
          onClose={handleCloseModal}
        />
      )}

      <footer className="bg-gray-800 text-white p-8 mt-12">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {cliente?.nome || t('specialistTitle')}
              </h3>
              <p className="text-gray-300">{cliente?.email_contato || 'contato@imobiliaria.com'}</p>
              <p className="text-gray-300">{t('specialistTitle')}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Links Úteis</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#imoveis" className="hover:text-white">Imóveis</a></li>
                <li><a href="#sobre" className="hover:text-white">Sobre</a></li>
                <li><a href="#contato" className="hover:text-white">Contato</a></li>
                <li><a href="#blog" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('contact')}</h4>
              <div className="space-y-2 text-gray-300">
                <p>📱 WhatsApp: +595 XXX XXX XXX</p>
                <p>📧 Email: contato@exemplo.com</p>
                <p>📍 Assunção, Paraguai</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-400">
            <p>© 2025 Sistema Imobiliário White Label - Todos os direitos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// MANTIDO IGUAL: Estrutura original preservada
const AppWithLocalization = () => (
  <TenantProvider>
    <LocalizationProvider>
      <App />
    </LocalizationProvider>
  </TenantProvider>
);

export default AppWithLocalization;