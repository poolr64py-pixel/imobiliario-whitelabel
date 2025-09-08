'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useThemeConfig } from '@/components/providers/TenantProvider';

interface SearchBarProps {
  onSearch?: () => void;
  className?: string;
  compact?: boolean;
}

export function SearchBar({ onSearch, className = '', compact = false }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const router = useRouter();
  const { primaryColor } = useThemeConfig();
  const t = useTranslations();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch();
    router.push(`/imoveis?search=${encodeURIComponent(searchTerm)}&location=${encodeURIComponent(location)}`);
  };

  return (
    <form onSubmit={handleSubmit} className={`flex items-center space-x-2 ${className}`}>
      <input
        type="text"
        placeholder="O que você procura?"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {!compact && (
        <input
          type="text"
          placeholder="Localização"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      )}
      <button
        type="submit"
        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        style={{ backgroundColor: primaryColor }}
      >
        <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
        {t('search') || 'Buscar'}
      </button>
    </form>
  );
}
