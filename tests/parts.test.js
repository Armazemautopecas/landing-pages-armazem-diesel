import { describe, it, expect } from 'vitest';
import {
  resolvePart,
  enrichMotor,
  isSupported,
  getYearVariants,
  getVeiculoModelo,
  formatOem,
  listaCompativeis,
} from '@/app/_components/lib/parts.js';
import amarokCfg from '@/app/injecao-diesel/amarok/config.json';
import hrCfg from '@/app/injecao-diesel/hr/config.json';

describe('resolvePart — Amarok', () => {
  it('seleciona bico V6 quando motor tem "V6" no nome', () => {
    const part = resolvePart(amarokCfg, '3.0 V6 TDI', 2020, 224);
    expect(part.oem).toBe('0 445 117 083');
    expect(part.motor.toUpperCase()).toContain('V6');
    expect(part.hasLine1a).toBe(false);
  });

  it('seleciona bico V6 quando cv >= 220 mesmo sem "V6" no nome', () => {
    const part = resolvePart(amarokCfg, '3.0', 2020, 258);
    expect(part.oem).toBe('0 445 117 083');
  });

  it('seleciona bico TDI 2.0 quando cv < 220', () => {
    const part = resolvePart(amarokCfg, '2.0 TDI', 2020, 180);
    expect(part.oem).toBe('0 445 110 369');
    expect(part.motor.toUpperCase()).not.toContain('V6');
    expect(part.hasLine1a).toBe(true);
  });

  it('retorna defaultPart com OEM unknown quando ano fora da cobertura', () => {
    const part = resolvePart(amarokCfg, '2.0 TDI', 2008, 140);
    expect(part.oem).toBe(amarokCfg.result_messages.default_oem_unknown);
    expect(part.equivalentes).toEqual([]);
  });

  it('threshold 220cv: 219cv vai pra TDI, 220cv vai pra V6', () => {
    const partLow = resolvePart(amarokCfg, '2.0', 2020, 219);
    const partHigh = resolvePart(amarokCfg, '3.0', 2020, 220);
    expect(partLow.oem).toBe('0 445 110 369');
    expect(partHigh.oem).toBe('0 445 117 083');
  });

  it('inclui equivalentes_por_motor quando match', () => {
    const part = resolvePart(amarokCfg, '2.0 TDI', 2020, 180);
    expect(part.equivalentes).toContain('0445110646');
  });
});

describe('resolvePart — HR', () => {
  it('cobre ano 2020 (Delphi)', () => {
    const part = resolvePart(hrCfg, '2.5 D4CB', 2020, 130);
    expect(part.oem).toBeTruthy();
    expect(part.oem).not.toBe(hrCfg.result_messages.default_oem_unknown);
  });

  it('cobre ano 2024 (Bosch Euro 6)', () => {
    const part = resolvePart(hrCfg, '2.5 D4CB', 2024, 130);
    expect(part.oem).toBeTruthy();
    expect(part.oem).not.toBe(hrCfg.result_messages.default_oem_unknown);
  });
});

describe('enrichMotor', () => {
  it('preenche motor a partir de cv quando motor está vazio', () => {
    const v = enrichMotor(amarokCfg, { cv: 224 });
    expect(v.motor).toBeTruthy();
  });

  it('não sobrescreve motor já preenchido', () => {
    const v = enrichMotor(amarokCfg, { cv: 224, motor: '3.0 V6 TDI' });
    expect(v.motor).toBe('3.0 V6 TDI');
  });
});

describe('isSupported', () => {
  it('aceita marca/modelo do alias da Amarok', () => {
    expect(isSupported(amarokCfg, { marca: 'VOLKSWAGEN', modelo: 'AMAROK' })).toBe(true);
    expect(isSupported(amarokCfg, { marca: 'VW', modelo: 'AMAROK CD' })).toBe(true);
  });

  it('rejeita marca fora do alias', () => {
    expect(isSupported(amarokCfg, { marca: 'TOYOTA', modelo: 'HILUX' })).toBe(false);
  });

  it('rejeita modelo fora do alias', () => {
    expect(isSupported(amarokCfg, { marca: 'VOLKSWAGEN', modelo: 'GOLF' })).toBe(false);
  });
});

describe('getYearVariants / getVeiculoModelo', () => {
  it('Amarok cobre 2010-2026', () => {
    const variants = getYearVariants(amarokCfg);
    expect(variants[2010]).toBeDefined();
    expect(variants[2026]).toBeDefined();
  });

  it('getVeiculoModelo retorna nome correto', () => {
    expect(getVeiculoModelo(amarokCfg)).toBeTruthy();
    expect(getVeiculoModelo(hrCfg)).toBeTruthy();
  });
});


// Item #11 do backlog: formato único de código OEM na renderização do resultado
// e o código principal sempre presente na lista de compatíveis.
describe('formatOem', () => {
  it('tira os espaços do código Bosch', () => {
    expect(formatOem('0 445 110 369')).toBe('0445110369');
  });

  it('preserva hífen (Denso/Kia) e código alfanumérico', () => {
    expect(formatOem('095000-5800')).toBe('095000-5800');
    expect(formatOem('A2C59517051')).toBe('A2C59517051');
  });

  it('não mexe em texto que não é código', () => {
    expect(formatOem('Consulte no WhatsApp')).toBe('Consulte no WhatsApp');
    expect(formatOem(amarokCfg.result_messages.default_oem_unknown))
      .toBe(amarokCfg.result_messages.default_oem_unknown);
  });

  it('aceita vazio/nulo sem quebrar', () => {
    expect(formatOem(null)).toBe('');
    expect(formatOem('')).toBe('');
  });
});

describe('listaCompativeis', () => {
  it('põe o código principal na frente da lista, no mesmo formato', () => {
    const lista = listaCompativeis('0 445 110 369', ['0445110646', '0445110647']);
    expect(lista[0]).toBe('0445110369');
    expect(lista).toContain('0445110646');
  });

  it('não repete o principal quando ele já está entre os equivalentes', () => {
    const lista = listaCompativeis('0 445 110 646', ['0445110646', '0445110647']);
    expect(lista.filter((c) => c === '0445110646')).toHaveLength(1);
    expect(lista).toEqual(['0445110646', '0445110647']);
  });

  it('descarta o OEM desconhecido (texto) e devolve só códigos', () => {
    const lista = listaCompativeis(amarokCfg.result_messages.default_oem_unknown, ['0445110646']);
    expect(lista).toEqual(['0445110646']);
  });

  it('sem equivalentes devolve só o principal (a UI então esconde a linha)', () => {
    expect(listaCompativeis('0 445 110 369', [])).toEqual(['0445110369']);
    expect(listaCompativeis('0 445 110 369', undefined)).toHaveLength(1);
  });

  it('o principal da Amarok 2.0 TDI aparece na lista de compatíveis', () => {
    const part = resolvePart(amarokCfg, '2.0 TDI', 2020, 180);
    const lista = listaCompativeis(part.oem, part.equivalentes);
    expect(lista).toContain(formatOem(part.oem));
  });
});
