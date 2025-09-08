'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface Tenant {
  id: string;
  nome: string;
  slug: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  domain: string;
  config?: any;
}

interface Messages {
  common: {
    [key: string]: string;
  };
  hero?: {
    [key: string]: string;
  };
  [key: string]: any;
}

interface TenantContextType {
  tenant: Tenant | null;
  locale: string;
  messages: Messages;
  primaryColor: string;
  secondaryColor: string;
}

interface TenantProviderProps {
  children: ReactNode;
  tenant: Tenant | null;
  locale: string;
  messages: Messages;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children, tenant, locale, messages }: TenantProviderProps) {
  const value: TenantContextType = {
    tenant,
    locale,
    messages,
    primaryColor: tenant?.primaryColor || '#3B82F6',
    secondaryColor: tenant?.secondaryColor || '#1E40AF'
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

export function useThemeConfig() {
  const { primaryColor, secondaryColor } = useTenant();
  return {
    primaryColor,
    secondaryColor
  };
}