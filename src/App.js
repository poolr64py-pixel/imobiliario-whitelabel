import React, { useState, useEffect } from 'react';
import './App.css';

// Componente Header
const Header = ({ cliente }) => (
  <header className="bg-blue-600 text-white p-4">
    <div className="container mx-auto flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">
          {cliente?.nome || 'Carregando...'}
        </h1>
        <p className="text-blue-100">{cliente?.email_contato}</p>
      </div>
      <nav>
        <button className="bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded mr-2">
          Imóveis
        </button>
        <button className="bg-green-500 hover:bg-green-700 px-4 py-2 rounded">
          Contato
        </button>
      </nav>
    </div>
  </header>
);

// Componente Card de Imóvel
const ImovelCard = ({ imovel }) => (
  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
    <h3 className="text-xl font-semibold mb-2">{imovel.titulo}</h3>
    <p className="text-gray-600 mb-2">📍 {imovel.cidade}</p>
    <p className="text-2xl font-bold text-green-600 mb-3">
      R$ {imovel.preco?.toLocaleString('pt-BR')}
    </p>
    <p className="text-gray-700 mb-4">{imovel.descricao}</p>
    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
      Ver Detalhes
    </button>
  </div>
);

// Componente Formulário de Lead
const LeadForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    mensagem: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ nome: '', email: '', telefone: '', mensagem: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Interessado? Entre em contato!</h3>
      <div className="space-y-4">
        <input
          type="text"
          name="nome"
          placeholder="Seu nome"
          value={formData.nome}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
        />
        <input
          type="email"
          name="email"
          placeholder="Seu email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
        />
        <input
          type="tel"
          name="telefone"
          placeholder="Seu telefone"
          value={formData.telefone}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
        />
        <textarea
          name="mensagem"
          placeholder="Sua mensagem"
          value={formData.mensagem}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg h-24"
          rows={3}
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
        >
          Enviar Mensagem
        </button>
      </div>
    </div>
  );
};

// Componente principal
function App() {
  const [cliente, setCliente] = useState(null);
  const [imoveis, setImoveis] = useState([]);
  const [corretores, setCorretores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Função para buscar dados das APIs
  const fetchData = async () => {
    try {
      const [clienteRes, imoveisRes, corretoresRes] = await Promise.all([
        fetch('http://localhost:1337/api/clientes'),
        fetch('http://localhost:1337/api/imovels'),
        fetch('http://localhost:1337/api/corretors')
      ]);

      const clienteData = await clienteRes.json();
      const imoveisData = await imoveisRes.json();
      const corretoresData = await corretoresRes.json();

      setCliente(clienteData.data[0]);
      setImoveis(imoveisData.data);
      setCorretores(corretoresData.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para criar lead
  const criarLead = async (dadosLead) => {
    try {
      const response = await fetch('http://localhost:1337/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: dadosLead
        }),
      });

      if (response.ok) {
        alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
      } else {
        alert('Erro ao enviar mensagem. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao criar lead:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header cliente={cliente} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Seção Hero */}
        <section className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Encontre o Imóvel dos Seus Sonhos
          </h2>
          <p className="text-xl text-gray-600">
            {imoveis.length} imóveis disponíveis
          </p>
        </section>

        {/* Grid de Imóveis */}
        <section className="mb-12">
          <h3 className="text-2xl font-semibold mb-6">Imóveis em Destaque</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {imoveis.map((imovel) => (
              <ImovelCard key={imovel.id} imovel={imovel} />
            ))}
          </div>
        </section>

        {/* Seção de Contato */}
        <section className="grid md:grid-cols-2 gap-8">
          <LeadForm onSubmit={criarLead} />
          
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Nossa Equipe</h3>
            {corretores.map((corretor) => (
              <div key={corretor.id} className="mb-4 p-4 bg-gray-50 rounded">
                <h4 className="font-semibold">{corretor.nome}</h4>
                <p className="text-gray-600">{corretor.especialidade}</p>
                <p className="text-blue-600">{corretor.email}</p>
                <p className="text-gray-700">{corretor.telefone}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white p-8 mt-12">
        <div className="container mx-auto text-center">
          <h3 className="text-lg font-semibold mb-2">
            {cliente?.nome}
          </h3>
          <p>{cliente?.email_contato}</p>
          <p className="mt-4 text-gray-400">
            © 2025 Sistema Imobiliário White Label
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;