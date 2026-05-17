import { useEffect } from 'react';

/**
 * SEO Manager Component
 * Handles dynamic metadata, Open Graph tags, and Schema.org markup.
 */
const SEO = ({ 
  title = "ReviewReply AI - Expert Reputation Management", 
  description = "The #1 Copy-Paste AI Assistant for e-commerce replies. Get professional, context-aware responses for Amazon, Etsy, Google, and Shopify reviews in seconds.",
  canonical = "https://reviewreply-ai.com",
  type = "website",
  image = "https://reviewreply-ai.com/og-image.png",
  schema = null
}) => {
  useEffect(() => {
    // Update Title
    document.title = title;

    // Update Meta Tags
    const updateMeta = (name, content, attr = 'name') => {
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateMeta('description', description);
    
    // Open Graph
    updateMeta('og:title', title, 'property');
    updateMeta('og:description', description, 'property');
    updateMeta('og:type', type, 'property');
    updateMeta('og:image', image, 'property');
    updateMeta('og:url', window.location.href, 'property');

    // Twitter
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', image);

    // Canonical
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical || window.location.href);

    // Schema.org JSON-LD
    const existingSchema = document.getElementById('json-ld-schema');
    if (existingSchema) existingSchema.remove();

    if (schema) {
      const script = document.createElement('script');
      script.id = 'json-ld-schema';
      script.type = 'application/ld+json';
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    }
  }, [title, description, canonical, type, image, schema]);

  return null; // This component doesn't render anything
};

export default SEO;
