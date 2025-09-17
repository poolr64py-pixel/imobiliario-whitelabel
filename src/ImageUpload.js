import React, { useState, useCallback } from 'react';

const ImageUpload = ({ 
  onImagesChange, 
  maxImages = 10, 
  existingImages = [],
  apiBase = 'http://localhost:1337'
}) => {
  const [images, setImages] = useState(existingImages);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Upload para Strapi
  const uploadToStrapi = async (file) => {
    const formData = new FormData();
    formData.append('files', file);

    try {
      const response = await fetch(`${apiBase}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result[0]; // Strapi retorna array
    } catch (error) {
      console.error('Erro no upload:', error);
      throw error;
    }
  };

  const handleFileSelect = useCallback(async (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024 // 10MB max
    );

    if (images.length + validFiles.length > maxImages) {
      alert(`Máximo ${maxImages} imagens permitidas`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    const newImages = [];
    
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      
      try {
        // Criar preview local primeiro
        const preview = URL.createObjectURL(file);
        const tempImage = {
          id: Date.now() + i,
          file,
          preview,
          name: file.name,
          size: file.size,
          uploading: true
        };
        
        // Atualizar estado com preview
        const currentImages = [...images, ...newImages, tempImage];
        setImages(currentImages);
        onImagesChange(currentImages);
        
        // Upload real para Strapi
        const uploadedFile = await uploadToStrapi(file);
        
        // Atualizar com dados do Strapi
        const finalImage = {
          id: uploadedFile.id,
          strapiId: uploadedFile.id,
          url: `${apiBase}${uploadedFile.url}`,
          preview: `${apiBase}${uploadedFile.formats?.thumbnail?.url || uploadedFile.url}`,
          name: uploadedFile.name,
          size: file.size,
          uploading: false,
          uploaded: true
        };
        
        newImages.push(finalImage);
        
        // Atualizar progresso
        setUploadProgress(Math.round(((i + 1) / validFiles.length) * 100));
        
      } catch (error) {
        console.error(`Erro ao enviar ${file.name}:`, error);
        alert(`Erro ao enviar ${file.name}: ${error.message}`);
      }
    }
    
    // Estado final
    const finalImages = [...images, ...newImages];
    setImages(finalImages);
    onImagesChange(finalImages);
    setUploading(false);
    setUploadProgress(0);
    
  }, [images, maxImages, onImagesChange, apiBase]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleInputChange = useCallback((e) => {
    handleFileSelect(e.target.files);
  }, [handleFileSelect]);

  const removeImage = useCallback((imageId) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  }, [images, onImagesChange]);

  const moveImage = useCallback((dragIndex, hoverIndex) => {
    const draggedImage = images[dragIndex];
    const newImages = [...images];
    newImages.splice(dragIndex, 1);
    newImages.splice(hoverIndex, 0, draggedImage);
    setImages(newImages);
    onImagesChange(newImages);
  }, [images, onImagesChange]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
          id="file-upload"
          disabled={uploading}
        />
        
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="space-y-4">
            <div className="text-4xl text-gray-400">📸</div>
            <div>
              <p className="text-lg font-medium text-gray-700">
                {uploading ? `Enviando para servidor... ${uploadProgress}%` : 'Arraste imagens ou clique para selecionar'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                PNG, JPG, JPEG até 10MB cada. Máximo {maxImages} imagens.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Upload automático para Strapi CMS
              </p>
            </div>
          </div>
        </label>
      </div>

      {/* Progress Bar */}
      {uploading && (
        <div className="mt-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1 text-center">
            Enviando para Strapi... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-700">
              Imagens ({images.length}/{maxImages})
            </h3>
            <button
              onClick={() => {
                setImages([]);
                onImagesChange([]);
              }}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
              disabled={uploading}
            >
              Remover todas
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="relative group rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="aspect-square">
                  <img
                    src={image.preview || image.url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Upload overlay */}
                  {image.uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                        <p className="text-xs">Enviando...</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-x-2">
                    <button
                      onClick={() => removeImage(image.id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                      title="Remover imagem"
                      disabled={image.uploading}
                    >
                      🗑️
                    </button>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = image.url || image.preview;
                        link.download = image.name;
                        link.click();
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"
                      title="Download"
                    >
                      ⬇️
                    </button>
                  </div>
                </div>
                
                {/* Image info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                  <p className="text-white text-xs truncate" title={image.name}>
                    {image.name}
                  </p>
                  <p className="text-gray-300 text-xs">
                    {formatFileSize(image.size)}
                  </p>
                  {image.uploaded && (
                    <p className="text-green-300 text-xs">✅ No servidor</p>
                  )}
                </div>
                
                {/* Order indicator */}
                <div className="absolute top-2 left-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
          
          {/* Instructions */}
          <p className="text-sm text-gray-500 mt-4 text-center">
            A primeira imagem será a foto principal. Imagens são salvas automaticamente no Strapi.
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;