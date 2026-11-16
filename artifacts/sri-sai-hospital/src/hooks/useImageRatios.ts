import { useEffect, useState } from 'react';

// Reads each photo's width / height once it loads, so the gallery can size every photo to its true shape.
// Until a photo has loaded it is laid out as 4:3.
const cache = new Map<string, number>();
const DEFAULT_RATIO = 4 / 3;

export function useImageRatios(sources: string[]) {
  const [ratios, setRatios] = useState<Record<string, number>>(() =>
    Object.fromEntries(sources.filter((src) => cache.has(src)).map((src) => [src, cache.get(src)!])),
  );

  useEffect(() => {
    let cancelled = false;
    sources.forEach((src) => {
      if (cache.has(src)) return;
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => {
        if (!image.naturalWidth || !image.naturalHeight) return;
        const ratio = image.naturalWidth / image.naturalHeight;
        cache.set(src, ratio);
        if (!cancelled) setRatios((current) => ({ ...current, [src]: ratio }));
      };
      image.src = src;
    });
    return () => { cancelled = true; };
  }, [sources.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps

  return (src: string) => ratios[src] ?? cache.get(src) ?? DEFAULT_RATIO;
}
