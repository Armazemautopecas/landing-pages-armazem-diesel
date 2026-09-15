import { describe, it, expect } from 'vitest';
import { decidirConsulta, ehDiesel, dadoIncoerente, identificacao } from '@/app/_components/lib/consulta.js';
import { isSupported, enrichMotor } from '@/app/_components/lib/parts.js';
import amarokCfg from '@/app/injecao-diesel/amarok/config.json';

// Item #32 do backlog. Nenhum teste aqui chama a API externa: decidirConsulta é
// função pura e recebe o JSON já pronto.

const HOJE = new Date('2026-09-15T12:00:00Z');
const escopoAmarok = (v) => isSupported(amarokCfg, enrichMotor(amarokCfg, v));

const amarokOk = {
  found: true,
  vehicle: {
    plate: 'ABC-1D23', chassi_tail: '123456',
    marca: 'VOLKSWAGEN', modelo: 'AMAROK', motor: '2.0 TDI',
    ano: 2020, cv: 180, combustivel: 'DIESEL',
  },
};

// O caso real do relatório de UX: placa inventada ABC1234 devolvia isso e a
// página cravava selo verde.
const santana = {
  found: true,
  vehicle: {
    plate: 'ABC-1234', chassi_tail: '',
    marca: 'VOLKSWAGEN', modelo: 'SANTANA CG', motor: '0.0 Alcool',
    ano: 1986, cv: null, combustivel: 'ALCOOL',
  },
};

describe('ehDiesel', () => {
  it('reconhece diesel com e sem acento/variação', () => {
    expect(ehDiesel('DIESEL')).toBe(true);
    expect(ehDiesel('Óleo Diesel')).toBe(true);
    expect(ehDiesel('diesel s10')).toBe(true);
  });
  it('recusa álcool, gasolina e flex', () => {
    expect(ehDiesel('ALCOOL')).toBe(false);
    expect(ehDiesel('GASOLINA')).toBe(false);
    expect(ehDiesel('FLEX')).toBe(false);
  });
  it('devolve null quando a API não informou', () => {
    expect(ehDiesel('')).toBe(null);
    expect(ehDiesel(undefined)).toBe(null);
  });
});

describe('dadoIncoerente', () => {
  it('pega cilindrada 0.0', () => {
    expect(dadoIncoerente({ motor: '0.0 Alcool', ano: 2020 }, HOJE)).toBe(true);
  });
  it('pega ano fora da faixa e ano ausente', () => {
    expect(dadoIncoerente({ motor: '2.0 TDI', ano: 1950 }, HOJE)).toBe(true);
    expect(dadoIncoerente({ motor: '2.0 TDI', ano: 2099 }, HOJE)).toBe(true);
    expect(dadoIncoerente({ motor: '2.0 TDI', ano: null }, HOJE)).toBe(true);
  });
  it('aceita veículo normal', () => {
    expect(dadoIncoerente({ motor: '2.0 TDI', ano: 2020 }, HOJE)).toBe(false);
  });
});

describe('decidirConsulta — não encontrado (a)', () => {
  it('resposta vazia / nula', () => {
    expect(decidirConsulta(null, { escopo: escopoAmarok, hoje: HOJE }).status).toBe('nao_encontrado');
  });
  it('API externa caiu (a rota devolve error) — NUNCA selo verde', () => {
    for (const err of ['upstream_error', 'upstream_timeout', 'upstream_unreachable', 'config_missing']) {
      const d = decidirConsulta({ error: err }, { escopo: escopoAmarok, hoje: HOJE });
      expect(d.status).toBe('nao_encontrado');
    }
  });
  it('found:false', () => {
    expect(decidirConsulta({ found: false, reason: 'not_found' }, { escopo: escopoAmarok, hoje: HOJE }).status)
      .toBe('nao_encontrado');
  });
  it('found:true mas marca e modelo vazios', () => {
    const d = decidirConsulta({ found: true, vehicle: { marca: '', modelo: '', ano: 2020 } }, { escopo: escopoAmarok, hoje: HOJE });
    expect(d.status).toBe('nao_encontrado');
    expect(d.motivo).toBe('campos_vazios');
  });
});

describe('decidirConsulta — fora do escopo (b)', () => {
  it('o Santana 1986 a álcool do relatório NÃO é confirmado na LP da Amarok', () => {
    const d = decidirConsulta(santana, { escopo: escopoAmarok, hoje: HOJE });
    expect(d.status).toBe('fora_do_escopo');
    expect(d.motivo).toBe('nao_e_diesel');
    expect(identificacao(d.vehicle)).toBe('VOLKSWAGEN SANTANA CG');
  });

  it('veículo diesel de outra marca não é confirmado na LP da Amarok', () => {
    const d = decidirConsulta({
      found: true,
      vehicle: { marca: 'TOYOTA', modelo: 'HILUX', motor: '2.8 TDI', ano: 2021, combustivel: 'DIESEL' },
    }, { escopo: escopoAmarok, hoje: HOJE });
    expect(d.status).toBe('fora_do_escopo');
    expect(d.motivo).toBe('outra_linha');
  });

  it('sem campo de combustível + dado podre (0.0 / ano fora) cai fora do escopo', () => {
    const d = decidirConsulta({
      found: true,
      vehicle: { marca: 'VOLKSWAGEN', modelo: 'AMAROK', motor: '0.0', ano: 1986 },
    }, { escopo: escopoAmarok, hoje: HOJE });
    expect(d.status).toBe('fora_do_escopo');
    expect(d.motivo).toBe('dados_incoerentes');
  });
});

describe('decidirConsulta — ok', () => {
  it('Amarok 2.0 TDI diesel 2020 é confirmado', () => {
    const d = decidirConsulta(amarokOk, { escopo: escopoAmarok, hoje: HOJE });
    expect(d.status).toBe('ok');
    expect(d.vehicle.modelo).toBe('AMAROK');
  });

  it('sem campo de combustível, mas dado coerente e linha certa, ainda confirma', () => {
    const d = decidirConsulta({
      found: true,
      vehicle: { marca: 'VOLKSWAGEN', modelo: 'AMAROK', motor: '2.0 TDI', ano: 2019 },
    }, { escopo: escopoAmarok, hoje: HOJE });
    expect(d.status).toBe('ok');
  });
});

describe('decidirConsulta — hub bico-injetor (d)', () => {
  // O hub usa a whitelist de linhas (MATCHERS + oems.json) como escopo.
  const whitelist = ['AMAROK', 'HILUX', 'RANGER', 'S10', 'SPRINTER'];
  const escopoHub = (v) => whitelist.some((t) => String(v.modelo || '').toUpperCase().includes(t));

  it('confirma qualquer veículo diesel da whitelist', () => {
    const d = decidirConsulta({
      found: true,
      vehicle: { marca: 'TOYOTA', modelo: 'HILUX SW4', motor: '2.8', ano: 2021, combustivel: 'DIESEL' },
    }, { escopo: escopoHub, hoje: HOJE });
    expect(d.status).toBe('ok');
  });

  it('carro a gasolina fora da whitelist cai em fora do escopo, sem selo verde', () => {
    const d = decidirConsulta({
      found: true,
      vehicle: { marca: 'CHEVROLET', modelo: 'ONIX', motor: '1.0', ano: 2022, combustivel: 'FLEX' },
    }, { escopo: escopoHub, hoje: HOJE });
    expect(d.status).toBe('fora_do_escopo');
  });

  it('o Santana do relatório também cai fora do escopo no hub', () => {
    expect(decidirConsulta(santana, { escopo: escopoHub, hoje: HOJE }).status).toBe('fora_do_escopo');
  });
});
