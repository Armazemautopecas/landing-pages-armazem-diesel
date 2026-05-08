import { TrustIcon } from './atoms';
import { getFabricanteLabel } from '@/lib/content';

// Server component (Onda 3 — 2026-05-08). Conteúdo aparece direto, sem
// reveal-on-scroll que exigia useState+IntersectionObserver. Animation
// removida pra zerar JS desse componente — TrustBar é visualmente estático
// e perceptualmente igual sem o fade-in.
export default function TrustBar({ cfg, style }) {
  const fabricante = getFabricanteLabel(cfg);
  const cells = [
    { icon: 'shield', ttl: 'Peças Originais', sub: fabricante ? `OEM ${fabricante}` : 'Garantia de fábrica', num: '100%' },
    { icon: 'box', ttl: 'Despacho Rápido', sub: 'Saída em até 24h úteis', num: '24h' },
    { icon: 'gear', ttl: 'Compatibilidade Confirmada', sub: 'FIPE/Denatran', num: 'OEM' },
    { icon: 'factory', ttl: 'Bicos Vendidos', sub: 'Pra todo o Brasil', num: '10K+' },
  ];

  return (
    <section className={`trust ${style === 'minimal' ? 'is-minimal' : ''} ${style === 'numbers' ? 'is-numbers' : ''}`}>
      <div className="container">
        <div className="trust-row">
          {cells.map((c, i) => (
            <div className="trust-cell" key={i}>
              {style === 'numbers'
                ? <div className="num">{c.num}</div>
                : <TrustIcon kind={c.icon} />}
              <div className="ttl">{c.ttl}</div>
              <div className="sub">{c.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
