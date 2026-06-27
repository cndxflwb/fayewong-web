import { useEffect } from 'react';

interface MetaTagsProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
}

export function useMetaTags({ title, description, image, url }: MetaTagsProps) {
  useEffect(() => {
    const siteName = '菲樂集';
    const fullTitle = `${title} - ${siteName}`;
    const desc = description || '王菲演唱歌曲編年 · 赤霓編';
    const img = image || '/og-default.png';

    // Open Graph
    setMeta('og:title', fullTitle);
    setMeta('og:description', desc);
    setMeta('og:image', img);
    setMeta('og:site_name', siteName);
    setMeta('og:type', 'music.song');
    if (url) setMeta('og:url', url);

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', desc);
    setMeta('twitter:image', img);

    // Standard
    setMeta('description', desc);

    return () => {
      // cleanup - reset to defaults
      setMeta('og:title', siteName);
      setMeta('og:description', '王菲演唱歌曲編年 · 赤霓編');
      setMeta('og:image', '/og-default.png');
    };
  }, [title, description, image, url]);
}

function setMeta(name: string, content: string) {
  const isOg = name.startsWith('og:') || name.startsWith('twitter:');
  const attr = isOg ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}
