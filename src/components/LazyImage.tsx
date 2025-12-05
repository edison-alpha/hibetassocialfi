import { useState } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
}

/**
 * ⚡ Optimized lazy-loading image component
 * - Automatically adds loading="lazy" and decoding="async"
 * - Handles loading states
 * - Provides fallback on error
 */
export const LazyImage = ({ 
  src, 
  alt, 
  fallback = '/placeholder.svg', 
  className,
  ...props 
}: LazyImageProps) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      src={error ? fallback : src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn(
        'transition-opacity duration-300',
        loaded ? 'opacity-100' : 'opacity-0',
        className
      )}
      onLoad={() => setLoaded(true)}
      onError={() => {
        setError(true);
        setLoaded(true);
      }}
      {...props}
    />
  );
};

export default LazyImage;
