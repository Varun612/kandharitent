import { useEffect } from 'react';

const DEFAULT_TITLE = 'Kandhari Tent & Caterers | Dwarka Shri Lawn | Kanpur Road, Lucknow';
const DEFAULT_DESCRIPTION = 'Kandhari Tent & Caterers and Dwarka Shri Lawn: Premier wedding tent rentals, luxury German hangars, royal catering, and open lawn venue on Kanpur Road (Opp. Pillar No. 37), Lucknow. Direct family commitment, 18% GST and DRDO approved contractor.';
const DEFAULT_IMAGE = '/media/lawns/lawn-main.jpg';
const SITE_URL = 'https://kandharitent.com';

const SEO = ({ 
  title, 
  description, 
  canonical, 
  ogImage, 
  schema 
}) => {
  useEffect(() => {
    // 1. Page Title
    const fullTitle = title 
      ? `${title} | Kandhari Tent & Caterers Lucknow` 
      : DEFAULT_TITLE;
    document.title = fullTitle;

    // 2. Meta Description
    const metaDesc = description || DEFAULT_DESCRIPTION;
    let descTag = document.querySelector('meta[name="description"]');
    if (!descTag) {
      descTag = document.createElement('meta');
      descTag.setAttribute('name', 'description');
      document.head.appendChild(descTag);
    }
    descTag.setAttribute('content', metaDesc);

    // 3. Canonical URL
    const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : window.location.href.split('?')[0];
    let canonTag = document.querySelector('link[rel="canonical"]');
    if (!canonTag) {
      canonTag = document.createElement('link');
      canonTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonTag);
    }
    canonTag.setAttribute('href', canonicalUrl);

    // 4. Open Graph Tags
    const updateOrCreateMeta = (property, content) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateOrCreateMeta('og:title', fullTitle);
    updateOrCreateMeta('og:description', metaDesc);
    updateOrCreateMeta('og:url', canonicalUrl);
    updateOrCreateMeta('og:image', ogImage ? (ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`) : `${SITE_URL}${DEFAULT_IMAGE}`);
    updateOrCreateMeta('og:site_name', 'Kandhari Tent & Caterers & Dwarka Shri Lawn');

    // 5. Schema.org JSON-LD
    let scriptTag = document.getElementById('route-schema');
    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'route-schema';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schema);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      // Clean up route schema on page unmount
      const existing = document.getElementById('route-schema');
      if (existing) existing.remove();
    };
  }, [title, description, canonical, ogImage, schema]);

  return null;
};

export default SEO;
