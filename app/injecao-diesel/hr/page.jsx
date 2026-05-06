import CFG from './config.json';
import '../_components/styles.css';
import LandingClient from '../_components/LandingClient';
import { buildJsonLd } from '../_components/lib/jsonld';

export const dynamic = 'force-static';

const SITE_URL = 'https://landing-pages-armazem-diesel.vercel.app';
const PAGE_URL = `${SITE_URL}${CFG.seo.canonical_path}`;
const OG_IMAGE = `${SITE_URL}${CFG.seo.canonical_path}${CFG.seo.og_image}`;

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: CFG.seo.title,
  description: CFG.seo.description,
  alternates: { canonical: CFG.seo.canonical_path },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Armazém Auto Peças',
    title: CFG.seo.title,
    description: CFG.seo.description,
    url: PAGE_URL,
    images: [{ url: OG_IMAGE, alt: CFG.seo.og_image_alt }],
  },
  twitter: {
    card: 'summary_large_image',
    title: CFG.seo.title,
    description: CFG.seo.twitter_description,
    images: [OG_IMAGE],
  },
};

const jsonLd = buildJsonLd(CFG, PAGE_URL);

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <link rel="preload" as="image" href={`/${CFG.slug}/${CFG.hero.foto_static}`} type="image/webp" fetchPriority="high" />
      <LandingClient cfg={CFG} />
    </>
  );
}
