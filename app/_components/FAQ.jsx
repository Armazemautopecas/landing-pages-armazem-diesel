import { getContent } from '@/lib/content';

// Server component (Onda 3 — 2026-05-08). Antes era client com state pro
// accordion (qual item está open). Agora usa <details>/<summary> HTML nativo —
// abre/fecha sem JS, accessibility nativa, primeiro item nasce aberto via
// attribute `open`.
export default function FAQ({ cfg }) {
  const { FAQS } = getContent(cfg);
  return (
    <section className="sec-off sec-pad" style={{ paddingTop: 20 }}>
      <div className="container">
        <div style={{ textAlign: 'center' }}>
          <div className="eyebrow" style={{ color: 'var(--muted)', marginBottom: 10 }}>Dúvidas frequentes</div>
          <h2 className="h2">Perguntas rápidas</h2>
        </div>
        <div className="faq-wrap">
          {FAQS.map((f, i) => (
            <details className="faq-item" key={i} open={i === 0}>
              <summary className="faq-q">
                <span>{f.q}</span>
                <span className="plus" aria-hidden />
              </summary>
              <div className="faq-a">
                <div className="faq-a-inner">{f.a}</div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
