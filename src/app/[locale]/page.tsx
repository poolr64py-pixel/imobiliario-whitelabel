'use client';

import { useTenant } from '@/components/providers/TenantProvider';

export default function HomePage() {
  const { tenant, locale, messages } = useTenant();

  // Função para traduzir textos do common
  const t = (key: string) => {
    return messages?.common?.[key] || key;
  };

  // Função para traduzir textos do hero
  const th = (key: string) => {
    return messages?.hero?.[key] || key;
  };

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Plataforma Imobiliária</h1>
          <p className="text-xl text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6 text-blue-600">
            Bem-vindo ao {tenant.nome}
          </h1>
          <p className="text-xl mb-8 text-gray-600">
            {th('title')}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-blue-600">100+</h3>
              <p className="text-gray-600">
                {locale === 'pt-BR' && 'Imóveis Disponíveis'}
                {locale === 'en-US' && 'Available Properties'}
                {locale === 'es-PY' && 'Propiedades Disponibles'}
                {locale === 'gn-PY' && 'Mba\'e ojeguerekóva'}
              </p>
            </div>
            
            <div className="text-center">
              <h3 className="text-3xl font-bold text-blue-600">250+</h3>
              <p className="text-gray-600">
                {locale === 'pt-BR' && 'Clientes Satisfeitos'}
                {locale === 'en-US' && 'Satisfied Clients'}
                {locale === 'es-PY' && 'Clientes Satisfechos'}
                {locale === 'gn-PY' && 'Umi cliente py\'aguapýva'}
              </p>
            </div>
            
            <div className="text-center">
              <h3 className="text-3xl font-bold text-blue-600">15</h3>
              <p className="text-gray-600">
                {locale === 'pt-BR' && 'Anos de Experiência'}
                {locale === 'en-US' && 'Years of Experience'}
                {locale === 'es-PY' && 'Años de Experiencia'}
                {locale === 'gn-PY' && 'Ary ojepokuaa'}
              </p>
            </div>
            
            <div className="text-center">
              <h3 className="text-3xl font-bold text-blue-600">8</h3>
              <p className="text-gray-600">
                {locale === 'pt-BR' && 'Corretores Especialistas'}
                {locale === 'en-US' && 'Expert Realtors'}
                {locale === 'es-PY' && 'Corredores Especialistas'}
                {locale === 'gn-PY' && 'Umi katupyry arandu'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}