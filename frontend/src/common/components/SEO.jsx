import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'قرعة (Qor3a)'
const SITE_URL = 'https://qor3a.ye'
const DEFAULT_DESC = 'منصة يمنية متخصصة في التقديم لقرعة الهجرة العشوائية الأمريكية (DV Lottery). نوفر فحص الصور بالذكاء الاصطناعي، التعبئة والتقديم الرسمي، واستخراج Confirmation Number.'
const DEFAULT_KEYWORDS = 'قرعة, لوتري, DV Lottery, Green Card, قرعة أمريكا, هجرة أمريكا, تأشيرة التنوع, dvprogram.state.gov, اليمن'

export default function SEO({
  title,
  description = DEFAULT_DESC,
  keywords = DEFAULT_KEYWORDS,
  image = '/images/og-image.png',
  url = '',
  type = 'website',
  publishedTime,
  jsonLd,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | منصة التقديم على قرعة اللوتري DV Lottery`
  const fullUrl = `${SITE_URL}${url}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={`${SITE_URL}${image}`} />
      <meta property="og:locale" content="ar_YE" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${SITE_URL}${image}`} />

      {/* Arabic language */}
      <meta name="language" content="Arabic" />
      <meta name="geo.region" content="YE" />
      <meta name="geo.country" content="YE" />

      {/* Published time for articles */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  )
}

export function OrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    description: DEFAULT_DESC,
    address: { '@type': 'PostalAddress', addressCountry: 'YE' },
    areaServed: 'YE',
  }
}

export function WebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESC,
    inLanguage: 'ar',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function FAQSchema(questions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: { '@type': 'Answer', text: q.answer },
    })),
  }
}

export function BreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}
