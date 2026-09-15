import OEMS from '@/data/oems.json';

function getVeiculoData(cfg) {
  const data = OEMS[cfg.categoria]?.[cfg.veiculo_key];
  if (!data) {
    throw new Error(`Config inválida: "${cfg.categoria}" + "${cfg.veiculo_key}" não encontrado em oems.json`);
  }
  return data;
}

export function getYearVariants(cfg) {
  return getVeiculoData(cfg).variants_por_ano;
}

export function getVeiculoModelo(cfg) {
  return getVeiculoData(cfg).veiculo.modelo;
}

function resolveEquivalentes(cfg, motor) {
  const map = cfg.peca?.equivalentes_por_motor;
  if (!map || !motor) return [];
  return map[motor] || [];
}

export function resolvePart(cfg, motor, ano, cv) {
  const oemUnknown = cfg.result_messages.default_oem_unknown;
  const defaultPart = {
    name: cfg.peca.nome,
    oem: oemUnknown,
    brand: cfg.peca.fabricante_label,
    bullets: cfg.peca.bullets_unknown,
    hasLine1a: cfg.peca.tem_primeira_linha,
    equivalentes: [],
  };
  const variants = getYearVariants(cfg)[ano] || [];
  if (!variants.length) return defaultPart;

  const motorUp = String(motor || '').toUpperCase();
  const cvNum = parseInt(cv, 10) || 0;
  const isV6Hint = motorUp.includes('V6') || motorUp.includes('3.0') || cvNum >= 220;

  let match = isV6Hint ? variants.find((v) => v.motor.toUpperCase().includes('V6')) : null;
  if (!match) match = variants.find((v) => !v.motor.toUpperCase().includes('V6')) || variants[0];
  if (!match) return defaultPart;

  const isV6 = match.motor.toUpperCase().includes('V6');
  return {
    ...defaultPart,
    oem: match.oem.includes('XXX') ? oemUnknown : match.oem,
    foto: match.foto,
    marca_bico: match.marca_bico,
    motor: match.motor,
    equivalentes: resolveEquivalentes(cfg, match.motor),
    hasLine1a: !isV6 && cfg.peca.tem_primeira_linha,
    bullets: isV6 && cfg.peca.bullets_v6 ? cfg.peca.bullets_v6 : cfg.peca.bullets_default,
  };
}

export function enrichMotor(cfg, vehicle) {
  const map = cfg.veiculo?.motor_por_cv;
  if (!vehicle || vehicle.motor || !map || !vehicle.cv) return vehicle;
  const fromCv = map[String(vehicle.cv)];
  if (!fromCv) return vehicle;
  return { ...vehicle, motor: fromCv };
}

export function isSupported(cfg, vehicle) {
  const marcas = cfg.veiculo?.marca_aliases || [];
  const modelos = cfg.veiculo?.modelo_aliases || [];
  if (!marcas.length || !modelos.length) return true;
  const marcaUp = String(vehicle.marca || '').toUpperCase();
  const modeloUp = String(vehicle.modelo || '').toUpperCase();
  const marcaOk = marcas.some((a) => marcaUp === String(a).toUpperCase());
  const modeloOk = modelos.some((a) => modeloUp.includes(String(a).toUpperCase()));
  return marcaOk && modeloOk;
}

// ------------------------------------------------- formatação de código OEM
// Item #11 do backlog: o cartão do resultado mostrava "Cód. OEM: 0 445 110 369"
// e logo abaixo "Códigos compatíveis: 0445110646, ..." — mesmo tipo de código
// em dois formatos, e o principal nem aparecia na lista. Mecânico percebe e
// desconfia. Aqui o formato único é SEM ESPAÇO, igual à lista de compatíveis.
//
// Só mexe em código: `default_oem_unknown` ("Consulte no WhatsApp") e qualquer
// texto com letra minúscula passam intactos.
const OEM_CODE_RE = /^[0-9A-Z][0-9A-Z \-./]*$/;

export function formatOem(value) {
  const s = String(value == null ? '' : value).trim();
  if (!s) return s;
  if (!OEM_CODE_RE.test(s)) return s;
  if (!/\d/.test(s)) return s;
  return s.replace(/\s+/g, '');
}

// Lista de códigos compatíveis SEMPRE começando pelo código principal, todos no
// mesmo formato e sem repetição.
export function listaCompativeis(principal, equivalentes) {
  const out = [];
  const seen = new Set();
  const push = (v) => {
    const f = formatOem(v);
    if (!f || !OEM_CODE_RE.test(String(v).trim())) return;
    if (seen.has(f)) return;
    seen.add(f);
    out.push(f);
  };
  push(principal);
  (equivalentes || []).forEach(push);
  return out;
}
