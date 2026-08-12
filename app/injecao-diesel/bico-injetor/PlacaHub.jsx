'use client';

// Ilha interativa da LP HUB de bico injetor diesel.
//
// Consulta por placa: a API devolve marca/modelo/ano. Quando o veículo é uma
// das linhas que mapeamos (data/oems.json → bico-injetor), o resultado mostra
// o BICO que aquele carro usa (foto + código + labels) já com CTA WhatsApp.
// Quando não é linha mapeada (carro a gasolina etc.), cai no resultado genérico
// (veículo + CTA). Sem redirecionamento pra LP dedicada (decisão Diego
// 2026-08-12 — o tráfego da campanha fica na própria página).
// Todo CTA passa por waLink(msg, 'bico-injetor') → bridge do tracker.

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { fmt, waLink } from '../../_components/lib/wa';
import { WhatsAppIcon } from '../../_components/atoms';
import OEMS from '@/data/oems.json';

const SLUG = 'bico-injetor';
const CAT = 'bico-injetor';

// Fotos disponíveis em /public/injecao-diesel/pecas/ (basename sem .webp).
// O código OEM vira nome de arquivo removendo só os espaços; se não tiver foto
// específica, cai no foto_default da config. Lista fixa evita imagem quebrada.
const FOTOS_PECAS = new Set([
  '0445110189', '0445110231', '0445110248', '0445110273', '0445110369',
  '0445110424', '0445110520', '0445110564', '0445110993', '0445116059',
  '0445117034', '0445117083', '0445120002', '095000-5800', '095000-5801',
  '095000-7761', '095000-8290', '1660000Q2K', '23670-11030', '23670-30270',
  '28307309', '28342997', '28602948', '2950500960', 'A2C59517051',
  'KS28229873', 'KS28657626',
]);

function norm(s) {
  return String(s || '').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// Matchers ordenados do MAIS específico pro menos (2+ tokens antes de 1 token),
// pra "Pajero Sport" não cair em "Pajero" e "Discovery Sport" não cair em
// "Discovery". O modelo vindo da placa é sujo ("HILUX SW4", "PAJERO SPORT HPE"),
// então casamos por palavra-chave, não string exata.
const MATCHERS = [
  { slug: 'pajero-sport', tokens: ['PAJERO', 'SPORT'] },
  { slug: 'discovery-sport', tokens: ['DISCOVERY', 'SPORT'] },
  { slug: 'range-rover-sport', tokens: ['RANGE', 'ROVER', 'SPORT'] },
  { slug: 'pajero', tokens: ['PAJERO'] },
  { slug: 'discovery', tokens: ['DISCOVERY'] },
  { slug: 'evoque', tokens: ['EVOQUE'] },
  { slug: 'amarok', tokens: ['AMAROK'] },
  { slug: 'hilux', tokens: ['HILUX'] },
  { slug: 'ranger', tokens: ['RANGER'] },
  { slug: 'frontier', tokens: ['FRONTIER'] },
  { slug: 'master', tokens: ['MASTER'] },
  { slug: 'sprinter', tokens: ['SPRINTER'] },
  { slug: 'ducato', tokens: ['DUCATO'] },
  { slug: 'boxer', tokens: ['BOXER'] },
  { slug: 'jumper', tokens: ['JUMPER'] },
  { slug: 'transit', tokens: ['TRANSIT'] },
  { slug: 'daily', tokens: ['DAILY'] },
  { slug: 'triton', tokens: ['TRITON'] },
  { slug: 'l200', tokens: ['L200'] },
  { slug: 's10', tokens: ['S10'] },
  { slug: 'hr', tokens: ['HR'] },
];

// Casa o modelo/marca da placa numa das linhas mapeadas. Retorna o slug ou null.
function matchSlug(marca, modelo) {
  const m = norm(`${marca || ''} ${modelo || ''}`);
  const words = new Set(m.split(/[^A-Z0-9]+/).filter(Boolean));
  const compact = m.replace(/[^A-Z0-9]+/g, '');
  for (const cand of MATCHERS) {
    const ok = cand.tokens.every(
      (t) => words.has(t) || (t.length >= 3 && compact.includes(t))
    );
    if (ok && OEMS[CAT]?.[cand.slug]) return cand.slug;
  }
  return null;
}

function fotoSrc(cfg, oem) {
  const code = String(oem || '').replace(/\s+/g, '');
  if (FOTOS_PECAS.has(code)) return `/injecao-diesel/pecas/${code}.webp`;
  return cfg.peca.foto_default;
}

// Resolve os bicos de um veículo mapeado. Usa o ano da placa; se o ano não vier
// ou não estiver no mapa, mostra TODOS os bicos distintos daquele modelo (o
// vendedor confirma no WhatsApp). Deduplica por código OEM.
function resolveBicos(slug, ano) {
  const entry = OEMS[CAT]?.[slug];
  if (!entry) return { veiculo: null, bicos: [], exactYear: false };
  const byYear = entry.variants_por_ano || {};
  const anoKey = ano != null ? String(ano) : '';
  let variants = anoKey && byYear[anoKey] ? byYear[anoKey] : null;
  const exactYear = !!variants;
  if (!variants) {
    variants = Object.values(byYear).flat();
  }
  const seen = new Map();
  variants.forEach((v) => {
    if (!seen.has(v.oem)) seen.set(v.oem, v);
  });
  return { veiculo: entry.veiculo, bicos: Array.from(seen.values()), exactYear };
}

function ResultGeneric({ cfg, vehicle }) {
  const msg = fmt(cfg.wa.result_vehicle_template, { marca: vehicle.marca, modelo: vehicle.modelo });
  return (
    <div className="result-wrap fade-in">
      <div className="result-head">
        <span className="check">✓</span> Veículo Identificado
      </div>
      <div className="vehicle-name">{vehicle.marca} {vehicle.modelo}</div>
      <div className="vehicle-spec">
        {[vehicle.motor, vehicle.ano].filter(Boolean).join(' · ')}
        {vehicle.plate ? <><br />Placa: {vehicle.plate}</> : null}
      </div>
      <hr className="hr-dashed" />
      <div className="vehicle-spec" style={{ marginTop: 8 }}>
        Trabalhamos com bico injetor diesel pra essa linha. Chame o vendedor com o veículo já preenchido que a gente confirma o código e cota na hora.
      </div>
      <a className="btn btn-red btn-lg" style={{ marginTop: 18 }} href={waLink(msg, SLUG)} target="_blank" rel="noreferrer">
        <WhatsAppIcon /> Falar no WhatsApp
      </a>
    </div>
  );
}

function ResultBico({ cfg, vehicle, veiculo, bicos, exactYear }) {
  const marca = veiculo?.marca || vehicle.marca;
  const modelo = veiculo?.modelo || vehicle.modelo;
  const ident = [marca, modelo, vehicle.ano].filter(Boolean).join(' ');
  const multi = bicos.length > 1;

  return (
    <div className="result-wrap fade-in">
      <div className="result-head">
        <span className="check">✓</span> Veículo Identificado
      </div>
      <div className="vehicle-name">Veículo identificado: {ident}</div>
      <div className="vehicle-spec">
        {vehicle.plate ? <>Placa: {vehicle.plate}<br /></> : null}
        {exactYear
          ? (multi ? 'Estes são os bicos injetores usados nesse ano — confira o motor.' : 'Este é o bico injetor que esse veículo usa.')
          : 'Não identificamos o ano exato — abaixo os bicos que esse modelo usa. O vendedor confirma o certo no WhatsApp.'}
      </div>
      <hr className="hr-dashed" />
      <div className="part-label">{multi ? 'Bicos compatíveis com seu veículo' : 'Bico compatível com seu veículo'}</div>
      <div className="variant-grid">
        {bicos.map((b, i) => {
          const msg = `Olá, consultei ${vehicle.plate ? `a placa ${vehicle.plate}` : 'meu veículo'} na landing page e preciso do bico injetor ${b.oem}${b.motor ? ` (${b.motor})` : ''} pro meu ${ident}. Quero cotar.`;
          return (
            <div className="variant-card" key={i}>
              <div className="variant-photo">
                <Image src={fotoSrc(cfg, b.oem)} alt={`${cfg.peca.nome} ${b.oem}`} width={600} height={600} sizes="(max-width: 768px) 45vw, 300px" />
              </div>
              {b.motor && <div className="v-motor">{b.motor}</div>}
              <div className="v-part">
                <div className="v-part-name">{cfg.peca.short_label}</div>
                <div className="v-part-oem">Cód. OEM: {b.oem}{b.marca_bico ? ` · ${b.marca_bico}` : ''}</div>
                <div className="brand-tag" style={{ marginTop: 10 }}>{cfg.peca.fabricante_label}</div>
              </div>
              <a className="btn btn-red btn-block" style={{ marginTop: 16 }}
                 href={waLink(msg, SLUG)} target="_blank" rel="noreferrer">
                <WhatsAppIcon /> Cotar no WhatsApp
              </a>
            </div>
          );
        })}
      </div>
      {cfg.peca.tem_primeira_linha && (
        <div className="hint-row" style={{ marginTop: 16 }}>
          💡 Trabalhamos com <b>original e primeira linha</b>. Mande o código no WhatsApp que a gente confirma disponibilidade e prazo.
        </div>
      )}
    </div>
  );
}

function ResultNotFound({ cfg, query }) {
  return (
    <div className="result-wrap fade-in">
      <div className="vehicle-name" style={{ color: '#c1121f' }}>Não encontramos</div>
      <div className="vehicle-spec" style={{ marginTop: 8 }}>
        Não localizamos um veículo para <b style={{ color: 'var(--ink)' }}>{query}</b>. Confira a placa ou fale com um vendedor pra gente conferir pela nota do carro.
      </div>
      <a className="btn btn-red btn-lg" style={{ marginTop: 18 }}
         href={waLink(fmt(cfg.wa.result_notfound_template, { query }), SLUG)} target="_blank" rel="noreferrer">
        <WhatsAppIcon /> Chamar o vendedor
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
         href={waLink(fmt(cfg.wa.result_error_template, { query }), SLUG)} target="_blank" rel="noreferrer">
        <WhatsAppIcon /> Chamar o vendedor
      </a>
    </div>
  );
}

export default function PlacaHub({ cfg }) {
  const [plate, setPlate] = useState('');
  const [err, setErr] = useState('');
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);

  useEffect(() => {
    if (result && resultRef.current) {
      setTimeout(() => {
        const top = resultRef.current.getBoundingClientRect().top + window.scrollY - 20;
        window.scrollTo({ top, behavior: 'smooth' });
      }, 80);
    }
  }, [result]);

  const submit = async (e) => {
    e?.preventDefault();
    const clean = plate.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    if (clean.length < 6) {
      setErr('Digite uma placa (7 caracteres) ou final de chassi.');
      return;
    }
    setErr('');
    setSearching(true);
    setResult(null);

    const body = clean.length === 7 ? { placa: clean } : { chassi: clean };
    try {
      const r = await fetch('/injecao-diesel/api/consulta-veiculo/', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (r.status === 429) {
        setResult({ kind: 'error', query: clean, message: 'Muitas consultas. Tente de novo em 1 minuto.' });
        return;
      }
      if (!r.ok) {
        setResult({ kind: 'error', query: clean, message: 'Não conseguimos consultar agora. Fale com um vendedor no WhatsApp.' });
        return;
      }
      const data = await r.json();
      if (!data.found) {
        setResult({ kind: 'notfound', query: clean });
        return;
      }
      const vehicle = data.vehicle || {};
      const slug = matchSlug(vehicle.marca, vehicle.modelo);
      if (slug) {
        const { veiculo, bicos, exactYear } = resolveBicos(slug, vehicle.ano);
        if (bicos.length) {
          setResult({ kind: 'bico', vehicle, veiculo, bicos, exactYear });
          return;
        }
      }
      setResult({ kind: 'generic', vehicle });
    } catch (e2) {
      console.error('consulta_veiculo_error', e2);
      setResult({ kind: 'error', query: clean, message: 'Erro de conexão. Tente novamente ou fale com um vendedor no WhatsApp.' });
    } finally {
      setSearching(false);
    }
  };

  const hasResult = !!result;

  return (
    <section className={`sec-off sec-pad search-section search-hub ${hasResult ? 'has-result' : 'is-empty'}`} id="buscar">
      <div className="container" ref={resultRef}>
        {hasResult ? (
          <>
            <div className="eyebrow" style={{ color: 'var(--muted)', marginBottom: 16 }}>Resultado da busca</div>
            {result.kind === 'bico' && <ResultBico cfg={cfg} vehicle={result.vehicle} veiculo={result.veiculo} bicos={result.bicos} exactYear={result.exactYear} />}
            {result.kind === 'generic' && <ResultGeneric cfg={cfg} vehicle={result.vehicle} />}
            {result.kind === 'notfound' && <ResultNotFound cfg={cfg} query={result.query} />}
            {result.kind === 'error' && <ResultError cfg={cfg} query={result.query} message={result.message} />}
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 18 }}>
              Consultar outro veículo?{' '}
              <a onClick={() => { setResult(null); setPlate(''); }} style={{ textDecoration: 'underline', cursor: 'pointer' }}>
                Nova consulta
              </a>.
            </p>
          </>
        ) : (
          <div className="search-section-empty-wrap">
            <div className="selector">
              <h2 className="sel-title">{cfg.selector.titulo_l1}<br />{cfg.selector.titulo_l2}</h2>
              <p className="sel-small">{cfg.selector.subtexto}</p>
              <form className="sel-fieldset" onSubmit={submit}>
                <label>Placa ou chassi</label>
                <div className="sel-row">
                  <input
                    className="sel-input"
                    type="text"
                    placeholder="Informe a placa ou chassi"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value.toUpperCase())}
                    maxLength={17}
                    aria-label="Placa ou chassi"
                  />
                  <button className="btn btn-red btn-block" type="submit" disabled={searching}>
                    {searching ? <><span className="loader" /> BUSCANDO</> : 'BUSCAR'}
                  </button>
                </div>
              </form>
              {err && <p style={{ color: '#c1121f', fontSize: 12, marginTop: 10 }}>{err}</p>}
              <p className="sel-note">
                <b style={{ color: 'var(--ink)' }}>Consultamos FIPE/Denatran pra você</b> —
                achamos o bico certo, sem achismo. Não tem placa em mãos?{' '}
                <a href={waLink(cfg.wa.fab_default, SLUG)} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>
                  chame o vendedor no WhatsApp
                </a>.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
