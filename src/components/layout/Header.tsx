'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useTenant, useThemeConfig } from '@/components/providers/TenantProvider';
import {
  Bars3Icon,
  XMarkIcon,
  BuildingOfficeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { tenant } = useTenant();
  const { primaryColor } = useThemeConfig();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('common');

  console.log(`HEADER: locale=${locale}, home=${t('home')}`);

  const navigation = [
    { name: t('home'), href: `/${locale}` },
    { name: t('properties'), href: `/${locale}/imoveis` },
    { name: t('about'), href: `/${locale}/sobre` },
    { name: t('contact'), href: `/${locale}/contato` },
  ];

  // Função para trocar idioma
  const toggleLocale = () => {
    const locales = ['pt-BR', 'es-PY', 'en-US', 'gn-PY'];
    const currentIndex = locales.indexOf(locale);
    const nextIndex = (currentIndex + 1) % locales.length;
    const nextLocale = locales[nextIndex];

    router.push(`/${nextLocale}`);
  };

  // Bandeiras dos países
  const getLocaleFlag = () => {
    switch (locale) {
      case 'pt-BR': return '🇧🇷';
      case 'es-PY': return '🇵🇾';
      case 'en-US': return '🇺🇸';
      case 'gn-PY': return '🇵🇾';
      default: return '🌍';
    }
  };

  const getLocaleLabel = () => {
    switch (locale) {
      case 'pt-BR': return 'PT';
      case 'es-PY': return 'ES';
      case 'en-US': return 'EN';
      case 'gn-PY': return 'GN';
      default: return 'PT';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Nome */}
          <Link href={`/${locale}`} className="flex items-center space-x-2 group">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
              style={{ backgroundColor: primaryColor }}
            >
              <BuildingOfficeIcon className="h-4 w-4 text-white" />
            </div>
            {tenant?.nome && (
              <span className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                {tenant.nome}
              </span>
            )}
          </Link>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md font-medium transition-colors hover:bg-gray-50"
              >
                {item.name}
              </Link>
            ))}

            {/* Seletor de Idioma */}
            <button
              onClick={toggleLocale}
              className="ml-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors flex items-center space-x-1"
              title={`Mudar idioma (atual: ${getLocaleLabel()})`}
            >
              <span className="text-sm">{getLocaleFlag()}</span>
              <span className="text-xs font-medium">{getLocaleLabel()}</span>
              <GlobeAltIcon className="h-4 w-4" />
            </button>
          </nav>

          {/* Menu Mobile */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleLocale}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-md transition-colors flex items-center space-x-1"
              title={`Mudar idioma (atual: ${getLocaleLabel()})`}
            >
              <span className="text-sm">{getLocaleFlag()}</span>
              <span className="text-xs">{getLocaleLabel()}</span>
            </button>

            <button
              className="p-2 rounded-md transition-colors hover:bg-gray-50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-5 w-5 text-gray-600" />
              ) : (
                <Bars3Icon className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Navegação Mobile */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 animate-in slide-in-from-top-2 duration-200">
            <nav className="py-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Info do idioma atual no mobile */}
              <div className="px-3 py-2 text-xs text-gray-400 border-t border-gray-100 mt-2 pt-2">
                Idioma atual: {getLocaleFlag()} {getLocaleLabel()}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}