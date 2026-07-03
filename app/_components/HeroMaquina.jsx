import { waLink } from './lib/wa';

// Variante server-only do Hero pra LPs de máquina/caminhão pesado (segmento
// máquinas — sem consulta por placa). Diferenças vs Hero.jsx:
//  - Sem <Selector /> (público busca por código da peça, não placa)
//  - CTA principal = link direto pro WhatsApp bridge (mesmo padrão do fab)
//  - Trusts adaptados (sem "CONSULTA POR PLACA")
export default function HeroMaquina({ cfg }) {
  const slug = cfg.slug;
  const fileName = cfg.hero.foto_static;
  const base = fileName.replace(/^assets\//, '').replace(/\.webp$/, '');
  const desktopSrc = `/injecao-diesel/${slug}/assets/${base}.webp`;
  const mobileSrc = `/injecao-diesel/${slug}/assets/${base}-600.webp`;
  const heroWa = waLink(cfg.wa.hero_link, slug);

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
            <a className="hero-cta-mobile" href={heroWa} target="_blank" rel="noreferrer">
              <span>{cfg.hero.cta_mobile_label}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="13 6 19 12 13 18" />
              </svg>
            </a>
            <ul className="hero-trusts-desktop" aria-label="Garantias">
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
