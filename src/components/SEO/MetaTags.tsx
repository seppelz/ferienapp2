import React from 'react';
import { Helmet } from 'react-helmet-async';

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  canonicalUrl?: string;
}

export const MetaTags: React.FC<MetaTagsProps> = ({
  title = 'Brückentage 2026 & Ferienplaner 2026 | Urlaubsplanung optimal',
  description = 'Brückentage 2026 optimal nutzen! Intelligenter Ferienplaner 2026 mit allen Feiertagen, Schulferien und Brückentag-Empfehlungen für Deutschland. Maximiere deinen Urlaub 2026.',
  keywords = 'Brückentage 2026, Ferienplaner 2026, Urlaubsplaner 2026, Feiertage 2026 Deutschland, Brückentage 2026 Deutschland, Urlaubsplanung 2026, Schulferien 2026, Brückentage optimal nutzen, Feiertage Kalender 2026, Urlaubstage planen 2026',
  ogImage = '/holiday/og-image.jpg',
  ogUrl = window.location.origin + '/holiday',
  canonicalUrl = window.location.origin + '/holiday',
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Holiday Planner",
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "Web",
    "description": description,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR"
    },
    "featureList": [
      "Brückentage-Optimierung",
      "Zwei-Personen Planung",
      "Bundesland-spezifische Feiertage",
      "Offline Verfügbarkeit",
      "Tastatursteuerung"
    ],
    "applicationSubCategory": "Vacation Planning",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "softwareVersion": "1.0",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "ratingCount": "1",
      "bestRating": "5",
      "worstRating": "1"
    },
    "creator": {
      "@type": "Organization",
      "name": "Holiday Planner",
      "url": window.location.origin
    },
    "screenshot": ogImage,
    "datePublished": "2024-01-01",
    "dateModified": new Date().toISOString().split('T')[0],
    "inLanguage": "de-DE"
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <html lang="de" />
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="de_DE" />
      <meta property="og:site_name" content="Holiday Planner" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={ogUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
      <meta name="twitter:creator" content="@holidayplanner" />

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="German" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="Holiday Planner" />
      <meta name="theme-color" content="#4299e1" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="application-name" content="Holiday Planner" />
      <meta name="apple-mobile-web-app-title" content="Holiday Planner" />
      <meta name="msapplication-TileColor" content="#4299e1" />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />

      {/* PWA Tags */}
      <link rel="manifest" href="/holiday/manifest.json" />
      <link rel="apple-touch-icon" href="/holiday/icons/icon-192x192.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/holiday/icons/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/holiday/icons/favicon-16x16.png" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* Preconnect to important third-party domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    </Helmet>
  );
}; 