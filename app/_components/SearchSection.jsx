import Image from 'next/image';
import { fmt, waLink } from './lib/wa';
import { getVeiculoModelo } from './lib/parts';
import { WhatsAppIcon } from './atoms';
import Selector from './Selector';

function pecaSrc(cfg, file) {
  if (file.startsWith('/')) return file;
  return `/${cfg.slug}/${file}`;
}

function sanitizeOem(oem) {
  return String(oem || '').replace(/[^A-Za-z0-9]/g, '');
}

function resolvePecaFoto(cfg, variant) {
  if (variant?.foto) return variant.foto;
  const porOem = cfg.peca?.fotos_por_oem;
  if (porOem && variant?.oem) {
    const k = sanitizeOem(variant.oem);
    if (porOem[k]) return porOem[k];
  }
  const map = cfg.peca?.foto_por_marca;
  if (map && variant?.marca_bico && map[variant.marca_bico]) return map[variant.marca_bico];
  return cfg.peca.foto_default;
}

function ResultPlate({ cfg, vehicle }) {
  const p = vehicle.part;
  const msg = fmt(cfg.wa.result_plate_template, {
    plate: vehicle.plate, oem: p.oem,
    modelo: vehicle.modelo, ano: vehicle.ano, motor: vehicle.motor,
  });
  const fotoSrc = pecaSrc(cfg, resolvePecaFoto(cfg, p));

  return (
    <div className="result-wrap fade-in">
      <div className="result-head">
        <span className="check">✓</span> Veículo Identificado
      </div>
      <div className="vehicle-name">{vehicle.marca} {vehicle.modelo}</div>
      <div className="vehicle-spec">
        {vehicle.motor} · {vehicle.ano} · {vehicle.cv}cv<br />
        Placa: {vehicle.plate} · Chassi final: {vehicle.chassi_tail}
      </div>
      <hr className="hr-dashed" />
      <div className="part-label">Peça compatível com seu veículo</div>
      <div className="part-card">
        <div className="part-photo">
          <Image src={fotoSrc} alt={`${p.name} — ${p.oem}`} width={600} height={600} sizes="(max-width: 768px) 90vw, 400px" />
          <div className="ph-label">{p.name} · {p.oem}</div>
        </div>
        <div>
          <div className="part-title">{p.name}</div>
          <div className="part-oem">Cód. OEM: {p.oem}{p.marca_bico ? ` · ${p.marca_bico}` : ''}</div>
          {p.equivalentes && p.equivalentes.length > 0 && (
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, lineHeight: 1.4 }}>
              Códigos compatíveis: {p.equivalentes.join(', ')}
            </div>
          )}
          <div className="brand-tag">{p.brand}</div>
          <ul className="part-bullets">
            {p.bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
          <a className="btn btn-red btn-lg" style={{ marginTop: 18 }}
             href={waLink(msg)} target="_blank" rel="noreferrer">
            <WhatsAppIcon /> Falar no WhatsApp
          </a>
        </div>
      </div>
      {p.hasLine1a && cfg.peca.tem_primeira_linha && (
        <div className="hint-row">
          💡 <b>{cfg.result_messages.hint_primeira_linha_bold}</b> {cfg.result_messages.hint_primeira_linha_tail}
        </div>
      )}
    </div>
  );
}

function ResultYear({ cfg, year, variants }) {
  const veiculoModelo = getVeiculoModelo(cfg);
  const groupsMap = new Map();
  variants.forEach((v) => {
    const key = `${v.motor}|${v.cv}`;
    if (!groupsMap.has(key)) groupsMap.set(key, { ...v, alternativeOems: [] });
    else groupsMap.get(key).alternativeOems.push(v.oem);
  });
  const groups = Array.from(groupsMap.values());

  const titulo = groups.length > 1
    ? `${veiculoModelo} ${year} — escolha a variação do motor`
    : `${veiculoModelo} ${year}`;
  const subtitulo = groups.length > 1
    ? 'Selecione o motor do seu veículo para ver a peça exata.'
    : 'Encontramos a peça compatível com seu motor.';

  return (
    <div className="result-wrap fade-in">
      <div className="vehicle-name">{titulo}</div>
      <div className="vehicle-spec">{subtitulo}</div>
      <div className="variant-grid">
        {groups.map((g, i) => {
          const msg = fmt(cfg.wa.result_year_template, { oem: g.oem, year, motor: g.motor });
          const fotoSrc = pecaSrc(cfg, resolvePecaFoto(cfg, g));
          const equivalentes = cfg.peca?.equivalentes_por_motor?.[g.motor] || [];
          return (
            <div className="variant-card" key={i}>
              <div className="variant-photo">
                <Image src={fotoSrc} alt={`${cfg.peca.nome} ${g.oem}`} width={600} height={600} sizes="(max-width: 768px) 45vw, 300px" />
              </div>
              <div className="v-motor">{g.motor}</div>
              {g.cv && <div className="v-hp">{g.cv}</div>}
              <div className="v-part">
                <div className="v-part-name">{cfg.peca.short_label}</div>
                <div className="v-part-oem">Cód. OEM: {g.oem}{g.marca_bico ? ` · ${g.marca_bico}` : ''}</div>
                <div className="brand-tag" style={{ marginTop: 10 }}>{cfg.peca.fabricante_label}</div>
              </div>
              {equivalentes.length > 0 && (
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 10, lineHeight: 1.4 }}>
                  Códigos compatíveis: {equivalentes.join(', ')}
                </div>
              )}
              {g.alternativeOems.length > 0 && (
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 10, lineHeight: 1.4 }}>
                  Variantes alternativas: {g.alternativeOems.join(', ')}.<br />
                  Confira o nº estampado na sua peça antiga ou chame o vendedor.
                </div>
              )}
              <a className="btn btn-navy btn-block" style={{ marginTop: 16 }}
                 href={waLink(msg)} target="_blank" rel="noreferrer">
                Ver detalhes
              </a>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 18 }}>
        Não sabe qual é o seu? Insira a placa no seletor ↑ ou <a href={waLink(cfg.wa.result_dontknow_motor)} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>chame o vendedor no WhatsApp</a>.
      </p>
    </div>
  );
}

function ResultNotFound({ cfg, query }) {
  return (
    <div className="result-wrap fade-in">
      <div className="vehicle-name" style={{ color: '#c1121f' }}>Não encontramos</div>
      <div className="vehicle-spec" style={{ marginTop: 8 }}>
        Não localizamos um veículo para <b style={{ color: 'var(--ink)' }}>{query}</b>. Verifique a placa ou fale com um vendedor pra gente conferir pela nota do carro.
      </div>
      <a className="btn btn-red btn-lg" style={{ marginTop: 18 }}
         href={waLink(fmt(cfg.wa.result_notfound_template, { query }))}
         target="_blank" rel="noreferrer">
        <WhatsAppIcon /> Chamar o vendedor
      </a>
    </div>
  );
}

function ResultNotSupported({ cfg, vehicle, query, message }) {
  const ident = [vehicle?.marca, vehicle?.modelo, vehicle?.ano].filter(Boolean).join(' ') || query;
  const waMsg = fmt(cfg.wa.result_notsupported_template, { query, ident });
  return (
    <div className="result-wrap fade-in">
      <div className="vehicle-name">Identificamos: {ident}</div>
      <div className="vehicle-spec" style={{ marginTop: 8 }}>
        {message || cfg.result_messages.not_supported_default}
      </div>
      <a className="btn btn-red btn-lg" style={{ marginTop: 18 }}
         href={waLink(waMsg)} target="_blank" rel="noreferrer">
        <WhatsAppIcon /> Falar com o vendedor
      </a>
    </div>
  );
}

function ResultError({ cfg, query, message }) {
  return (
    <div className="result-wrap fade-in">
      <div className="vehicle-name" style={{ color: '#c1121f' }}>Ops</div>
      <div className="vehicle-spec" style={{ marginTop: 8 }}>
        {message || 'Não conseguimos consultar agora. Fale com um vendedor.'}
      </div>
      <a className="btn btn-red btn-lg" style={{ marginTop: 18 }}
         href={waLink(fmt(cfg.wa.result_error_template, { query }))}
         target="_blank" rel="noreferrer">
        <WhatsAppIcon /> Chamar o vendedor
      </a>
    </div>
  );
}

export default function SearchSection({ cfg, result, onSearch, isSearching, selectorStyle }) {
  const hasResult = !!result;
  return (
    <section className={`sec-off sec-pad search-section ${hasResult ? 'has-result' : 'is-empty'}`} id="buscar">
      <div className="container">
        {hasResult ? (
          <>
            <div className="eyebrow" style={{ color: 'var(--muted)', marginBottom: 16 }}>Resultado da busca</div>
            {result.kind === 'plate' && result.vehicle && <ResultPlate cfg={cfg} vehicle={result.vehicle} />}
            {result.kind === 'year' && <ResultYear cfg={cfg} year={result.year} variants={result.variants} />}
            {result.kind === 'notfound' && <ResultNotFound cfg={cfg} query={result.query} />}
            {result.kind === 'notsupported' && <ResultNotSupported cfg={cfg} vehicle={result.vehicle} query={result.query} message={result.message} />}
            {result.kind === 'error' && <ResultError cfg={cfg} query={result.query} message={result.message} />}
          </>
        ) : (
          <div className="search-section-empty-wrap">
            <Selector cfg={cfg} onSearch={onSearch} isSearching={isSearching} selectorStyle={selectorStyle} />
          </div>
        )}
      </div>
    </section>
  );
}
