'use client';

import { useThemeConfig } from '@/components/providers/TenantProvider';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  className = '', 
  text 
}: LoadingSpinnerProps) {
  const { primaryColor } = useThemeConfig();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`spinner ${sizeClasses[size]}`}
        style={{ borderTopColor: primaryColor }}
      />
      {text && (
        <p className={`mt-3 text-gray-600 ${textSizeClasses[size]}`}>
          {text}
        </p>
      )}
    </div>
  );
}

// Componente para loading de página inteira
export function PageLoader({ text = 'Carregando...' }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

// Componente para loading de seção
export function SectionLoader({ text, className = '' }: { text?: string; className?: string }) {
  return (
    <div className={`py-20 flex items-center justify-center ${className}`}>
      <LoadingSpinner size="md" text={text} />
    </div>
  );
}

// Componente para loading inline
export function InlineLoader({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return (
    <div className="inline-flex items-center">
      <LoadingSpinner size={size} />
    </div>
  );
}