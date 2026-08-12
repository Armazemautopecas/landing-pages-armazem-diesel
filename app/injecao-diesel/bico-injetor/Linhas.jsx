// Grade "Linhas que trabalhamos" — server component. Cada item abre o WhatsApp
// com o veículo já escrito na mensagem (decisão Diego 2026-08-12 — em vez de
// mandar pra LP dedicada, o clique vira lead rastreável e mede qual veículo o
// visitante clicou via o tracker do waLink).

import { waLink } from '../../_components/lib/wa';
import { WhatsAppIcon } from '../../_components/atoms';
import { GRUPOS } from './linhas-data';

const WA_MSG = 'Olá! Achei a linha do meu veículo na landing page de bico injetor diesel. Vou mandar o modelo e o ano pra confirmarem o bico certo e o prazo de envio.';

// Mensagem por linha — carrega o nome do veículo pra medir o clique no tracker.
function linhaMsg(nome) {
  return `Olá! Tenho um(a) ${nome} e preciso de bico injetor diesel. Pode me ajudar a achar o código certo e cotar?`;
}

export default function Linhas() {
  return (
    <section className="sec-pad" id="linhas">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 8, maxWidth: 660, marginLeft: 'auto', marginRight: 'auto' }}>
          <h2 className="h2" style={{ textWrap: 'balance' }}>Prefere procurar pela linha?</h2>
          <p style={{ color: 'var(--muted)', margin: '14px auto 0', fontSize: 17 }}>
            Ache seu veículo na lista e toque no nome: abre o WhatsApp com o modelo
            já escrito. É só mandar o ano que a gente confirma o bico certo e o prazo.
          </p>
        </div>
        <div className="linhas-grid" style={{ display: 'grid', gap: 24, marginTop: 36, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {GRUPOS.map((g) => (
            <div className="linhas-col" key={g.titulo}>
              <h3 className="linhas-col-title">{g.titulo}</h3>
              <ul className="linhas-list">
                {g.itens.map((it) => (
                  <li key={it.slug}>
                    <a className="linhas-item" href={waLink(linhaMsg(it.nome), 'bico-injetor')} target="_blank" rel="noreferrer">
                      <span className="linhas-item-wa"><WhatsAppIcon size={15} /></span>
                      <span className="linhas-item-name">{it.nome}</span>
                      <span className="linhas-item-cue">Chamar</span>
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
