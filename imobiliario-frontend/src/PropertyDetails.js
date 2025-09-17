import React, { useEffect, useState } from 'react';
import ImageGallery from './ImageGallery';
import { PriceFormatter, useTranslation } from './localization';

const PropertyDetails = ({ imovel, onClose }) => {
  const { t } = useTranslation();
  const [showFullscreenGallery, setShowFullscreenGallery] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!imovel) return null;

  // Montagem das imagens
  let images = [];
  if (imovel.imagens?.length > 0) {
    images = imovel.imagens
      .map(img => {
        let imageUrl = '';
        let previewUrl = '';

        if (img.url) {
          imageUrl = img.url.startsWith('http') ? img.url : `http://localhost:1337${img.url}`;
          previewUrl = img.formats?.large?.url
            ? `http://localhost:1337${img.formats.large.url}`
            : img.formats?.medium?.url
            ? `http://localhost:1337${img.formats.medium.url}`
            : imageUrl;
        } else if (img.attributes?.url) {
          imageUrl = `http://localhost:1337${img.attributes.url}`;
          previewUrl = img.attributes.formats?.large?.url
            ? `http://localhost:1337${img.attributes.formats.large.url}`
            : img.attributes.formats?.medium?.url
            ? `http://localhost:1337${img.attributes.formats.medium.url}`
            : imageUrl;
        } else {
          console.warn('Estrutura de imagem não reconhecida:', img);
          return null;
        }

        return { url: imageUrl, preview: previewUrl };
      })
      .filter(Boolean);
  }

  if (images.length === 0) {
    images = [
      {
        url: 'https://via.placeholder.com/800x600/e5e7eb/9ca3af?text=Sem+Imagem',
        preview: 'https://via.placeholder.com/800x600/e5e7eb/9ca3af?text=Sem+Imagem',
      },
    ];
  }

  const handleBackdropClick = e => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <>
      {/* Modal Principal */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-center justify-center p-0"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-lg max-w-6xl w-full h-[90vh] overflow-y-scroll">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold">{imovel.titulo}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>

          <div className="flex flex-col md:flex-row flex-1">
            {/* Coluna Esquerda */}
            <div className="flex-1 flex flex-col">
              <button
                onClick={() => setShowFullscreenGallery(true)}
                className="w-full bg-blue-600 text-white p-4 rounded mb-4 hover:bg-blue-700 transition"
              >
                Abrir Galeria em Tela Cheia
              </button>

              <div className="flex-1">
                <ImageGallery
                  images={images}
                  propertyTitle={imovel.titulo}
                  fullscreen={false}
                  showArrows
                />
              </div>

              {/* Mapa */}
              <div className="mt-6 p-4">
                <h4 className="font-semibold mb-2">Localização - {imovel.cidade}</h4>
                <div className="rounded overflow-hidden border">
                  <iframe
                    title="mapa"
                    className="w-full h-64"
                    loading="lazy"
                    allowFullScreen
                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                      imovel.endereco || imovel.cidade
                    )}&output=embed`}
                  ></iframe>
                </div>
              </div>
            </div>

            {/* Coluna Direita */}
            <div className="w-full md:w-96 p-6 flex-shrink-0">
              <h3 className="text-lg font-semibold mb-4">Detalhes do Imóvel</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Preço:</span>
                  <PriceFormatter price={imovel.preco} showAllCurrencies />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cidade:</span>
                  <span>{imovel.cidade}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo:</span>
                  <span>{t(imovel.tipo)}</span>
                </div>
                {imovel.area && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Área:</span>
                    <span>{imovel.area}m²</span>
                  </div>
                )}
                {imovel.quartos && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quartos:</span>
                    <span>{imovel.quartos}</span>
                  </div>
                )}
                {imovel.banheiros && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Banheiros:</span>
                    <span>{imovel.banheiros}</span>
                  </div>
                )}
              </div>

              {imovel.descricao && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Descrição</h4>
                  <p className="text-gray-700 leading-relaxed">{imovel.descricao}</p>
                </div>
              )}

              <div className="mt-6">
                <h4 className="font-semibold mb-4">Entre em Contato</h4>
                <button
                  onClick={() => {
                    const message = `Olá! Tenho interesse no imóvel: ${imovel.titulo}`;
                    const phoneNumber = '595XXXXXXXXX';
                    window.open(
                      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
                      '_blank'
                    );
                  }}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  WhatsApp: Tenho interesse!
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Fullscreen */}
      {showFullscreenGallery && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-[9999] flex items-center justify-center"
          onClick={() => setShowFullscreenGallery(false)}
        >
          <div
            className="relative w-full h-full max-w-7xl mx-auto p-4 flex items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-white text-3xl font-bold"
              onClick={() => setShowFullscreenGallery(false)}
            >
              ×
            </button>

            <ImageGallery
              images={images}
              propertyTitle={imovel.titulo}
              fullscreen
              showArrows
            />
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyDetails;
