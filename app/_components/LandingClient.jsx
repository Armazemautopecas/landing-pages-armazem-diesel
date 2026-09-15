'use client';

// Ilha interativa da LP (Onda 3 — 2026-05-08). Antes esse arquivo orquestrava
// 10 componentes (todos virando client por contaminação). Agora encolheu pra
// só Hero + SearchSection — único pedaço da LP que precisa state (busca por
// placa/ano + scroll-to-result). O resto da LP é server-rendered no page.jsx.
//
// `children` é onde o page.jsx (server) injeta TrustBar — fica posicionado
// entre Hero e SearchSection sem virar client.

import { useEffect, useRef, useState } from 'react';
import { enrichMotor, isSupported, resolvePart, getYearVariants } from './lib/parts';
import { decidirConsulta } from './lib/consulta';
import Hero from './Hero';
import SearchSection from './SearchSection';

const TWEAK_DEFAULTS = {
  heroLayout: 'split',
  selectorStyle: 'elevated',
  trustStyle: 'numbers',
  whyStyle: 'stacked',
  heroImage: 'static',
};

export default function LandingClient({ cfg, children }) {
  const [tweaks] = useState(TWEAK_DEFAULTS);
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

  const handleSearch = async ({ kind, plate, year, motor }) => {
    setSearching(true);
    setResult(null);

    if (kind === 'year') {
      setTimeout(() => {
        const variants = getYearVariants(cfg)[year] || [];
        const filtered = motor ? variants.filter((v) => v.motor === motor) : variants;
        setResult({ kind: 'year', year, variants: filtered.length ? filtered : variants });
        setSearching(false);
      }, 300);
      return;
    }

    const clean = String(plate || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const body = clean.length === 7 ? { placa: clean } : { chassi: clean };

    try {
      const r = await fetch('/injecao-diesel/api/consulta-veiculo/', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });

      // Item #32 do backlog: quem decide se pode mostrar selo verde é
      // decidirConsulta(), função pura testada em tests/consulta.test.js.
      // Rate limit continua com mensagem própria (é o único caso em que o
      // visitante pode simplesmente tentar de novo).
      if (r.status === 429) {
        setResult({ kind: 'error', query: clean, message: 'Muitas consultas. Tente de novo em 1 minuto.' });
        return;
      }

      // API fora do ar / 5xx / timeout entram no mesmo caminho de "não
      // encontrei" — nunca em selo verde.
      const data = r.ok ? await r.json() : { error: 'upstream_error' };
      const decisao = decidirConsulta(data, { escopo: (veh) => isSupported(cfg, enrichMotor(cfg, veh)) });

      if (decisao.status === 'nao_encontrado') {
        setResult({ kind: 'notfound', query: clean });
        return;
      }

      if (decisao.status === 'fora_do_escopo') {
        setResult({ kind: 'notsupported', query: clean, vehicle: decisao.vehicle, motivo: decisao.motivo });
        return;
      }

      const v = enrichMotor(cfg, decisao.vehicle);
      setResult({
        kind: 'plate',
        vehicle: {
          plate: v.plate,
          chassi_tail: v.chassi_tail,
          marca: v.marca,
          modelo: v.modelo,
          motor: v.motor,
          ano: v.ano,
          cv: v.cv,
          part: resolvePart(cfg, v.motor, v.ano, v.cv),
        },
      });
    } catch (e) {
      console.error('consulta_veiculo_error', e);
      setResult({ kind: 'notfound', query: clean });
    } finally {
      setSearching(false);
    }
  };

  return (
    <>
      <Hero
        cfg={cfg}
        heroLayout={tweaks.heroLayout}
        selectorStyle={tweaks.selectorStyle}
        heroImage={tweaks.heroImage}
        onSearch={handleSearch}
        isSearching={searching}
      />
      {children}
      <div ref={resultRef}>
        <SearchSection
          cfg={cfg}
          result={result}
          onSearch={handleSearch}
          isSearching={searching}
          selectorStyle={tweaks.selectorStyle}
        />
      </div>
    </>
  );
}
