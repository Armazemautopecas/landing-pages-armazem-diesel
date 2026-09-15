import { waLink } from './lib/wa';
import { WhatsAppIcon } from './atoms';
import { CTA_PRINCIPAL, CTA_SECUNDARIO } from '@/lib/content';

// Variante server-only do Hero pra LPs de máquina/caminhão pesado (segmento
// máquinas — sem consulta por placa). Diferenças vs Hero.jsx:
//  - Sem <Selector /> (público busca por código da peça, não placa)
//  - CTA principal = pílula vermelha com ícone do WhatsApp (mesmo bloco do
//    Hero.jsx desde 15/09/2026 — padrão fixo do topo, decisão Diego)
//  - Botão secundário só na LP hub `bico-injetor`, que é a única variante deste
//    componente COM busca por placa (identificada por hero.cta_desktop_anchor)
//  - Trusts adaptados (sem "CONSULTA POR PLACA")
export default function HeroMaquina({ cfg }) {
  const slug = cfg.slug;
  const fileName = cfg.hero.foto_static;
  const base = fileName.replace(/^assets\//, '').replace(/\.webp$/, '');
  const desktopSrc = `/injecao-diesel/${slug}/assets/${base}.webp`;
  const mobileSrc = `/injecao-diesel/${slug}/assets/${base}-600.webp`;
  const heroWa = waLink(cfg.wa.hero_link, slug);
  // LP hub (bico-injetor) é a única deste componente com consulta por placa.
  const temBusca = !!cfg.hero.cta_desktop_anchor;

  return (
    <section className="hero sec-navy sec-pad">
      <picture>
        <source media="(max-width: 768px)" srcSet={mobileSrc} type="image/webp" />
        <img
          className="hero-bg"
          src={desktopSrc}
          alt=""
          width="1200"
          height="670"
          fetchPriority="high"
          decoding="async"
        />
      </picture>
      <div className="hero-overlay" />
      <div className="hero-swipe" />
      <div className="container">
        <div className="hero-grid is-stack">
          <div>
            <div className="eyebrow hero-tag">{cfg.hero.eyebrow}</div>
            <h1 className="h1 hero-h1">
              {cfg.hero.h1_linha1}<br />{cfg.hero.h1_linha2}<span className="red-dot" />
              <span className="line-2">{cfg.hero.h1_sub}</span>
            </h1>
            <p className="hero-sub">{cfg.hero.sub}</p>
            {/* Padrão fixo do topo (decisão Diego 15/09/2026): secundário só
                onde existe busca por placa/ano; principal sempre igual —
                pílula vermelha + ícone do WhatsApp + CTA_PRINCIPAL. */}
            <div className={`hero-ctas-mobile ${temBusca ? '' : 'is-single'}`}>
              {temBusca && (
                <a className="hero-cta-mobile is-secondary" href={cfg.hero.cta_desktop_anchor}>
                  <span>{CTA_SECUNDARIO}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="13 6 19 12 13 18" />
                  </svg>
                </a>
              )}
              <a className="hero-cta-wa" href={heroWa} target="_blank" rel="noreferrer">
                <WhatsAppIcon size={18} />
                <span>{CTA_PRINCIPAL}</span>
              </a>
            </div>
            <ul className="hero-trusts" aria-label="Garantias">
              <li>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF021E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                COMPATIBILIDADE PELO CÓDIGO
              </li>
              <li>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF021E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                ORIGINAL OU PRIMEIRA LINHA
              </li>
              <li>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF021E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                ENVIO PRA TODO BRASIL
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
