import React, { useState, useEffect, createContext, useContext } from 'react';

// Context para localização
const LocalizationContext = createContext();

// Hook para usar localização
export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within LocalizationProvider');
  }
  return context;
};

// Provider de localização
export const LocalizationProvider = ({ children }) => {
  const [currentLocale, setCurrentLocale] = useState('pt-BR');
  const [exchangeRates, setExchangeRates] = useState({
    USD_PYG: 7300,
    USD_BRL: 5.2,
    PYG_BRL: 0.00071,
    lastUpdate: new Date()
  });
  const [isLoading, setIsLoading] = useState(false);

  // Detectar localização baseada no IP ou configuração do browser
  const detectLocale = () => {
    const browserLang = navigator.language || navigator.userLanguage;
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Lógica de detecção simples
    if (browserLang.includes('es') || userTimezone.includes('Asuncion')) {
      return 'es-PY';
    }
    return 'pt-BR';
  };

  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') || detectLocale();
    setCurrentLocale(savedLocale);
    
    // Carregar taxas salvas no localStorage
    const savedRates = localStorage.getItem('exchangeRates');
    if (savedRates) {
      try {
        const parsedRates = JSON.parse(savedRates);
        // Verificar se as taxas não são muito antigas (mais de 1 hora)
        const now = new Date();
        const lastUpdate = new Date(parsedRates.lastUpdate);
        const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);
        
        if (hoursSinceUpdate < 1) {
          setExchangeRates(parsedRates);
        }
      } catch (error) {
        console.error('Erro ao carregar taxas salvas:', error);
      }
    }
  }, []);

  const changeLocale = (locale) => {
    setCurrentLocale(locale);
    localStorage.setItem('locale', locale);
    
    // Dispara evento customizado para outros componentes reagirem
    window.dispatchEvent(new CustomEvent('localeChange', { detail: locale }));
  };

  // Buscar cotações em tempo real
  const updateExchangeRates = async () => {
    setIsLoading(true);
    try {
      // Simular chamada para API de cotações
      // Em produção, substitua pela sua API preferida (ex: exchangerate-api.com)
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      
      if (response.ok) {
        const data = await response.json();
        const newRates = {
          USD_PYG: data.rates.PYG || 7300,
          USD_BRL: data.rates.BRL || 5.2,
          PYG_BRL: (data.rates.BRL / data.rates.PYG) || 0.00071,
          lastUpdate: new Date()
        };
        
        setExchangeRates(newRates);
        localStorage.setItem('exchangeRates', JSON.stringify(newRates));
      } else {
        throw new Error('Falha na API');
      }
    } catch (error) {
      console.error('Erro ao atualizar cotações, usando valores simulados:', error);
      
      // Fallback com valores simulados
      const variation = (Math.random() - 0.5) * 0.02; // Variação de ±2%
      const newRates = {
        USD_PYG: Math.round(7300 * (1 + variation)),
        USD_BRL: parseFloat((5.2 * (1 + variation)).toFixed(2)),
        PYG_BRL: parseFloat((0.00071 * (1 + variation)).toFixed(6)),
        lastUpdate: new Date()
      };
      
      setExchangeRates(newRates);
      localStorage.setItem('exchangeRates', JSON.stringify(newRates));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    updateExchangeRates();
    const interval = setInterval(updateExchangeRates, 300000); // 5 minutos
    return () => clearInterval(interval);
  }, []);

  const value = {
    currentLocale,
    changeLocale,
    exchangeRates,
    updateExchangeRates,
    isLoading
  };

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

// Textos traduzidos
const translations = {
  'pt-BR': {
    // Interface
    search: 'Buscar imóveis...',
    filters: 'Filtros',
    allCities: 'Todas as cidades',
    allTypes: 'Todos os tipos',
    clearFilters: 'Limpar filtros',
    results: 'imóveis encontrados',
    noResults: 'Nenhum imóvel encontrado',
    viewDetails: 'Ver Detalhes',
    contact: 'Contato',
    schedule: 'Agendar Visita',
    
    // Tipos de imóvel
    casa: 'Casa',
    apartamento: 'Apartamento',
    terreno: 'Terreno',
    comercial: 'Comercial',
    rural: 'Rural',
    
    // Formulário
    name: 'Seu nome',
    email: 'Seu email',
    phone: 'Seu telefone/WhatsApp',
    message: 'Sua mensagem',
    interest: 'Tipo de interesse',
    buy: 'Comprar imóvel',
    sell: 'Vender imóvel',
    rent: 'Alugar imóvel',
    invest: 'Investimento',
    evaluate: 'Avaliar imóvel',
    send: 'Enviar Mensagem',
    sending: 'Enviando...',
    
    // Detalhes
    price: 'Preço',
    city: 'Cidade',
    type: 'Tipo',
    area: 'Área',
    bedrooms: 'Quartos',
    bathrooms: 'Banheiros',
    description: 'Descrição',
    
    // Status
    available: 'Disponível',
    sold: 'Vendido',
    rented: 'Alugado',
    reserved: 'Reservado',
    
    // Mensagens
    successMessage: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
    errorMessage: 'Erro ao enviar mensagem. Tente novamente.',
    loading: 'Carregando...',
    
    // Especialização
    specialistTitle: 'Especialista em Investimentos Brasil-Paraguai',
    whatsappMessage: 'Olá! Tenho interesse neste imóvel',
    
    // Câmbio
    exchangeRates: 'Cotações Atuais',
    lastUpdate: 'Última atualização',
    refresh: 'Atualizar',
    usdToPyg: 'USD → PYG',
    usdToBrl: 'USD → BRL',
    pygToBrl: 'PYG → BRL',
    
    // Informações locais
    currency: 'R$',
    locale: 'pt-BR',
    country: 'Brasil',
    timezone: 'America/Sao_Paulo'
  },
  
  'es-PY': {
    // Interface
    search: 'Buscar propiedades...',
    filters: 'Filtros',
    allCities: 'Todas las ciudades',
    allTypes: 'Todos los tipos',
    clearFilters: 'Limpiar filtros',
    results: 'propiedades encontradas',
    noResults: 'No se encontraron propiedades',
    viewDetails: 'Ver Detalles',
    contact: 'Contacto',
    schedule: 'Agendar Visita',
    
    // Tipos de imóvel
    casa: 'Casa',
    apartamento: 'Apartamento',
    terreno: 'Terreno',
    comercial: 'Comercial',
    rural: 'Rural',
    
    // Formulário
    name: 'Tu nombre',
    email: 'Tu email',
    phone: 'Tu teléfono/WhatsApp',
    message: 'Tu mensaje',
    interest: 'Tipo de interés',
    buy: 'Comprar propiedad',
    sell: 'Vender propiedad',
    rent: 'Alquilar propiedad',
    invest: 'Inversión',
    evaluate: 'Evaluar propiedad',
    send: 'Enviar Mensaje',
    sending: 'Enviando...',
    
    // Detalhes
    price: 'Precio',
    city: 'Ciudad',
    type: 'Tipo',
    area: 'Área',
    bedrooms: 'Dormitorios',
    bathrooms: 'Baños',
    description: 'Descripción',
    
    // Status
    available: 'Disponible',
    sold: 'Vendido',
    rented: 'Alquilado',
    reserved: 'Reservado',
    
    // Mensagens
    successMessage: '¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.',
    errorMessage: 'Error al enviar mensaje. Inténtalo de nuevo.',
    loading: 'Cargando...',
    
    // Especialização
    specialistTitle: 'Especialista en Inversiones Brasil-Paraguay',
    whatsappMessage: '¡Hola! Me interesa esta propiedad',
    
    // Câmbio
    exchangeRates: 'Cotizaciones Actuales',
    lastUpdate: 'Última actualización',
    refresh: 'Actualizar',
    usdToPyg: 'USD → PYG',
    usdToBrl: 'USD → BRL',
    pygToBrl: 'PYG → BRL',
    
    // Informações locais
    currency: '₲',
    locale: 'es-PY',
    country: 'Paraguay',
    timezone: 'America/Asuncion'
  }
};

// Hook para tradução
export const useTranslation = () => {
  const { currentLocale } = useLocalization();
  
  const t = (key, params = {}) => {
    let text = translations[currentLocale]?.[key] || translations['pt-BR'][key] || key;
    
    // Substituir parâmetros no texto (ex: "{{count}} results" com {count: 5})
    Object.keys(params).forEach(param => {
      text = text.replace(`{{${param}}}`, params[param]);
    });
    
    return text;
  };
  
  return { t, currentLocale, translations: translations[currentLocale] };
};

// Componente seletor de idioma/país
export const LanguageSelector = ({ className = "" }) => {
  const { currentLocale, changeLocale } = useLocalization();
  
  const locales = [
    { code: 'pt-BR', label: 'Português (Brasil)', flag: '🇧🇷' },
    { code: 'es-PY', label: 'Español (Paraguay)', flag: '🇵🇾' }
  ];
  
  return (
    <div className={`relative inline-block ${className}`}>
      <select
        value={currentLocale}
        onChange={(e) => changeLocale(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        {locales.map(locale => (
          <option key={locale.code} value={locale.code}>
            {locale.flag} {locale.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
        </svg>
      </div>
    </div>
  );
};

// Componente formatador de preço multi-moeda
export const PriceFormatter = ({ 
  price, 
  showAllCurrencies = false, 
  className = "", 
  size = "normal" 
}) => {
  const { currentLocale, exchangeRates } = useLocalization();
  const { t } = useTranslation();
  
  if (!price || price <= 0) {
    return (
      <span className={`${className} text-gray-500`}>
        {t('consultPrice', 'Consultar preço')}
      </span>
    );
  }
  
  const formatCurrency = (amount, currency, locale) => {
    const currencyMap = {
      'pt-BR': { currency: 'BRL', symbol: 'R$' },
      'es-PY': { currency: 'PYG', symbol: '₲' }
    };
    
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    }
    
    const config = currencyMap[locale];
    if (config) {
      try {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: config.currency,
          minimumFractionDigits: currency === 'PYG' ? 0 : 2,
          maximumFractionDigits: currency === 'PYG' ? 0 : 2
        }).format(amount);
      } catch {
        return `${config.symbol} ${amount.toLocaleString(locale)}`;
      }
    }
    
    return `${config?.symbol || '$'} ${amount.toLocaleString()}`;
  };
  
  const convertPrice = (usdPrice, targetCurrency) => {
    switch (targetCurrency) {
      case 'PYG':
        return usdPrice * exchangeRates.USD_PYG;
      case 'BRL':
        return usdPrice * exchangeRates.USD_BRL;
      default:
        return usdPrice;
    }
  };

  const sizeClasses = {
    small: 'text-sm',
    normal: 'text-lg',
    large: 'text-xl'
  };
  
  if (showAllCurrencies) {
    return (
      <div className={className}>
        <div className={`${sizeClasses[size]} font-bold text-green-600`}>
          {formatCurrency(price, 'USD')}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          <div>{formatCurrency(convertPrice(price, 'PYG'), 'PYG', 'es-PY')}</div>
          <div>{formatCurrency(convertPrice(price, 'BRL'), 'BRL', 'pt-BR')}</div>
        </div>
      </div>
    );
  }
  
  // Mostrar preço na moeda local + USD
  const localCurrency = currentLocale === 'es-PY' ? 'PYG' : 'BRL';
  const localPrice = convertPrice(price, localCurrency);
  
  return (
    <div className={className}>
      <div className={`${sizeClasses[size]} font-bold text-green-600`}>
        {formatCurrency(localPrice, localCurrency, currentLocale)}
      </div>
      <div className="text-sm text-gray-500 mt-1">
        {formatCurrency(price, 'USD')}
      </div>
    </div>
  );
};

// Componente informações de câmbio
export const ExchangeRateInfo = ({ className = "" }) => {
  const { exchangeRates, updateExchangeRates, isLoading } = useLocalization();
  const { t } = useTranslation();
  
  const formatRate = (rate) => {
    if (rate < 1) {
      return rate.toFixed(6);
    } else if (rate < 100) {
      return rate.toFixed(2);
    } else {
      return Math.round(rate).toLocaleString();
    }
  };
  
  const formatLastUpdate = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Agora mesmo';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min atrás`;
    } else {
      const diffInHours = Math.floor(diffInMinutes / 60);
      return `${diffInHours}h atrás`;
    }
  };
  
  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-semibold text-blue-800 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
          </svg>
          {t('exchangeRates')}
        </h4>
        <button
          onClick={updateExchangeRates}
          disabled={isLoading}
          className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center space-x-1 disabled:opacity-50 transition-colors"
        >
          <svg 
            className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{t('refresh')}</span>
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="text-center p-2 bg-white rounded border">
          <div className="font-medium text-gray-700">{t('usdToPyg')}</div>
          <div className="text-lg font-bold text-green-600 mt-1">
            ₲{formatRate(exchangeRates.USD_PYG)}
          </div>
        </div>
        
        <div className="text-center p-2 bg-white rounded border">
          <div className="font-medium text-gray-700">{t('usdToBrl')}</div>
          <div className="text-lg font-bold text-green-600 mt-1">
            R${formatRate(exchangeRates.USD_BRL)}
          </div>
        </div>
        
        <div className="text-center p-2 bg-white rounded border">
          <div className="font-medium text-gray-700">{t('pygToBrl')}</div>
          <div className="text-lg font-bold text-green-600 mt-1">
            {formatRate(exchangeRates.PYG_BRL)}
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 mt-2 text-center">
        {t('lastUpdate')}: {formatLastUpdate(exchangeRates.lastUpdate)}
      </div>
    </div>
  );
};

// Componente para formatação de números localizados
export const NumberFormatter = ({ number, type = "decimal", className = "" }) => {
  const { currentLocale } = useLocalization();
  
  const formatNumber = (num, numType) => {
    if (isNaN(num)) return '-';
    
    const locale = currentLocale === 'es-PY' ? 'es-PY' : 'pt-BR';
    
    switch (numType) {
      case 'area':
        return new Intl.NumberFormat(locale, {
          maximumFractionDigits: 0
        }).format(num) + ' m²';
      case 'percentage':
        return new Intl.NumberFormat(locale, {
          style: 'percent',
          minimumFractionDigits: 1,
          maximumFractionDigits: 2
        }).format(num / 100);
      default:
        return new Intl.NumberFormat(locale).format(num);
    }
  };
  
  return (
    <span className={className}>
      {formatNumber(number, type)}
    </span>
  );
};

// Componente para formatação de datas localizadas
export const DateFormatter = ({ date, format = "short", className = "" }) => {
  const { currentLocale } = useLocalization();
  
  const formatDate = (dateValue, formatType) => {
    if (!dateValue) return '-';
    
    const dateObj = new Date(dateValue);
    if (isNaN(dateObj.getTime())) return '-';
    
    const locale = currentLocale === 'es-PY' ? 'es-PY' : 'pt-BR';
    
    const formats = {
      short: { day: '2-digit', month: '2-digit', year: 'numeric' },
      long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
      medium: { day: 'numeric', month: 'short', year: 'numeric' }
    };
    
    return new Intl.DateTimeFormat(locale, formats[formatType]).format(dateObj);
  };
  
  return (
    <span className={className}>
      {formatDate(date, format)}
    </span>
  );
};

// Hook para detectar mudanças de localização
export const useLocaleChange = (callback) => {
  useEffect(() => {
    const handleLocaleChange = (event) => {
      callback(event.detail);
    };
    
    window.addEventListener('localeChange', handleLocaleChange);
    return () => window.removeEventListener('localeChange', handleLocaleChange);
  }, [callback]);
};

// Exemplo de uso completo
export const LocalizationExample = () => {
  const { t } = useTranslation();
  const [samplePrice] = useState(150000);
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('specialistTitle')}
        </h1>
        <LanguageSelector />
      </div>
      
      <ExchangeRateInfo />
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">{t('price')}</h3>
          <PriceFormatter 
            price={samplePrice} 
            showAllCurrencies={true}
            size="large" 
          />
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Formatação</h3>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Área:</strong> <NumberFormatter number={120} type="area" />
            </div>
            <div>
              <strong>Data:</strong> <DateFormatter date={new Date()} format="long" />
            </div>
            <div>
              <strong>Porcentagem:</strong> <NumberFormatter number={15.5} type="percentage" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};