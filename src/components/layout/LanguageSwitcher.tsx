'use client';

import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Route } from 'next';
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { locales, localeLabels, localeFlags, type Locale } from '@/i18n';

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale() as Locale;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocaleChange = (newLocale: Locale) => {
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '') || '/';
    const newPath = newLocale === 'pt-BR'
      ? pathWithoutLocale
      : `/${newLocale}${pathWithoutLocale}`;
    
    router.push(newPath as Route);
    setIsOpen(false);
  };

  const currentLocaleData = {
    label: localeLabels[currentLocale],
    flag: localeFlags[currentLocale],
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-md transition-colors"
      >
        <span className="text-lg">{currentLocaleData.flag}</span>
        <span className="hidden sm:block">{currentLocaleData.label}</span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => handleLocaleChange(locale)}
              className={`w-full flex items-center space-x-3 px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors ${
                locale === currentLocale ? 'bg-gray-50 text-gray-900' : 'text-gray-600'
              }`}
            >
              <span className="text-lg">{localeFlags[locale]}</span>
              <span className="flex-1">{localeLabels[locale]}</span>
              {locale === currentLocale && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}