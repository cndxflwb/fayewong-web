import { useState } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
}

export default function LazyImage({ src, alt, className = '', aspectRatio }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${aspectRatio || ''}`}>
      {/* 骨架屏 */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-bg-dark animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent skeleton-shimmer" />
        </div>
      )}

      {/* 加载失败占位 */}
      {error && (
        <div className="absolute inset-0 bg-bg-dark flex items-center justify-center">
          <span className="text-text-muted text-xs">載入失敗</span>
        </div>
      )}

      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
}
