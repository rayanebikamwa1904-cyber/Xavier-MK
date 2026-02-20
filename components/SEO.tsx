import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title = "My Folio-Tag | L'Arène des Empires Numériques", 
  description = "Trouvez les meilleurs talents et prestataires de Kinshasa. Propulsé par Hashtag Digital, My Folio-Tag est la plateforme d'élite pour créer et découvrir des portfolios professionnels en RDC.", 
  image = "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=630", // Default banner
  url = "https://myfoliotag.com",
  type = "website"
}) => {
  const siteTitle = title.includes("My Folio-Tag") ? title : `${title} | My Folio-Tag`;

  return (
    <Helmet>
      {/* Standard metadata */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;
