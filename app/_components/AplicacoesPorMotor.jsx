import { waLink } from './lib/wa';

// LPs do segmento máquina/caminhão: substituto do SearchSection (consulta por
// placa). Aqui listamos as APLICAÇÕES organizadas por família de motor.
// Cada bloco de motor mostra os veículos/máquinas que o equipam.
// Config: cfg.aplicacoes_por_motor = [{motor, veiculos: [string]}]
export default function AplicacoesPorMotor({ cfg }) {
  const blocks = cfg.aplicacoes_por_motor || [];
  if (!blocks.length) return null;

  const heading = cfg.aplicacoes_heading || 'Encontre o bico certo pra sua máquina';
  const sub = cfg.aplicacoes_sub || 'Localize a família de motor e confirme a peça pelo código.';
  const wa = waLink(cfg.wa.hero_link, cfg.slug);

  return (
    <section id="aplicacoes" className="sec-off sec-pad">
      <div className="container">
        <h2 className="h2" style={{ maxWidth: '20ch' }}>{heading}</h2>
        <p className="lead" style={{ maxWidth: '52ch' }}>{sub}</p>

        <div className="aplic-grid">
          {blocks.map((b, i) => (
            <article className="aplic-card" key={i}>
              <div className="aplic-motor">{b.motor}</div>
              <ul className="aplic-veiculos">
                {b.veiculos.map((v, j) => (
                  <li key={j}>{v}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <p className="aplic-cta">
          Não achou seu motor?{' '}
          <a href={wa} target="_blank" rel="noreferrer" className="aplic-cta-link">
            Chama no WhatsApp com o código da peça
          </a>{' '}
          que confirmamos na hora.
        </p>
      </div>
    </section>
  );
}
