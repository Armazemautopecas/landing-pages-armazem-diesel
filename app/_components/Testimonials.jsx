import { getContent } from '@/lib/content';
import { Star } from './atoms';

// Server component (Onda 3 — 2026-05-08). Antes era client com state pra
// auto-rotate em mobile. Agora usa scroll-snap-x CSS nativo — usuário
// arrasta horizontalmente nos depoimentos. Padrão UX moderno, zero JS,
// accessibility nativa (scrollbar permite teclado/screen-reader navegar).
export default function Testimonials({ cfg }) {
  const { TESTIMONIALS } = getContent(cfg);

  return (
    <section className="sec-off sec-pad">
      <div className="container">
        <div className="testi-head">
          <div className="eyebrow" style={{ color: 'var(--muted)', marginBottom: 10 }}>Depoimentos</div>
          <h2 className="h2">Quem já voltou<br />a rodar com a gente</h2>
        </div>
        <div className="testi-track" role="list" aria-label="Depoimentos de clientes">
          {TESTIMONIALS.map((t, i) => (
            <div className="testi-card" key={i} role="listitem">
              <div className="stars">
                {[0, 1, 2, 3, 4].map((n) => <Star key={n} />)}
              </div>
              <div className="testi-q">{t.q}</div>
              <div className="testi-who">
                <b>— {t.name}</b>
                {t.role}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
