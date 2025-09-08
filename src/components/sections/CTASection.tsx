'use client';

import Link from 'next/link';
import { ArrowRightIcon, PhoneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useThemeConfig, useTenant } from '@/components/providers/TenantProvider';

export function CTASection() {
  const { primaryColor } = useThemeConfig();
  const { tenant } = useTenant();

  return (
    <section className="py-16 bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Pronto para encontrar seu imóvel ideal?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Nossa equipe está pronta para ajudar você a encontrar a propriedade perfeita. 
            Entre em contato conosco hoje mesmo!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/imoveis"
              className="inline-flex items-center px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-semibold text-lg"
              style={{ backgroundColor: primaryColor }}
            >
              Ver todos os imóveis
              <ArrowRightIcon className="ml-2 w-5 h-5" />
            </Link>
            
            <Link
              href="/contato"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-gray-900 transition-all font-semibold text-lg"
            >
              <PhoneIcon className="mr-2 w-5 h-5" />
              Falar com especialista
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">500+</div>
              <div className="text-gray-300">Imóveis disponíveis</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">1000+</div>
              <div className="text-gray-300">Clientes satisfeitos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">15+</div>
              <div className="text-gray-300">Anos de experiência</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}