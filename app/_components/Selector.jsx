import { useState } from 'react';
import { getYearVariants } from './lib/parts';

export default function Selector({ cfg, onSearch, isSearching, selectorStyle }) {
  const yearVariants = getYearVariants(cfg);
  const [mode, setMode] = useState('plate');
  const [plate, setPlate] = useState('');
  const [year, setYear] = useState('');
  const [motor, setMotor] = useState('');
  const [err, setErr] = useState('');

  const allMotors = year ? yearVariants[parseInt(year, 10)] || [] : [];
  // Deduplica por nome do motor (cv não é mais exibido no dropdown — basta o motor).
  const motors = Array.from(
    new Map(allMotors.map((m) => [m.motor, m])).values()
  );

  const submitPlate = (e) => {
    e?.preventDefault();
    const clean = plate.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    if (clean.length < 6) {
      setErr('Digite uma placa (7 caracteres) ou final de chassi.');
      return;
    }
    setErr('');
    setMode('plate');
    onSearch({ kind: 'plate', plate: clean });
  };

  const submitYear = (e) => {
    e?.preventDefault();
    if (!year) { setErr('Selecione o ano.'); return; }
    setErr('');
    setMode('year');
    onSearch({ kind: 'year', year: parseInt(year, 10), motor: motor || null });
  };

  const isOutline = selectorStyle === 'outline';
  const isFlat = selectorStyle === 'flat';

  return (
    <div className={`selector ${isOutline ? 'is-outline' : ''} ${isFlat ? 'is-flat' : ''}`}>
      <h2 className="sel-title">{cfg.selector.titulo_l1}<br />{cfg.selector.titulo_l2}</h2>
      <p className="sel-small">{cfg.selector.subtexto}</p>

      <form className="sel-fieldset" onSubmit={submitPlate}>
        <label>Mais preciso</label>
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
          <button className="btn btn-red btn-block" type="submit" disabled={isSearching}>
            {isSearching && mode === 'plate' ? <><span className="loader" /> BUSCANDO</> : 'BUSCAR'}
          </button>
        </div>
      </form>

      <div className="divider-or"><span>ou</span></div>

      <form className="sel-fieldset" onSubmit={submitYear}>
        <label>Selecione</label>
        <div className="sel-row-2">
          <select
            className="sel-select"
            value={year}
            onChange={(e) => { setYear(e.target.value); setMotor(''); }}
            aria-label="Ano do veículo"
          >
            <option value="">Ano do veículo</option>
            {Object.keys(yearVariants).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          {year && (
            <select
              className="sel-select fade-in"
              value={motor}
              onChange={(e) => setMotor(e.target.value)}
              aria-label="Motor"
            >
              <option value="">Motor (opcional)</option>
              {motors.map((m, i) => (
                <option key={i} value={m.motor}>{m.motor}</option>
              ))}
            </select>
          )}
        </div>
        <button className="btn btn-navy btn-block" type="submit" style={{ marginTop: 10 }} disabled={isSearching}>
          {isSearching && mode === 'year' ? <><span className="loader" /> BUSCANDO</> : 'VER PEÇAS'}
        </button>
      </form>

      {err && <p style={{ color: '#c1121f', fontSize: 12, marginTop: 10 }}>{err}</p>}

      <p className="sel-note">
        <b style={{ color: isOutline ? 'rgba(245,245,245,0.85)' : 'var(--ink)' }}>Consultamos FIPE/Denatran pra você</b> —
        comprar a peça certa, sem achismo.
      </p>
    </div>
  );
}
