import React, { useState, useEffect } from 'react';

const ImageGallery = ({ images = [], propertyTitle = '', onClose, fullscreen = false, showArrows = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});

  // Resetar carregamento ao mudar imagem ou fullscreen
  useEffect(() => {
    setIsLoading(true);
  }, [currentIndex, fullscreen]);

  // Navegação por teclado
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
          break;
        case 'ArrowRight':
          setCurrentIndex(prev => (prev + 1) % images.length);
          break;
        case 'Escape':
          onClose && onClose();
          break;
        default:
          break;
      }
    };

    if (images.length > 0) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [images.length, onClose]);

  const getImageUrl = (image) => {
    if (!image) return '';
    if (typeof image === 'string') return image.startsWith('http') ? image : `http://localhost:1337${image}`;
    return image.url ? (image.url.startsWith('http') ? image.url : `http://localhost:1337${image.url}`) : '';
  };

  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center text-gray-500">
          <div className="text-6xl mb-4">🏠</div>
          <p className="text-lg">Nenhuma imagem disponível</p>
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex];
  const imageUrl = getImageUrl(currentImage);

  return (
    <div className={`${fullscreen ? 'w-full h-full flex items-center justify-center' : 'relative h-96 md:h-[500px] flex items-center justify-center'}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {imageErrors[currentIndex] ? (
        <div className="flex items-center justify-center h-full text-gray-700">
          <div className="text-center">
            <div className="text-4xl mb-2">⚠️</div>
            <p>Erro ao carregar imagem</p>
          </div>
        </div>
      ) : (
        <img
          src={imageUrl}
          alt={`${propertyTitle} - Imagem ${currentIndex + 1}`}
          className={`max-w-full max-h-full object-contain transition-opacity duration-500 ease-in-out ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setImageErrors(prev => ({ ...prev, [currentIndex]: true }));
            setIsLoading(false);
          }}
        />
      )}

      {/* Setas grandes */}
      {showArrows && images.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((currentIndex - 1 + images.length) % images.length)}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-80 text-white p-4 rounded-full transition-all z-10"
          >
            ◀
          </button>

          <button
            onClick={() => setCurrentIndex((currentIndex + 1) % images.length)}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-80 text-white p-4 rounded-full transition-all z-10"
          >
            ▶
          </button>
        </>
      )}
    </div>
  );
};

export default ImageGallery;
