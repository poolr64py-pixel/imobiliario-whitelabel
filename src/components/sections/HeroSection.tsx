'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  PlayIcon,
  ArrowRightIcon,
  HomeIcon,
  BuildingOfficeIcon,
  MapIcon
} from '@heroicons/react/24/outline';
import { useTenant, useThemeConfig } from '@/components/providers/TenantProvider';
import { SearchBar } from '@/components/layout/SearchBar';

const heroImages = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
];

export function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const t = useTranslations();
  const { primaryColor } = useThemeConfig();

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => prev === 0 ? heroImages.length - 1 : prev - 1);
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % heroImages.length);
  };

  return (
    <section className="relative w-full h-[600px] overflow-hidden">
      {/* Hero Images */}
      <div className="absolute inset-0">
        <Image
          src={heroImages[currentImageIndex]}
          alt="Hero Image"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          {t('hero.title') || 'Encontre seu imóvel ideal'}
        </h1>
        <p className="text-lg md:text-2xl text-white/90 mb-8">
          {t('hero.subtitle') || 'A melhor seleção de imóveis em um só lugar'}
        </p>

        {/* Search Bar */}
        <SearchBar className="w-full max-w-2xl mx-auto" />
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={handlePrevImage}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 rounded-full p-2"
      >
        <ArrowRightIcon className="rotate-180 h-6 w-6" />
      </button>
      <button
        onClick={handleNextImage}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 rounded-full p-2"
      >
        <ArrowRightIcon className="h-6 w-6" />
      </button>
    </section>
  );
}
