import React, { useState, useEffect, useRef } from 'react';
import { useTenant } from './contexts/TenantContext';

const TenantSelector = () => {
  const { tenant, switchTenant, loading } = useTenant();
  const [tenants, setTenants] = useState([]);
  const [showSelector, setShowSelector] = useState(false);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [switchingTenant, setSwitchingTenant] = useState(false); // ✅ Estado para controlar loading do switch
  const selectorRef = useRef(null); // ✅ Ref para controlar cliques fora

  const fetchAvailableTenants = async () => {
    setLoadingTenants(true);
    try {
      const response = await fetch('http://localhost:1337/api/clientes');
      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        setTenants(data.data);
        console.log('Tenants carregados:', data.data.length);
      } else {
        setTenants([]);
      }
    } catch (error) {
      console.error('Erro ao buscar tenants:', error);
      setTenants([]);
    } finally {
      setLoadingTenants(false);
    }
  };

  useEffect(() => {
    fetchAvailableTenants();
  }, []);

  // ✅ Fechar seletor ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setShowSelector(false);
      }
    };

    if (showSelector) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSelector]);

  // ✅ Função melhorada para troca de tenant com tratamento de erro detalhado
  const handleTenantSwitch = async (tenantId, tenantName) => {
    if (tenant?.id?.toString() === tenantId.toString()) {
      console.log('Tentando trocar para o mesmo tenant, ignorando...');
      setShowSelector(false);
      return;
    }

    console.log(`Iniciando troca para: ${tenantName} (ID: ${tenantId})`);
    setSwitchingTenant(true);
    
    try {
      await switchTenant(tenantId);
      console.log(`Troca concluída para: ${tenantName}`);
      setShowSelector(false);
    } catch (error) {
      console.error('Erro detalhado ao trocar tenant:', error);
      
      // ✅ Mensagens de erro mais específicas
      let errorMessage = 'Erro ao trocar cliente. ';
      
      if (error.message.includes('HTTP 404')) {
        errorMessage += 'Cliente não encontrado.';
      } else if (error.message.includes('HTTP 500')) {
        errorMessage += 'Erro no servidor.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage += 'Não foi possível conectar ao servidor.';
      } else if (error.message.includes('NetworkError')) {
        errorMessage += 'Erro de conexão de rede.';
      } else {
        errorMessage += error.message || 'Tente novamente.';
      }
      
      alert(errorMessage);
      
      // ✅ Recarregar lista de tenants em caso de erro
      console.log('Recarregando lista de tenants após erro...');
      fetchAvailableTenants();
      
    } finally {
      setSwitchingTenant(false);
    }
  };

  // ✅ Loading state melhorado
  if (loading) {
    return (
      <div className="bg-white bg-opacity-20 px-3 py-1 rounded text-sm text-white animate-pulse">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
          <span>Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={selectorRef}>
      {/* Botão principal do seletor */}
      <button
        onClick={() => {
          console.log('Botão clicado - Estado atual showSelector:', showSelector);
          if (tenants.length === 0) {
            fetchAvailableTenants();
          }
          setShowSelector(!showSelector);
        }}
        disabled={switchingTenant}
        className={`bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded text-sm transition-colors flex items-center space-x-2 ${
          switchingTenant ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <span>{switchingTenant ? 'Trocando...' : (tenant?.nome || 'Sistema Padrão')}</span>
        {switchingTenant ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg 
            className={`w-4 h-4 transition-transform duration-200 ${showSelector ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* Lista suspensa */}
      {showSelector && (
        <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border min-w-64 z-50 max-h-96 overflow-y-auto">
          <div className="p-3">
            <div className="flex justify-between items-center mb-3">
              <div className="text-xs text-gray-500 font-medium">Selecionar Cliente:</div>
              {loadingTenants && (
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <div className="text-xs text-blue-600">Carregando...</div>
                </div>
              )}
            </div>
            
            {tenants.length > 0 ? (
              <div className="space-y-1">
                {tenants.map((t) => {
                  const isActive = tenant?.id?.toString() === t.id?.toString();
                  
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleTenantSwitch(t.id, t.nome)}
                      disabled={switchingTenant || isActive}
                      className={`w-full text-left px-3 py-3 rounded text-sm transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500 font-medium cursor-default' 
                          : switchingTenant
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-50 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{t.nome}</div>
                        {isActive && (
                          <div className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                            Ativo
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{t.email_contato}</div>
                      {t.plano && (
                        <div className="text-xs text-blue-600 mt-1 capitalize">
                          Plano: {t.plano}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-gray-500 text-sm mb-3">
                  {loadingTenants ? 'Carregando clientes...' : 'Nenhum cliente encontrado'}
                </div>
                {!loadingTenants && (
                  <button
                    onClick={fetchAvailableTenants}
                    className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Tentar novamente
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantSelector;