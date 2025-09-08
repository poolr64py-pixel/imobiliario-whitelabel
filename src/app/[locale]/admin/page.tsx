'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function AdminPage() {
  const t = useTranslations('common');
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tenants');

  useEffect(() => {
    // Simular busca de dados - você pode conectar com sua API
    const fetchData = async () => {
      try {
        // Aqui você faria as chamadas reais para sua API
        // const response = await fetch('/api/admin/dashboard');
        
        // Para demonstração, dados simulados
        setData({
          tenants: [],
          imoveis: [],
          leads: [],
          corretores: [],
          usuarios: []
        });
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const tabs = [
    { id: 'tenants', label: 'Tenants', icon: '🏢' },
    { id: 'imoveis', label: 'Imóveis', icon: '🏠' },
    { id: 'leads', label: 'Leads', icon: '👥' },
    { id: 'corretores', label: 'Corretores', icon: '👨‍💼' },
    { id: 'usuarios', label: 'Usuários', icon: '👤' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Administrativo</h1>
          <p className="text-gray-600">Visualização e gerenciamento do banco de dados</p>
        </div>

        {/* Navegação por Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Conteúdo das Tabs */}
          <div className="p-6">
            {activeTab === 'tenants' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Tenants</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-2">Estrutura da tabela Tenant:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
                    <span className="bg-blue-100 px-2 py-1 rounded">id (String)</span>
                    <span className="bg-green-100 px-2 py-1 rounded">nome (String)</span>
                    <span className="bg-yellow-100 px-2 py-1 rounded">dominio (String)</span>
                    <span className="bg-purple-100 px-2 py-1 rounded">slug (String)</span>
                    <span className="bg-red-100 px-2 py-1 rounded">ativo (Boolean)</span>
                    <span className="bg-indigo-100 px-2 py-1 rounded">idiomaPadrao (String)</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Para ver dados reais, conecte com: <code className="bg-gray-200 px-1 rounded">npx prisma studio</code>
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'imoveis' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Imóveis</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-2">Estrutura da tabela Imovel:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
                    <span className="bg-blue-100 px-2 py-1 rounded">titulo (String)</span>
                    <span className="bg-green-100 px-2 py-1 rounded">preco (Float)</span>
                    <span className="bg-yellow-100 px-2 py-1 rounded">tipo (String)</span>
                    <span className="bg-purple-100 px-2 py-1 rounded">status (String)</span>
                    <span className="bg-red-100 px-2 py-1 rounded">destaque (Boolean)</span>
                    <span className="bg-indigo-100 px-2 py-1 rounded">visualizacoes (Int)</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'leads' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Leads</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-2">Estrutura da tabela Lead:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
                    <span className="bg-blue-100 px-2 py-1 rounded">nome (String)</span>
                    <span className="bg-green-100 px-2 py-1 rounded">email (String)</span>
                    <span className="bg-yellow-100 px-2 py-1 rounded">telefone (String)</span>
                    <span className="bg-purple-100 px-2 py-1 rounded">interesse (String)</span>
                    <span className="bg-red-100 px-2 py-1 rounded">status (String)</span>
                    <span className="bg-indigo-100 px-2 py-1 rounded">origem (String)</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'corretores' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Corretores</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-2">Estrutura da tabela Corretor:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
                    <span className="bg-blue-100 px-2 py-1 rounded">creci (String)</span>
                    <span className="bg-green-100 px-2 py-1 rounded">especializacao (String)</span>
                    <span className="bg-yellow-100 px-2 py-1 rounded">biografia (String)</span>
                    <span className="bg-purple-100 px-2 py-1 rounded">whatsapp (String)</span>
                    <span className="bg-red-100 px-2 py-1 rounded">ativo (Boolean)</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'usuarios' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Usuários</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-2">Estrutura da tabela Usuario:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
                    <span className="bg-blue-100 px-2 py-1 rounded">nome (String)</span>
                    <span className="bg-green-100 px-2 py-1 rounded">email (String)</span>
                    <span className="bg-yellow-100 px-2 py-1 rounded">telefone (String)</span>
                    <span className="bg-purple-100 px-2 py-1 rounded">role (String)</span>
                    <span className="bg-red-100 px-2 py-1 rounded">ativo (Boolean)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Links úteis */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Ferramentas de Desenvolvimento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900">Prisma Studio</h4>
              <p className="text-sm text-blue-700 mb-2">Interface visual completa para o banco</p>
              <code className="text-xs bg-blue-100 px-2 py-1 rounded">npx prisma studio</code>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900">Reset Database</h4>
              <p className="text-sm text-green-700 mb-2">Resetar e popular banco</p>
              <code className="text-xs bg-green-100 px-2 py-1 rounded">npx prisma db push</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}