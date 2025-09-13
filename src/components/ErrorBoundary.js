// src/components/ErrorBoundary.js
import React from 'react';

// Error Boundary principal para capturar erros React
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const errorId = Date.now().toString();
    
    this.setState({
      error: error,
      errorInfo: errorInfo,
      errorId: errorId
    });

    // Log detalhado do erro
    console.group(`🚨 Error Boundary - ${errorId}`);
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();

    // Aqui você pode integrar com serviços como Sentry
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  render() {
    if (this.state.hasError) {
      // UI customizada para diferentes tipos de erro
      const isNetworkError = this.state.error?.message?.includes('fetch') || 
                            this.state.error?.message?.includes('network');
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full">
            {/* Card de erro */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              {/* Ícone de erro */}
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isNetworkError ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2v6m0 8v6m8-10h-6M4 12h6" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  )}
                </svg>
              </div>

              {/* Título */}
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {isNetworkError ? 'Erro de Conexão' : 'Ops! Algo deu errado'}
              </h3>

              {/* Descrição */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                {isNetworkError 
                  ? 'Não foi possível conectar com o servidor. Verifique sua conexão com a internet.'
                  : 'Ocorreu um erro inesperado. Nossa equipe foi notificada automaticamente.'
                }
              </p>

              {/* Ações */}
              <div className="flex flex-col space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Tentar Novamente
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="text-gray-600 hover:text-gray-800 transition-colors font-medium"
                >
                  Recarregar Página
                </button>
              </div>

              {/* ID do erro para suporte */}
              {this.state.errorId && (
                <p className="mt-6 text-xs text-gray-400">
                  ID do Erro: {this.state.errorId}
                </p>
              )}

              {/* Detalhes em desenvolvimento */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Detalhes Técnicos (Desenvolvimento)
                  </summary>
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                    <pre className="text-xs text-red-600 overflow-auto whitespace-pre-wrap">
                      {this.state.error.toString()}
                    </pre>
                    <pre className="mt-2 text-xs text-gray-600 overflow-auto whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </details>
              )}
            </div>

            {/* Link de suporte */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Precisa de ajuda?{' '}
                <a 
                  href="mailto:suporte@suaimobiliaria.com" 
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Entre em contato
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Componente para erros de API/Network
export const ApiError = ({ 
  error, 
  onRetry = null, 
  className = "",
  variant = 'default' // 'default', 'inline', 'banner'
}) => {
  const getErrorMessage = () => {
    if (error?.message) return error.message;
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.response?.data?.error?.message) return error.response.data.error.message;
    
    if (error?.response?.status) {
      switch (error.response.status) {
        case 400:
          return "Dados inválidos enviados";
        case 401:
          return "Acesso não autorizado";
        case 403:
          return "Acesso negado";
        case 404:
          return "Dados não encontrados";
        case 429:
          return "Muitas tentativas. Tente novamente em alguns minutos";
        case 500:
          return "Erro interno do servidor";
        case 502:
          return "Servidor temporariamente indisponível";
        case 503:
          return "Serviço em manutenção";
        default:
          return `Erro ${error.response.status}: ${error.response.statusText || 'Erro desconhecido'}`;
      }
    }
    
    if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('fetch')) {
      return "Erro de conexão. Verifique sua internet";
    }
    
    return "Ocorreu um erro inesperado";
  };

  const getErrorType = () => {
    if (error?.response?.status >= 500) return 'server';
    if (error?.code === 'NETWORK_ERROR') return 'network';
    if (error?.response?.status === 404) return 'notfound';
    return 'client';
  };

  const errorType = getErrorType();
  const errorMessage = getErrorMessage();

  // Variante banner
  if (variant === 'banner') {
    return (
      <div className={`bg-red-50 border-l-4 border-red-400 p-4 ${className}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm text-red-700 font-medium">
              {errorMessage}
            </p>
            {onRetry && (
              <div className="mt-2">
                <button
                  onClick={onRetry}
                  className="text-sm text-red-600 hover:text-red-500 font-medium underline"
                >
                  Tentar novamente
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Variante inline
  if (variant === 'inline') {
    return (
      <div className={`flex items-center space-x-2 text-red-600 text-sm ${className}`}>
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <span>{errorMessage}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-blue-600 hover:text-blue-700 underline ml-2"
          >
            Repetir
          </button>
        )}
      </div>
    );
  }

  // Variante padrão (card)
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {errorType === 'network' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2v6m0 8v6m8-10h-6M4 12h6" />
            ) : errorType === 'server' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            )}
          </svg>
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            {errorType === 'network' && 'Erro de Conexão'}
            {errorType === 'server' && 'Erro do Servidor'}
            {errorType === 'notfound' && 'Não Encontrado'}
            {errorType === 'client' && 'Erro'}
          </h3>
          <p className="text-red-700 mb-4">
            {errorMessage}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-red-100 text-red-800 px-4 py-2 rounded-md text-sm hover:bg-red-200 transition-colors font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Tentar Novamente
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente para estado vazio
export const EmptyState = ({ 
  title = "Nenhum resultado encontrado",
  description = "Tente ajustar seus filtros ou termos de busca",
  icon = "search",
  action = null,
  className = "",
  size = 'default' // 'compact', 'default', 'large'
}) => {
  const icons = {
    search: (
      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    home: (
      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    filter: (
      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
      </svg>
    ),
    inbox: (
      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    )
  };

  const sizeClasses = {
    compact: 'py-8',
    default: 'py-12',
    large: 'py-16'
  };

  return (
    <div className={`text-center ${sizeClasses[size]} ${className}`}>
      <div className="flex justify-center mb-4">
        {icons[icon]}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        {description}
      </p>
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
};

// Hook para lidar com erros de forma consistente
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const handleError = React.useCallback((error) => {
    console.error('Erro capturado pelo useErrorHandler:', error);
    setError(error);
    
    // Auto-limpar erro após 10 segundos
    const timeoutId = setTimeout(() => setError(null), 10000);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
};

// HOC para wrapping de componentes com error boundary
export const withErrorBoundary = (Component, errorFallback = null) => {
  return function WithErrorBoundaryComponent(props) {
    return (
      <ErrorBoundary>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};