// src/components/LoadingSpinner.js
import React from 'react';

// Spinner básico animado
export const LoadingSpinner = ({ 
  size = 'md', 
  color = 'blue',
  className = '',
  text = null 
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    white: 'text-white',
    green: 'text-green-600',
    red: 'text-red-600'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`}>
        <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      {text && <span className={`ml-2 ${colorClasses[color]}`}>{text}</span>}
    </div>
  );
};

// Dots animados
export const LoadingDots = ({ 
  size = 'md',
  color = 'blue',
  className = '' 
}) => {
  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    gray: 'bg-gray-600',
    white: 'bg-white'
  };

  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`${dotSizes[size]} ${colorClasses[color]} rounded-full animate-pulse`}
          style={{
            animationDelay: `${index * 0.2}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );
};

// Skeleton para cards de propriedades
export const PropertyCardSkeleton = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden animate-pulse ${className}`}>
      {/* Imagem skeleton */}
      <div className="w-full h-48 bg-gray-300"></div>
      
      <div className="p-4 space-y-3">
        {/* Título */}
        <div className="h-5 bg-gray-300 rounded w-4/5"></div>
        
        {/* Localização */}
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
        </div>
        
        {/* Características */}
        <div className="flex space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <div className="h-3 bg-gray-300 rounded w-8"></div>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <div className="h-3 bg-gray-300 rounded w-8"></div>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <div className="h-3 bg-gray-300 rounded w-10"></div>
          </div>
        </div>
        
        {/* Preço */}
        <div className="h-6 bg-gray-300 rounded w-1/2"></div>
        
        {/* Botões */}
        <div className="flex space-x-2 pt-2">
          <div className="flex-1 h-10 bg-gray-300 rounded"></div>
          <div className="w-12 h-10 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  );
};

// Skeleton para lista de propriedades
export const PropertiesListSkeleton = ({ 
  count = 6,
  columns = 3,
  className = '' 
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <PropertyCardSkeleton key={index} />
      ))}
    </div>
  );
};

// Loading para página inteira
export const PageLoading = ({ 
  message = "Carregando...",
  submessage = null,
  showSpinner = true,
  className = ''
}) => {
  return (
    <div className={`min-h-screen flex flex-col justify-center items-center bg-gray-50 ${className}`}>
      {showSpinner && <LoadingSpinner size="xl" />}
      <div className="mt-6 text-center">
        <p className="text-xl text-gray-700 font-medium">{message}</p>
        {submessage && (
          <p className="mt-2 text-gray-500">{submessage}</p>
        )}
      </div>
    </div>
  );
};

// Loading para seções específicas
export const SectionLoading = ({ 
  title = "Carregando dados...",
  rows = 3,
  className = ''
}) => {
  return (
    <div className={`space-y-4 animate-pulse ${className}`}>
      {title && (
        <div className="mb-6">
          <div className="h-6 bg-gray-300 rounded w-1/4"></div>
        </div>
      )}
      
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex space-x-4">
          <div className="rounded-full bg-gray-300 h-10 w-10 flex-shrink-0"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Progress bar animado
export const ProgressBar = ({ 
  progress = 0,
  className = '',
  showPercentage = true,
  color = 'blue' 
}) => {
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600'
  };

  return (
    <div className={`w-full ${className}`}>
      {showPercentage && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progresso</span>
          <span className="text-sm font-medium text-gray-700">{progress}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ease-out ${colorClasses[color]}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

// Loading com overlay
export const OverlayLoading = ({ 
  show = false,
  message = "Processando...",
  children,
  blur = true
}) => {
  if (!show) return children;

  return (
    <div className="relative">
      <div className={`${blur ? 'filter blur-sm' : 'opacity-50'} pointer-events-none`}>
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-lg font-medium text-gray-700">{message}</p>
        </div>
      </div>
    </div>
  );
};

// Loading para tabelas
export const TableSkeleton = ({ 
  rows = 5,
  columns = 4,
  hasHeader = true,
  className = ''
}) => {
  return (
    <div className={`overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg ${className}`}>
      <table className="min-w-full divide-y divide-gray-300">
        {hasHeader && (
          <thead className="bg-gray-50">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="px-6 py-3">
                  <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Loading para formulários
export const FormSkeleton = ({ 
  fields = 4,
  hasSubmitButton = true,
  className = ''
}) => {
  return (
    <div className={`space-y-6 animate-pulse ${className}`}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index}>
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-300 rounded w-full"></div>
        </div>
      ))}
      
      {hasSubmitButton && (
        <div className="pt-4">
          <div className="h-12 bg-gray-300 rounded w-32"></div>
        </div>
      )}
    </div>
  );
};

// Pulse loading para textos
export const TextSkeleton = ({ 
  lines = 3,
  className = ''
}) => {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index}>
          <div className={`h-4 bg-gray-300 rounded ${
            index === lines - 1 ? 'w-2/3' : 'w-full'
          }`}></div>
        </div>
      ))}
    </div>
  );
};

// Loading adaptável com diferentes estados
export const AdaptiveLoading = ({ 
  type = 'properties',
  count = 6,
  className = ''
}) => {
  switch (type) {
    case 'properties':
      return <PropertiesListSkeleton count={count} className={className} />;
    case 'table':
      return <TableSkeleton rows={count} className={className} />;
    case 'form':
      return <FormSkeleton fields={count} className={className} />;
    case 'text':
      return <TextSkeleton lines={count} className={className} />;
    case 'section':
      return <SectionLoading rows={count} className={className} />;
    default:
      return <LoadingSpinner size="lg" className={className} />;
  }
};