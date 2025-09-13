// src/components/ContactForm.js
import React, { useState, useRef } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import apiClient from '../services/api';

const ContactForm = ({ 
  property = null, 
  onSuccess = null,
  onClose = null,
  className = "",
  title = "Entre em Contato",
  variant = "modal" // 'modal', 'inline', 'section'
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    mensagem: property 
      ? `Tenho interesse no imóvel: ${property.titulo}` 
      : 'Gostaria de mais informações sobre os imóveis disponíveis.',
    origem: 'site',
    status: 'novo'
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const formRef = useRef(null);

  // Validação em tempo real
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'nome':
        if (!value.trim()) {
          newErrors.nome = 'Nome é obrigatório';
        } else if (value.trim().length < 2) {
          newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
        } else {
          delete newErrors.nome;
        }
        break;

      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Email inválido';
        } else {
          delete newErrors.email;
        }
        break;

      case 'telefone':
        if (!value.trim()) {
          newErrors.telefone = 'Telefone é obrigatório';
        } else if (!/^\+?[\d\s\-()]{8,}$/.test(value.replace(/\s/g, ''))) {
          newErrors.telefone = 'Telefone inválido';
        } else {
          delete newErrors.telefone;
        }
        break;

      case 'mensagem':
        if (!value.trim()) {
          newErrors.mensagem = 'Mensagem é obrigatória';
        } else if (value.trim().length < 10) {
          newErrors.mensagem = 'Mensagem deve ter pelo menos 10 caracteres';
        } else {
          delete newErrors.mensagem;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Formatação automática de telefone
  const formatPhone = (value) => {
    // Remove caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Formato paraguaio: +595 XXX XXX XXX
    if (numbers.startsWith('595')) {
      const formatted = numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '+595 $2 $3 $4');
      return formatted;
    } else if (numbers.startsWith('0')) {
      // Remove o 0 inicial e adiciona +595
      const withoutZero = numbers.substring(1);
      if (withoutZero.length >= 9) {
        return `+595 ${withoutZero.substring(0, 3)} ${withoutZero.substring(3, 6)} ${withoutZero.substring(6, 9)}`;
      }
    }
    
    // Formato simples para outros casos
    if (numbers.length <= 9) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
    }
    
    return value;
  };

  // Lidar com mudanças nos inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    if (name === 'telefone') {
      processedValue = formatPhone(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Validar se o campo foi tocado
    if (touched[name]) {
      validateField(name, processedValue);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  // Enviar formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar todos os campos
    const allFieldsValid = Object.keys(formData).reduce((isValid, field) => {
      if (['nome', 'email', 'telefone', 'mensagem'].includes(field)) {
        return validateField(field, formData[field]) && isValid;
      }
      return isValid;
    }, true);

    if (!allFieldsValid) {
      // Marcar todos os campos como tocados para mostrar erros
      setTouched({
        nome: true,
        email: true,
        telefone: true,
        mensagem: true
      });
      return;
    }

    setLoading(true);

    try {
      await apiClient.createLead(formData);
      setSuccess(true);
      
      // Limpar formulário
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        mensagem: property 
          ? `Tenho interesse no imóvel: ${property.titulo}` 
          : 'Gostaria de mais informações sobre os imóveis disponíveis.',
        origem: 'site',
        status: 'novo'
      });
      setTouched({});
      setErrors({});

      if (onSuccess) {
        onSuccess(formData);
      }

      // Auto-fechar após 3 segundos
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 3000);
      }

    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      setErrors({
        submit: 'Erro ao enviar mensagem. Verifique sua conexão e tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Componente de sucesso
  if (success) {
    return (
      <div className={`bg-white rounded-2xl p-8 ${className}`}>
        <div className="text-center">
          {/* Ícone de sucesso animado */}
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center animate-pulse">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Mensagem Enviada!
          </h3>
          
          <div className="space-y-3 text-gray-600 mb-6">
            <p className="text-lg">
              Recebemos sua mensagem com sucesso.
            </p>
            <p>
              Nossa equipe entrará em contato em até <strong>24 horas</strong>.
            </p>
            {property && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Imóvel de interesse:</strong><br />
                  {property.titulo}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {onClose && (
              <button
                onClick={onClose}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                Fechar
              </button>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="tel:+595718400"
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors font-medium border border-green-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>Ligar Agora</span>
              </a>
              
              <a
                href="https://wa.me/595718400?text=Olá! Acabei de enviar uma mensagem pelo site."
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Formulário principal
  return (
    <div className={`bg-white rounded-2xl p-8 ${className}`}>
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          {title}
        </h3>
        {property && (
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-800">
              <strong>Interesse no imóvel:</strong><br />
              <span className="font-medium">{property.titulo}</span>
              {property.preco && (
                <span className="block text-blue-600">
                  {new Intl.NumberFormat('es-PY', {
                    style: 'currency',
                    currency: 'PYG',
                    minimumFractionDigits: 0
                  }).format(property.preco)}
                </span>
              )}
            </p>
          </div>
        )}
        <p className="text-gray-600 mt-3">
          Preencha o formulário e nossa equipe entrará em contato em até 24 horas.
        </p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {/* Nome */}
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
            Nome completo *
          </label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base ${
              touched.nome && errors.nome 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="Seu nome completo"
            disabled={loading}
          />
          {touched.nome && errors.nome && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {errors.nome}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base ${
              touched.email && errors.email 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="seu@email.com"
            disabled={loading}
          />
          {touched.email && errors.email && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {errors.email}
            </p>
          )}
        </div>

        {/* Telefone */}
        <div>
          <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-2">
            Telefone/WhatsApp *
          </label>
          <input
            type="tel"
            id="telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base ${
              touched.telefone && errors.telefone 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="+595 XXX XXX XXX"
            disabled={loading}
          />
          {touched.telefone && errors.telefone && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {errors.telefone}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Formato: +595 XXX XXX XXX (Paraguai)
          </p>
        </div>

        {/* Mensagem */}
        <div>
          <label htmlFor="mensagem" className="block text-sm font-medium text-gray-700 mb-2">
            Mensagem *
          </label>
          <textarea
            id="mensagem"
            name="mensagem"
            rows="4"
            value={formData.mensagem}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical text-base ${
              touched.mensagem && errors.mensagem 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="Descreva o que você está procurando, suas preferências de localização, orçamento, etc."
            disabled={loading}
          />
          {touched.mensagem && errors.mensagem && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {errors.mensagem}
            </p>
          )}
        </div>

        {/* Checkbox de consentimento */}
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="consent"
            required
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={loading}
          />
          <label htmlFor="consent" className="text-sm text-gray-600 leading-relaxed">
            Autorizo o contato por email, telefone ou WhatsApp para receber informações sobre imóveis. 
            Seus dados estão protegidos conforme nossa Política de Privacidade.
          </label>
        </div>

        {/* Erro de envio */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          </div>
        )}

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="sm:flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              disabled={loading}
            >
              Cancelar
            </button>
          )}
          
          <button
            type="submit"
            disabled={loading || Object.keys(errors).length > 0}
            className={`${onClose ? 'sm:flex-1' : 'w-full'} bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium flex items-center justify-center ${
              loading || Object.keys(errors).length > 0 
                ? 'opacity-75 cursor-not-allowed' 
                : 'hover:scale-105 shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" color="white" />
                <span className="ml-2">Enviando...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Enviar Mensagem
              </>
            )}
          </button>
        </div>

        {/* Contatos alternativos */}
        <div className="border-t pt-6 mt-8">
          <p className="text-sm text-gray-600 mb-4 text-center">
            Ou entre em contato diretamente:
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="tel:+595718400"
              className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>+595 994 718 400</span>
            </a>
            
            <a
              href="https://wa.me/595718400?text=Olá! Tenho interesse nos imóveis disponíveis."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;