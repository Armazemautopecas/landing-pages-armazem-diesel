import { waLink } from './lib/wa';

// Catálogo de peças em destaque (segmento máquina/caminhão). Cada card mostra
// nome, código do fabricante, código da montadora e aplicação, com botão de
// WhatsApp por peça (mensagem contextualizada, via bridge).
// Config: cfg.catalogo_pecas = [{
//   peca, ref_fabricante, cod_montadora?, aplicacao, wa_msg?, sob_consulta?
// }]
export default function CatalogoPecas({ cfg }) {
  const items = cfg.catalogo_pecas || [];
  if (!items.length) return null;

  const heading = cfg.catalogo_heading || 'Peças em destaque';
  const sub = cfg.catalogo_sub || 'Preço só no WhatsApp — mande o código da peça ou o modelo da máquina.';

  return (
    <section id="catalogo" className="sec-off sec-pad">
      <div className="container">
        <h2 className="h2" style={{ maxWidth: '20ch' }}>{heading}</h2>
        <p className="lead" style={{ maxWidth: '52ch' }}>{sub}</p>

        <div className="cat-grid">
          {items.map((it, i) => {
            const defaultMsg = `Olá, quero cotar ${it.peca} (${it.ref_fabricante}) pra ${it.aplicacao}.`;
            const msg = it.wa_msg || defaultMsg;
            const href = waLink(msg, cfg.slug);
            return (
              <article className="cat-card" key={i}>
                <div className="cat-body">
                  <h3 className="cat-titulo">{it.peca}</h3>
                  <dl className="cat-dl">
                    <div><dt>Ref. fabricante</dt><dd>{it.ref_fabricante}</dd></div>
                    {it.cod_montadora && (
                      <div><dt>Cód. montadora</dt><dd>{it.cod_montadora}</dd></div>
                    )}
                    <div><dt>Aplicação</dt><dd>{it.aplicacao}</dd></div>
                    <div><dt>Disponibilidade</dt>
                      <dd className={it.sob_consulta ? 'cat-consulta' : 'cat-estoque'}>
                        {it.sob_consulta ? 'Sob consulta' : 'Pronta entrega'}
                      </dd>
                    </div>
                  </dl>
                </div>
                <a className="cat-cta" href={href} target="_blank" rel="noreferrer">
                  Cotar esta peça
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
