'use client';

import { motion } from 'framer-motion';
import { 
  HomeIcon, 
  UsersIcon, 
  ChartBarIcon, 
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

interface StatsData {
  totalImoveis: number;
  imoveisDisponiveis: number;
  imoveisVendidos: number;
  imoveisAlugados: number;
  totalLeads: number;
  leadsNovos: number;
  totalCorretores: number;
}

interface StatsSectionProps {
  stats: StatsData;
}

export function StatsSection({ stats }: StatsSectionProps) {
  const statsItems = [
    {
      icon: <HomeIcon className="w-8 h-8" />,
      value: stats.totalImoveis,
      label: 'Total de Imóveis',
      color: 'text-blue-600'
    },
    {
      icon: <CheckCircleIcon className="w-8 h-8" />,
      value: stats.imoveisDisponiveis,
      label: 'Imóveis Disponíveis',
      color: 'text-green-600'
    },
    {
      icon: <ChartBarIcon className="w-8 h-8" />,
      value: stats.imoveisVendidos,
      label: 'Imóveis Vendidos',
      color: 'text-purple-600'
    },
    {
      icon: <UsersIcon className="w-8 h-8" />,
      value: stats.totalLeads,
      label: 'Total de Leads',
      color: 'text-orange-600'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Nossos Números
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Confira algumas estatísticas que mostram nosso crescimento e sucesso
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {statsItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-all"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm mb-4 ${item.color}`}>
                {item.icon}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {item.value.toLocaleString()}
              </div>
              <div className="text-gray-600 font-medium">
                {item.label}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Dados atualizados em tempo real • Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
    </section>
  );
}