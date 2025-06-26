import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSeoMetadata } from '../hooks/useSeoMetadata';

interface SeoHeadProps {
  pagePath?: string;
  entityId?: string;
  overrides?: {
    title?: string;
    description?: string;
    keywords?: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImageUrl?: string;
  };
}

const SeoHead: React.FC<SeoHeadProps> = ({ pagePath, entityId, overrides = {} }) => {
  const { metadata, isLoading, error } = useSeoMetadata({ pagePath, entityId });

  if (isLoading || error) {
    // Still render minimal SEO even during loading or on error
    return (
      <Helmet>
        <title>Loventy - Invitations de mariage élégantes</title>
        <meta name="description" content="Créez, personnalisez et envoyez des invitations de mariage électroniques élégantes. Suivez les RSVP en temps réel avec Loventy." />
      </Helmet>
    );
  }

  // Combine metadata with any overrides
  const finalMetadata = {
    ...metadata,
    meta_title: overrides.title || metadata.meta_title,
    meta_description: overrides.description || metadata.meta_description,
    meta_keywords: overrides.keywords || metadata.meta_keywords,
    canonical_url: overrides.canonicalUrl || metadata.canonical_url,
    og_title: overrides.ogTitle || overrides.title || metadata.og_title || metadata.meta_title,
    og_description: overrides.ogDescription || overrides.description || metadata.og_description || metadata.meta_description,
    og_image_url: overrides.ogImageUrl || metadata.og_image_url
  };

  const siteName = 'Loventy';
  const currentUrl = window.location.href;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalMetadata.meta_title}</title>
      <meta name="description" content={finalMetadata.meta_description} />
      {finalMetadata.meta_keywords && (
        <meta name="keywords" content={finalMetadata.meta_keywords} />
      )}
      
      {/* Canonical URL */}
      <link rel="canonical" href={finalMetadata.canonical_url || currentUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={finalMetadata.canonical_url || currentUrl} />
      <meta property="og:title" content={finalMetadata.og_title} />
      <meta property="og:description" content={finalMetadata.og_description} />
      <meta property="og:site_name" content={siteName} />
      {finalMetadata.og_image_url && (
        <meta property="og:image" content={finalMetadata.og_image_url} />
      )}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={finalMetadata.canonical_url || currentUrl} />
      <meta name="twitter:title" content={finalMetadata.og_title} />
      <meta name="twitter:description" content={finalMetadata.og_description} />
      {finalMetadata.og_image_url && (
        <meta name="twitter:image" content={finalMetadata.og_image_url} />
      )}
      
      {/* Additional SEO-friendly meta tags */}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="French" />
      
      {/* PWA related meta tags */}
      <meta name="theme-color" content="#D4A5A5" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={siteName} />
      <meta name="application-name" content={siteName} />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
    </Helmet>
  );
};

export default SeoHead;