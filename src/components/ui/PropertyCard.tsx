'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Route } from 'next';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  HeartIcon,
  ShareIcon,
  MapPinIcon,
  HomeIcon,
  EyeIcon,
  PhoneIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useTenant, useThemeConfig } from '@/components/providers/TenantProvider';
import { motion } from 'framer-motion';

interface Property {
  id: string;
  titulo: string;
  preco: number;
  moeda: string;
  tipo: string;
  categoria: string;
  slug: string;
  destaque?: boolean;
  urgente?: boolean;
  visualizacoes?: number;
  endereco?: {
    cidade: string;
    bairro: string;
    estado: string;
  };
  caracteristicas?: {
    quartos: number;
    banheiros: number;
    areaTotal: number;
    vagas: number;
  };
  imagens: Array<{
    url: string;
    alt?: string;
  }>;
  corretor: {
    usuario: {
      nome: string;
      foto?: string;
    };
  };
}

interface PropertyCardProps {
  property: Property;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

export function PropertyCard({
  property,
  variant = 'default',
  className = ''
}: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  const t = useTranslations('property');
  const { tenant } = useTenant();
  const { primaryColor } = useThemeConfig();

  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const mainImage = property.imagens?.[currentImageIndex] || property.imagens?.[0];
  const hasMultipleImages = property.imagens && property.imagens.length > 1;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? property.imagens.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) =>
        (prev + 1) % property.imagens.length
      );
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigator.share) {
      try {
        await navigator.share({
          title: property.titulo,
          text: `Confira este ${property.tipo} em ${property.endereco?.bairro}`,
          url: `/imoveis/${property.slug}`,
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    } else {
      const url = `${window.location.origin}/imoveis/${property.slug}`;
      await navigator.clipboard.writeText(url);
    }
  };

  const cardVariants = {
    hover: {
      y: -8,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const imageVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${className}`}
    >
      <Link href={`/imoveis/${property.slug}` as Route}>
        {/* Image Container */}
        <div className="relative h-64 overflow-hidden">
          {mainImage && (
            <motion.div
              variants={imageVariants}
              whileHover="hover"
              className="relative w-full h-full"
            >
              <Image
                src={mainImage.url}
                alt={mainImage.alt || property.titulo}
                fill
                className="object-cover"
                onLoad={() => setIsImageLoading(false)}
              />

              {isImageLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                  <HomeIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </motion.div>
          )}

          {/* Image Navigation */}
          {hasMultipleImages && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1">
                {property.imagens.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-col space-y-2">
            {property.destaque && (
              <span
                className="px-2 py-1 text-xs font-semibold text-white rounded-full"
                style={{ backgroundColor: primaryColor }}
              >
                Destaque
              </span>
            )}
            {property.urgente && (
              <span className="px-2 py-1 text-xs font-semibold bg-red-500 text-white rounded-full">
                Urgente
              </span>
            )}
            <span className="px-2 py-1 text-xs font-medium bg-gray-900 text-white rounded-full capitalize">
              {property.categoria}
            </span>
          </div>

          {/* Top Actions */}
          <div className="absolute top-3 right-3 flex space-x-2">
            <button
              onClick={handleFavorite}
              className="bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 transition-colors"
            >
              {isFavorited ? (
                <HeartSolidIcon className="h-4 w-4 text-red-500" />
              ) : (
                <HeartIcon className="h-4 w-4" />
              )}
            </button>

            <button
              onClick={handleShare}
              className="bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 transition-colors"
            >
              <ShareIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Bottom Info Overlay */}
          <div className="absolute bottom-3 left-3">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(property.preco)}
              </div>
              {property.caracteristicas?.areaTotal && (
                <div className="text-sm text-gray-600">
                  {formatCurrency(property.preco / property.caracteristicas.areaTotal)}/m²
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title and Location */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
              {property.titulo}
            </h3>

            {property.endereco && (
              <div className="flex items-center text-gray-600 text-sm">
                <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="truncate">
                  {property.endereco.bairro}, {property.endereco.cidade} - {property.endereco.estado}
                </span>
              </div>
            )}
          </div>

          {/* Property Features */}
          {property.caracteristicas && (
            <div className="grid grid-cols-4 gap-4 mb-4 py-3 border-t border-gray-100">
              <div className="text-center">
                <HomeIcon className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                <div className="text-sm font-medium text-gray-900">
                  {property.caracteristicas.quartos}
                </div>
                <div className="text-xs text-gray-500">Quartos</div>
              </div>

              <div className="text-center">
                <svg className="h-5 w-5 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <div className="text-sm font-medium text-gray-900">
                  {property.caracteristicas.banheiros}
                </div>
                <div className="text-xs text-gray-500">Banheiros</div>
              </div>

              <div className="text-center">
                <TruckIcon className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                <div className="text-sm font-medium text-gray-900">
                  {property.caracteristicas.vagas}
                </div>
                <div className="text-xs text-gray-500">Vagas</div>
              </div>

              <div className="text-center">
                <svg className="h-5 w-5 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm font-medium text-gray-900">
                  {property.caracteristicas.areaTotal}
                </div>
                <div className="text-xs text-gray-500">m²</div>
              </div>
            </div>
          )}

          {/* Realtor and Stats */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-3">
              {property.corretor.usuario.foto ? (
                <Image
                  src={property.corretor.usuario.foto}
                  alt={property.corretor.usuario.nome}
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {property.corretor.usuario.nome.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {property.corretor.usuario.nome}
                </div>
                <div className="text-xs text-gray-500">Corretor</div>
              </div>
            </div>

            {property.visualizacoes && (
              <div className="flex items-center text-gray-500 text-xs">
                <EyeIcon className="h-4 w-4 mr-1" />
                {property.visualizacoes}
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Quick Action Buttons */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-2 gap-3">
          <button
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            <PhoneIcon className="h-4 w-4 mr-2" />
            Ligar
          </button>

          <button
            className="flex items-center justify-center px-4 py-2 rounded-lg text-white transition-colors"
            style={{ backgroundColor: '#25D366' }}
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.570-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" />
            </svg>
            WhatsApp
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function PropertyTypes() {
  return <div>Property Types Section</div>;
}