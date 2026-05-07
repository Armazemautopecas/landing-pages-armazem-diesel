// Bloco de conteúdo técnico-educacional (~200 palavras) que entra entre
// Testimonials e FAQ. Renderiza H2 + intro + UL de sintomas + parágrafo de
// qualidade + parágrafo de fechamento.
//
// Opcional: se a LP não tem cfg.technical_block, retorna null silenciosamente
// (LPs antigas continuam funcionando sem mudança de config).
export default function TechnicalBlock({ cfg }) {
  const tb = cfg.technical_block;
  if (!tb) return null;

  return (
    <section className="sec-pad sec-tech">
      <div className="container container-narrow">
        <h2 className="h2 tech-heading">{tb.heading}</h2>
        {tb.intro && <p className="tech-p">{tb.intro}</p>}
        {Array.isArray(tb.symptoms) && tb.symptoms.length > 0 && (
          <ul className="tech-symptoms">
            {tb.symptoms.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        )}
        {tb.quality_explanation && <p className="tech-p">{tb.quality_explanation}</p>}
        {tb.closing && <p className="tech-p">{tb.closing}</p>}
      </div>
    </section>
  );
}
