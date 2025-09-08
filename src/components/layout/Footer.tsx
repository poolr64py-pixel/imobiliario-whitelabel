'use client';

import Link from 'next/link';
import { useTenant, useThemeConfig } from '@/components/providers/TenantProvider';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';

export function Footer() {
  const { tenant, locale, messages } = useTenant();
  const { primaryColor } = useThemeConfig();
  const currentYear = new Date().getFullYear();

  // Função para traduzir textos
  const t = (key: string) => {
    return messages?.common?.[key] || key;
  };

  // Função para traduzir hero
  const th = (key: string) => {
    return messages?.hero?.[key] || key;
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BuildingOfficeIcon className="h-8 w-8" style={{ color: primaryColor }} />
            </div>
            <p className="text-gray-300 text-sm">{th('subtitle')}</p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}`} className="text-gray-300 hover:text-white transition-colors">
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/imoveis`} className="text-gray-300 hover:text-white transition-colors">
                  {t('properties')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/sobre`} className="text-gray-300 hover:text-white transition-colors">
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contato`} className="text-gray-300 hover:text-white transition-colors">
                  {t('contact')}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">{t('contact')}</h3>
            <div className="space-y-2 text-sm text-gray-300">
              {/* Aqui você pode adicionar informações de contato */}
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} {tenant?.nome || 'Imobiliária'}. Todos os direitos reservados.
          </p>
          <div className="mt-2 text-xs text-gray-500">Powered by Plataforma Imobiliária</div>
        </div>
      </div>
    </footer>
  );
}