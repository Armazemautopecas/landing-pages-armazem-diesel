// Schema.org JSON-LD pra cada LP. Consumido por LandingClient via buildJsonLd(cfg, pageUrl).
// Refactor 2026-05-07 (PR #8): adicionado image, brand single (string concatenada se multi),
// priceSpecification.priceRange, aggregateRating, hasMerchantReturnPolicy, shippingDetails.
// Resolve 5 erros do Google Rich Results Test que apareceram após primeira validação em prod.

const SITE_URL = 'https://www.armazemautopecas.com.br';

const AUTOPARTS_STORE = {
  '@type': 'AutoPartsStore',
  '@id': `${SITE_URL}/#business`,
  name: 'Armazém Auto Peças',
  url: SITE_URL,
  telephone: '+5549999484754',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Chapecó',
    addressRegion: 'SC',
    addressCountry: 'BR',
  },
  sameAs: ['https://wa.me/5549999484754'],
};

// Hardcoded — vem do Google Business da Armazém (4,6 ★ · 109 avaliações em 2026-05-07).
// Reflete reputação da loja inteira; aplicado a Product como proxy (Google aceita pra
// merchants pequenos sem reviews individuais por SKU).
const AGGREGATE_RATING = {
  '@type': 'AggregateRating',
  ratingValue: '4.6',
  reviewCount: '109',
  bestRating: '5',
  worstRating: '1',
};

// Política de devolução — 7 dias do CDC (direito de arrependimento). Hardcoded
// porque é igual pra todas as LPs do diesel.
const RETURN_POLICY = {
  '@type': 'MerchantReturnPolicy',
  applicableCountry: 'BR',
  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
  merchantReturnDays: 7,
  returnMethod: 'https://schema.org/ReturnByMail',
  returnFees: 'https://schema.org/FreeReturn',
};

// Frete grátis pra todo o Brasil. Renderizado só quando cfg.seo.product.free_shipping=true.
const FREE_SHIPPING_BR = {
  '@type': 'OfferShippingDetails',
  shippingRate: {
    '@type': 'MonetaryAmount',
    value: '0',
    currency: 'BRL',
  },
  shippingDestination: {
    '@type': 'DefinedRegion',
    addressCountry: 'BR',
  },
  deliveryTime: {
    '@type': 'ShippingDeliveryTime',
    handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
    transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 7, unitCode: 'DAY' },
  },
};

// Brand: 1 só por Product (Google Rich Results não aceita array de Brand). Quando a LP
// é multi-marca (HR = Delphi + Bosch), concatena os nomes em uma única Brand. Não é o
// mais semanticamente correto do Schema.org puro, mas é o que valida em Rich Results
// e reflete bem o que a LP vende ("originais homologados nas duas marcas").
function brandNode(brands) {
  if (!brands || !brands.length) return undefined;
  if (brands.length === 1) return { '@type': 'Brand', name: brands[0] };
  return { '@type': 'Brand', name: brands.join(' e ') };
}

// Parse "R$ 1.000 - R$ 2.000" → { lowPrice: "1000", highPrice: "2000" }
//
// FIX 2026-05-09: antes a gente devolvia priceSpecification.price como a string
// inteira "R$ 1.000 - R$ 2.000". Schema.org aceita Text mas Google Rich Results
// REJEITA — o validador parseia `price` como número e símbolo de moeda + range
// quebra. Resultado: Search Console reportava "missing field priceSpecification"
// pra Amarok e HR.
//
// Forma correta pra range: AggregateOffer com lowPrice + highPrice numéricos.
// Sem símbolo de moeda (vai em priceCurrency separado), sem milhar com ponto
// (Google espera dot como decimal, não milhar; brasileiro "1.000" vira ambíguo).
function parseRange(priceRange) {
  if (!priceRange) return null;
  const m = priceRange.match(/^R\$ ([\d.]+) - R\$ ([\d.]+)$/);
  if (!m) return null;
  // Remove pontos de milhar pra ter número limpo: "1.000" → "1000"
  const low = m[1].replace(/\./g, '');
  const high = m[2].replace(/\./g, '');
  return { low, high };
}

function buildOffersNode(product, sellerId, pageUrl) {
  const range = parseRange(product.price_range);
  if (!range) {
    // Sem range válido → Offer sem price (Google vai reclamar de qualquer jeito,
    // mas pelo menos não emite estrutura inválida)
    return {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'BRL',
      seller: { '@id': sellerId },
      url: pageUrl,
      hasMerchantReturnPolicy: RETURN_POLICY,
      ...(product.free_shipping ? { shippingDetails: FREE_SHIPPING_BR } : {}),
    };
  }
  return {
    '@type': 'AggregateOffer',
    availability: 'https://schema.org/InStock',
    priceCurrency: 'BRL',
    lowPrice: range.low,
    highPrice: range.high,
    seller: { '@id': sellerId },
    url: pageUrl,
    hasMerchantReturnPolicy: RETURN_POLICY,
    ...(product.free_shipping ? { shippingDetails: FREE_SHIPPING_BR } : {}),
  };
}

export function buildJsonLd(cfg, pageUrl) {
  const product = cfg.seo?.product;
  if (!product) {
    throw new Error(`config.json sem cfg.seo.product (slug="${cfg.slug}")`);
  }

  // Image absoluta — Schema.org Product exige. Vem de cfg.seo.og_image, mesmo
  // arquivo do Open Graph (1 imagem só basta — Google Rich Results não distingue).
  const imagePath = cfg.seo.og_image && cfg.seo.canonical_path
    ? `${SITE_URL}${cfg.seo.canonical_path}${cfg.seo.og_image}`
    : undefined;

  const productNode = {
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: imagePath,
    brand: brandNode(product.brands),
    category: 'Peça automotiva — sistema de injeção diesel',
    isRelatedTo: (product.vehicles || []).map((name) => ({ '@type': 'Vehicle', name })),
    aggregateRating: AGGREGATE_RATING,
    offers: buildOffersNode(product, AUTOPARTS_STORE['@id'], pageUrl),
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [AUTOPARTS_STORE, productNode],
  };
}
