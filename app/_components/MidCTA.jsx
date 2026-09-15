import { waLink } from './lib/wa';
import { WhatsAppIcon } from './atoms';
import { CTA_PRINCIPAL } from '@/lib/content';

// Item #25 do backlog: a LP tinha saida pro WhatsApp so no topo e no fecho —
// em ~5 telas de rolagem, quem se convencia no meio do caminho precisava
// procurar. Este e o botao do meio.
//
// Onde ele fica: logo DEPOIS dos depoimentos, que no diesel e exatamente o
// espaco entre o bloco "por que a gente" (WhySection) e o bloco tecnico
// (TechnicalBlock). Depois do FAQ nao entra: o FinalCTA ja vem imediatamente
// a seguir, com o mesmo texto e a mesma mensagem — duplicar seria repetir o
// mesmo botao duas vezes seguidas.
//
// Texto, mensagem e estilo sao os MESMOS do botao principal do rodape
// (final_cta.btn + wa.final_cta), sempre pela bridge waLink. Sem copy nova.
export default function MidCTA({ cfg }) {
  return (
    <section className="mid-cta-band">
      <div className="container mid-cta">
        <a
          className="btn btn-red btn-lg"
          href={waLink(cfg.wa.final_cta, cfg.slug)}
          target="_blank"
          rel="noreferrer"
        >
          <WhatsAppIcon /> {CTA_PRINCIPAL}
        </a>
      </div>
    </section>
  );
}
