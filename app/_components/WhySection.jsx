// Server component (Onda 3 — 2026-05-08). Antes era client com
// IntersectionObserver + state pra reveal-on-scroll fade-in. Agora conteúdo
// aparece direto — animação não-essencial removida em troca de zero JS.
export default function WhySection({ cfg, style }) {
  const items = cfg.why.items;

  return (
    <section className="sec-navy sec-pad">
      <div className="container">
        <h2 className="h2" style={{ color: 'var(--off)', maxWidth: 18 + 'ch' }}>
          {cfg.why.h2_l1}<br />{cfg.why.h2_l2} <span style={{ color: 'var(--red)' }}>{cfg.why.h2_l2_red}</span>.
        </h2>
        <div className={`why-grid ${style === 'stacked' ? 'is-stacked' : ''}`}>
          {items.map((it, i) => (
            <div className="why-card" key={i}>
              <div className="why-num">{it.num}</div>
              <div>
                <h3 className="why-ttl">{it.ttl}</h3>
                <p className="why-body">{it.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
