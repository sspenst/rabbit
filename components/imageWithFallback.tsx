import Image, { ImageProps } from 'next/image';
import React, { useEffect, useState } from 'react';

interface ImageWithFallbackProps extends ImageProps {
  fallback: string;
}

export default function ImageWithFallback({ alt, fallback, src, ...props }: ImageWithFallbackProps) {
  const [error, setError] = useState<React.SyntheticEvent<HTMLImageElement, Event> | null>(null);

  useEffect(() => {
    setError(null);
  }, [src]);

  return (
    <Image
      alt={alt}
      onError={setError}
      src={error ? fallback : src}
      {...props}
    />
  );
}
