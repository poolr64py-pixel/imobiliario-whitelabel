'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Route } from 'next';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  HeartIcon,
  MapPinIcon,
  CameraIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { useTenant, useThemeConfig } from '@/components/providers/TenantProvider';

interface Property {
  id: string;
  titulo: string;
  preco: number;
  endereco: {
    cidade: string;
    estado: string;
  };
  caracteristicas: {
    quartos: number;
    banheiros: number;
    areaTotal: number;
  };
  imagens: Array<{
    url: string;
    alt?: string;
  }>;
  slug: string;
  destaque: boolean;
}

interface FeaturedPropertiesProps {
  properties: Property[];
}

export function FeaturedProperties({ properties }: FeaturedPropertiesProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const t = useTranslations();
  const { tenant } = useTenant();
  const { primaryColor } = useThemeConfig();

  // Função para formatar moeda baseada na configuração do tenant
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const toggleFavorite = (propertyId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(propertyId)) {
      newFavorites.delete(propertyId);
    } else {
      newFavorites.add(propertyId);
    }
    setFavorites(newFavorites);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Imóveis em Destaque
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Confira nossa seleção de propriedades especiais
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-64">
                <Image
                  src={property.imagens[0]?.url || '/placeholder-property.jpg'}
                  alt={property.titulo}
                  fill
                  className="object-cover"
                />

                {property.destaque && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Destaque
                    </span>
                  </div>
                )}

                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => toggleFavorite(property.id)}
                    className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                      favorites.has(property.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white/80 text-gray-700 hover:bg-white'
                    }`}
                  >
                    <HeartIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 bg-white/80 text-gray-700 hover:bg-white rounded-full backdrop-blur-sm transition-colors">
                    <ShareIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="absolute bottom-4 left-4">
                  <span className="bg-black/50 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                    <CameraIcon className="w-4 h-4" />
                    {property.imagens.length}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {property.titulo}
                </h3>

                <div className="flex items-center text-gray-600 mb-3">
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  <span className="text-sm">
                    {property.endereco.cidade}, {property.endereco.estado}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>{property.caracteristicas.quartos} quartos</span>
                  <span>{property.caracteristicas.banheiros} banheiros</span>
                  <span>{property.caracteristicas.areaTotal}m²</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold" style={{ color: primaryColor }}>
                    {formatCurrency(property.preco)}
                  </div>

                  <Link
                    href={`/imoveis/${property.slug}` as Route}
                    className="px-4 py-2 text-white rounded-lg hover:bg-opacity-90 transition-colors"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Ver detalhes
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href={"/imoveis" as Route}
            className="inline-flex items-center px-8 py-3 text-white rounded-lg hover:bg-opacity-90 transition-colors"
            style={{ backgroundColor: primaryColor }}
          >
            Ver todos os imóveis
          </Link>
        </div>
      </div>
    </section>
  );
}