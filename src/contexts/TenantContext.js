import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const TenantContext = createContext();

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant deve ser usado dentro de TenantProvider');
  }
  return context;
};

export const TenantProvider = ({ children }) => {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  const detectTenant = useCallback(async () => {
    console.log('=== DETECT TENANT INICIADO ===');
    
    try {
      console.log('Buscando todos os clientes...');
      const response = await fetch('http://localhost:1337/api/clientes');
      const clientesData = await response.json();
      
      console.log('Clientes recebidos:', clientesData.data?.length || 0);
      
      if (!clientesData.data || clientesData.data.length === 0) {
        console.warn('Nenhum cliente encontrado no Strapi');
        setTenant({
          id: 'default',
          nome: 'Sistema Padrão',
          email_contato: 'contato@sistema.com'
        });
        return;
      }

      const storedTenant = localStorage.getItem('tenant-id');
      const urlParams = new URLSearchParams(window.location.search);
      const urlTenant = urlParams.get('tenant');
      
      let tenantId = urlTenant || storedTenant;
      let selectedClient = null;
      
      if (tenantId) {
        selectedClient = clientesData.data.find(c => c.id.toString() === tenantId.toString());
      }
      
      if (!selectedClient) {
        selectedClient = clientesData.data[0];
        tenantId = selectedClient.id.toString();
      }
      
      const finalTenant = {
        id: tenantId,
        ...selectedClient
      };
      
      setTenant(finalTenant);
      localStorage.setItem('tenant-id', tenantId);
      
      console.log('Tenant configurado:', finalTenant.nome);
      
    } catch (error) {
      console.error('Erro ao detectar tenant:', error);
      setTenant({
        id: 'default',
        nome: 'Sistema Padrão - ERRO'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const switchTenant = useCallback(async (newTenantId) => {
    console.log('=== SWITCH TENANT INICIADO ===');
    setLoading(true);
    
    try {
      // CORREÇÃO: Usar filtro em vez de endpoint direto
      const url = `http://localhost:1337/api/clientes?filters[id][$eq]=${newTenantId}`;
      console.log('URL da requisição (corrigida):', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok && data.data && data.data.length > 0) {
        const clienteData = data.data[0];
        
        const newTenant = {
          id: newTenantId.toString(),
          ...clienteData
        };
        
        setTenant(newTenant);
        localStorage.setItem('tenant-id', newTenantId.toString());
        
        console.log('=== SWITCH TENANT CONCLUÍDO ===');
      } else {
        throw new Error('Cliente não encontrado');
      }
    } catch (error) {
      console.error('Erro no switch:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    detectTenant();
  }, [detectTenant]);

  return (
    <TenantContext.Provider value={{
      tenant,
      loading,
      switchTenant,
      refreshTenant: detectTenant
    }}>
      {children}
    </TenantContext.Provider>
  );
};