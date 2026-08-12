import CFG from './config.json';
import '../../_components/styles.css';
import HeroMaquina from '../../_components/HeroMaquina';
import TrustBar from '../../_components/TrustBar';
import PlacaHub from './PlacaHub';
import Linhas from './Linhas';
import WhySection from '../../_components/WhySection';
import Testimonials from '../../_components/Testimonials';
import TechnicalBlock from '../../_components/TechnicalBlock';
import FAQ from '../../_components/FAQ';
import FinalCTA from '../../_components/FinalCTA';
import Footer from '../../_components/Footer';
import { WhatsAppIcon } from '../../_components/atoms';
import { waLink } from '../../_components/lib/wa';
import { buildJsonLd } from '../../_components/lib/jsonld';

export const dynamic = 'force-static';

const SITE_URL = 'https://www.armazemautopecas.com.br';
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

// Hub genérico: sem catálogo de OEMs — offerCount fica ausente no AggregateOffer.
const jsonLd = buildJsonLd(CFG, PAGE_URL, {});

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <link rel="preload" as="image" href={`/injecao-diesel/${CFG.slug}/assets/hero-static.webp`} type="image/webp" fetchPriority="high" />
      <link rel="preload" as="font" type="font/woff2" crossOrigin="anonymous" href="/injecao-diesel/fonts/fC1_PZJEZG-e9gHhdI4-NBbfd2ys3SjJCx1czNDu.woff2" />

      <HeroMaquina cfg={CFG} />
      <TrustBar cfg={CFG} style="numbers" />
      <PlacaHub cfg={CFG} />
      <Linhas />
      <WhySection cfg={CFG} style="stacked" />
      <Testimonials cfg={CFG} />
      <TechnicalBlock cfg={CFG} />
      <FAQ cfg={CFG} />
      <FinalCTA cfg={CFG} />
      <Footer />

      <a className="wa-fab" href={waLink(CFG.wa.fab_default, CFG.slug)} target="_blank" rel="noreferrer" aria-label="WhatsApp">
        <WhatsAppIcon size={24} />
      </a>
    </>
  );
}
