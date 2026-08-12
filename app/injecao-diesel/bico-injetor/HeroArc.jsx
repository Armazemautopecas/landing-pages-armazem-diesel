import { waLink } from '../../_components/lib/wa';

// Hero da LP HUB de bico injetor. Diferente do HeroMaquina (foto de fundo
// única): aqui o visual é um LEQUE de veiculos diesel voltados pro cliente —
// as principais linhas que a Armazem atende, em cards 4:3 dispostos num arco.
// Server component (estatico). Os cards moram em
// /injecao-diesel/bico-injetor/assets/car-<slug>.webp (4:3, 1200x900).

const CARS = [
  { slug: 'ranger', nome: 'Ford Ranger' },
  { slug: 's10', nome: 'Chevrolet S10' },
  { slug: 'hilux', nome: 'Toyota Hilux' },
  { slug: 'amarok', nome: 'VW Amarok' },
  { slug: 'toro', nome: 'Fiat Toro' },
  { slug: 'commander', nome: 'Jeep Commander' },
  { slug: 'sw4', nome: 'Toyota SW4' },
];

export default function HeroArc({ cfg }) {
  const slug = cfg.slug;
  const heroWa = waLink(cfg.wa.hero_link, slug);

  return (
    <section className="hero hero-arc sec-navy sec-pad">
      <div className="hero-overlay" />
      <div className="container">
        <div className="hero-arc-head">
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF021E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
              COMPATIBILIDADE PELO CÓDIGO
            </li>
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF021E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
              ORIGINAL OU PRIMEIRA LINHA
            </li>
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF021E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
              ENVIO PRA TODO BRASIL
            </li>
          </ul>
        </div>

        <div className="veh-arc" role="img" aria-label="Principais linhas diesel atendidas: Ford Ranger, Chevrolet S10, Toyota Hilux, VW Amarok, Fiat Toro, Jeep Commander e Toyota SW4">
          {CARS.map((c, i) => (
            <figure key={c.slug} className={`veh-card veh-pos-${i}`}>
              <img
                src={`/injecao-diesel/${slug}/assets/car-${c.slug}.webp`}
                alt={c.nome}
                width="1200"
                height="900"
                loading={i === 3 ? 'eager' : 'lazy'}
                decoding="async"
              />
              <figcaption>{c.nome}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
