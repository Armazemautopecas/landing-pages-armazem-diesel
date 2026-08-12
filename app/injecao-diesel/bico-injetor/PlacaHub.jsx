'use client';

// Ilha interativa da LP HUB de bico injetor diesel.
//
// Consulta por placa GENÉRICA: a API devolve marca/modelo e o resultado mostra
// o veículo identificado + CTA WhatsApp com o veículo já preenchido na
// mensagem. Sem redirecionamento pra LP dedicada (decisão Diego 2026-08-12 —
// o tráfego da campanha fica na própria página).
// Todo CTA passa por waLink(msg, 'bico-injetor') → bridge do tracker.

import { useEffect, useRef, useState } from 'react';
import { fmt, waLink } from '../../_components/lib/wa';
import { WhatsAppIcon } from '../../_components/atoms';

const SLUG = 'bico-injetor';

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
      setResult({ kind: 'generic', vehicle: data.vehicle || {} });
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
