// Grade "Linhas que trabalhamos" — server component. Agrupa as LPs dedicadas
// por segmento e linka pra cada uma em /injecao-diesel/<slug>/. Itens sem LP
// dedicada (Caterpillar, JCB, John Deere...) também linkam, pois já existem
// como LP de máquina no repo.

import { waLink } from '../../_components/lib/wa';
import { WhatsAppIcon } from '../../_components/atoms';

const WA_MSG = 'Olá! Achei a linha do meu veículo na landing page de bico injetor diesel. Vou mandar o modelo e o ano pra confirmarem o bico certo e o prazo de envio.';

const GRUPOS = [
  {
    titulo: 'Picapes e SUVs diesel',
    itens: [
      { nome: 'VW Amarok', slug: 'amarok' },
      { nome: 'Toyota Hilux', slug: 'hilux' },
      { nome: 'Ford Ranger', slug: 'ranger' },
      { nome: 'Chevrolet S10', slug: 's10' },
      { nome: 'Nissan Frontier', slug: 'frontier' },
      { nome: 'Mitsubishi L200', slug: 'l200' },
      { nome: 'Mitsubishi Triton', slug: 'triton' },
      { nome: 'Mitsubishi Pajero', slug: 'pajero' },
      { nome: 'Mitsubishi Pajero Sport', slug: 'pajero-sport' },
    ],
  },
  {
    titulo: 'Vans e utilitários',
    itens: [
      { nome: 'Mercedes-Benz Sprinter', slug: 'sprinter' },
      { nome: 'Renault Master', slug: 'master' },
      { nome: 'Fiat Ducato', slug: 'ducato' },
      { nome: 'Peugeot Boxer', slug: 'boxer' },
      { nome: 'Citroën Jumper', slug: 'jumper' },
      { nome: 'Iveco Daily', slug: 'daily' },
      { nome: 'Hyundai HR', slug: 'hr' },
      { nome: 'Ford Transit', slug: 'transit' },
    ],
  },
  {
    titulo: 'Land Rover',
    itens: [
      { nome: 'Discovery', slug: 'discovery' },
      { nome: 'Discovery Sport', slug: 'discovery-sport' },
      { nome: 'Range Rover Sport', slug: 'range-rover-sport' },
      { nome: 'Evoque', slug: 'evoque' },
      { nome: 'Freelander', slug: 'freelander' },
    ],
  },
  {
    titulo: 'Caminhões e máquinas',
    itens: [
      { nome: 'Motores Cummins', slug: 'cummins' },
      { nome: 'Ford Cargo', slug: 'ford-cargo' },
      { nome: 'VW Constellation', slug: 'vw-caminhao' },
      { nome: 'Caterpillar', slug: 'caterpillar' },
      { nome: 'JCB', slug: 'jcb' },
      { nome: 'John Deere', slug: 'john-deere' },
      { nome: 'Case', slug: 'case' },
      { nome: 'New Holland', slug: 'new-holland' },
    ],
  },
];

export default function Linhas() {
  return (
    <section className="sec-pad" id="linhas">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div className="eyebrow" style={{ color: 'var(--muted)', marginBottom: 10 }}>Cobertura</div>
          <h2 className="h2">Linhas que trabalhamos</h2>
          <p style={{ color: 'var(--muted)', maxWidth: 640, margin: '10px auto 0' }}>
            Bico injetor diesel pras principais linhas do Brasil. Achou a sua? Abra a página dedicada.
            Não achou? Consulte a placa acima ou chame no WhatsApp — trabalhamos com muito mais do que cabe aqui.
          </p>
        </div>
        <div className="linhas-grid" style={{ display: 'grid', gap: 28, marginTop: 32, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {GRUPOS.map((g) => (
            <div key={g.titulo}>
              <h3 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink)', marginBottom: 14, borderBottom: '2px solid var(--red, #c1121f)', paddingBottom: 8 }}>
                {g.titulo}
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {g.itens.map((it) => (
                  <li key={it.slug}>
                    <a href={`/injecao-diesel/${it.slug}/`} style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: 15 }}>
                      {it.nome}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="linhas-cta">
          <div>
            <h3 className="linhas-cta-title">Achou a linha do seu veículo? Fale com a gente.</h3>
            <p className="linhas-cta-sub">
              Manda o modelo e o ano no WhatsApp que a gente confirma o bico certo
              e o prazo de envio na hora.
            </p>
          </div>
          <a className="btn btn-red btn-lg linhas-cta-btn" href={waLink(WA_MSG, 'bico-injetor')} target="_blank" rel="noreferrer">
            <WhatsAppIcon /> Chamar no WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
