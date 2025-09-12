import React, { useState, useEffect } from 'react';

const CRMLeads = ({ apiBase = 'http://localhost:1337/api' }) => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    origem: '',
    periodo: '30'
  });

  // Status disponíveis para leads
  const statusOptions = [
    { value: 'novo', label: 'Novo', color: 'bg-blue-100 text-blue-800' },
    { value: 'contato', label: 'Em contato', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'qualificado', label: 'Qualificado', color: 'bg-purple-100 text-purple-800' },
    { value: 'visita', label: 'Visita agendada', color: 'bg-orange-100 text-orange-800' },
    { value: 'proposta', label: 'Proposta enviada', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'convertido', label: 'Convertido', color: 'bg-green-100 text-green-800' },
    { value: 'perdido', label: 'Perdido', color: 'bg-red-100 text-red-800' }
  ];

  const origemOptions = [
    { value: 'site', label: 'Site' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'telefone', label: 'Telefone' },
    { value: 'email', label: 'Email' },
    { value: 'indicacao', label: 'Indicação' }
  ];

  // Buscar leads da API
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/leads?populate=*&sort=createdAt:desc`);
      if (response.ok) {
        const data = await response.json();
        setLeads(data.data || []);
        setFilteredLeads(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
    } finally {
      setLoading(false);
    }
  };

  // Atualizar status do lead
  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      const response = await fetch(`${apiBase}/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: { status: newStatus }
        }),
      });

      if (response.ok) {
        await fetchLeads(); // Recarregar leads
        setShowModal(false);
      }
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
    }
  };

  // Aplicar filtros
  const applyFilters = () => {
    let filtered = [...leads];

    if (filters.status) {
      filtered = filtered.filter(lead => lead.status === filters.status);
    }

    if (filters.origem) {
      filtered = filtered.filter(lead => lead.origem === filters.origem);
    }

    if (filters.periodo !== 'all') {
      const days = parseInt(filters.periodo);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      filtered = filtered.filter(lead => 
        new Date(lead.createdAt) >= cutoffDate
      );
    }

    setFilteredLeads(filtered);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, leads]);

  // Métricas resumidas
  const metrics = {
    total: leads.length,
    novos: leads.filter(l => l.status === 'novo').length,
    emAndamento: leads.filter(l => ['contato', 'qualificado', 'visita', 'proposta'].includes(l.status)).length,
    convertidos: leads.filter(l => l.status === 'convertido').length,
    taxaConversao: leads.length ? ((leads.filter(l => l.status === 'convertido').length / leads.length) * 100).toFixed(1) : 0
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusStyle = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.color : 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">CRM - Gestão de Leads</h2>
        <button
          onClick={fetchLeads}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          Atualizar
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-gray-800">{metrics.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{metrics.novos}</div>
          <div className="text-sm text-blue-600">Novos</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600">{metrics.emAndamento}</div>
          <div className="text-sm text-yellow-600">Em andamento</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{metrics.convertidos}</div>
          <div className="text-sm text-green-600">Convertidos</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{metrics.taxaConversao}%</div>
          <div className="text-sm text-purple-600">Taxa conversão</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="">Todos os status</option>
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <select
          value={filters.origem}
          onChange={(e) => setFilters(prev => ({ ...prev, origem: e.target.value }))}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="">Todas as origens</option>
          {origemOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <select
          value={filters.periodo}
          onChange={(e) => setFilters(prev => ({ ...prev, periodo: e.target.value }))}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="7">Últimos 7 dias</option>
          <option value="30">Últimos 30 dias</option>
          <option value="90">Últimos 90 dias</option>
          <option value="all">Todo período</option>
        </select>

        <button
          onClick={() => setFilters({ status: '', origem: '', periodo: '30' })}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700"
        >
          Limpar filtros
        </button>
      </div>

      {/* Lista de Leads */}
      <div className="space-y-3">
        {filteredLeads.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📋</div>
            <p>Nenhum lead encontrado</p>
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedLead(lead);
                setShowModal(true);
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-lg text-gray-800">{lead.nome}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(lead.status)}`}>
                      {getStatusLabel(lead.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="mr-2">📧</span>
                      {lead.email}
                    </div>
                    {lead.telefone && (
                      <div className="flex items-center">
                        <span className="mr-2">📱</span>
                        {lead.telefone}
                      </div>
                    )}
                    <div className="flex items-center">
                      <span className="mr-2">📅</span>
                      {formatDate(lead.createdAt)}
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">🔗</span>
                      {lead.origem}
                    </div>
                  </div>
                  
                  {lead.mensagem && (
                    <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      <strong>Mensagem:</strong> {lead.mensagem.substring(0, 100)}
                      {lead.mensagem.length > 100 && '...'}
                    </div>
                  )}
                </div>
                
                <div className="ml-4 text-right">
                  <div className="text-xs text-gray-500">
                    {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Detalhes do Lead */}
      {showModal && selectedLead && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Detalhes do Lead</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Informações básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <div className="p-2 bg-gray-50 rounded">{selectedLead.nome}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="p-2 bg-gray-50 rounded">{selectedLead.email}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <div className="p-2 bg-gray-50 rounded">{selectedLead.telefone || 'Não informado'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Origem</label>
                  <div className="p-2 bg-gray-50 rounded">{selectedLead.origem}</div>
                </div>
              </div>

              {/* Status atual */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={selectedLead.status}
                  onChange={(e) => updateLeadStatus(selectedLead.id, e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Mensagem */}
              {selectedLead.mensagem && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                  <div className="p-3 bg-gray-50 rounded border">{selectedLead.mensagem}</div>
                </div>
              )}

              {/* Informações de data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <strong>Criado em:</strong> {formatDate(selectedLead.createdAt)}
                </div>
                <div>
                  <strong>Atualizado em:</strong> {formatDate(selectedLead.updatedAt)}
                </div>
              </div>

              {/* Ações */}
              <div className="flex space-x-2 pt-4 border-t">
                <a
                  href={`mailto:${selectedLead.email}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-center"
                >
                  Enviar Email
                </a>
                {selectedLead.telefone && (
                  <a
                    href={`https://wa.me/${selectedLead.telefone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-center"
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMLeads;