import React, { useState } from 'react';
import ImageUpload from './ImageUpload';

const TestUpload = () => {
  const [uploadedImages, setUploadedImages] = useState([]);

  const handleImagesChange = (images) => {
    console.log('Imagens atualizadas:', images);
    setUploadedImages(images);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Teste de Upload de Imagens
          </h1>
          <p className="text-gray-600 mb-8">
            Teste o sistema de upload integrado com Strapi CMS
          </p>

          <ImageUpload
            onImagesChange={handleImagesChange}
            maxImages={8}
          />

          {/* Debug info */}
          {uploadedImages.length > 0 && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">
                Dados das imagens (Debug):
              </h3>
              <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-60">
                {JSON.stringify(uploadedImages, null, 2)}
              </pre>
            </div>
          )}

          {/* Integração com Strapi */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">
              Como integrar com imóveis:
            </h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>1. As imagens são enviadas automaticamente para o Strapi</p>
              <p>2. Use os IDs das imagens para associar com imóveis</p>
              <p>3. Campo "imagens" no Strapi deve ser do tipo "Media (multiple files)"</p>
              <p>4. No formulário de imóvel, passe os IDs: {`{imagens: [${uploadedImages.map(img => img.strapiId).join(', ')}]}`}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestUpload;