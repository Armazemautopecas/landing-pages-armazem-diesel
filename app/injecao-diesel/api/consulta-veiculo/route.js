import { Redis } from '@upstash/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const redis = Redis.fromEnv();

const RATE_LIMIT = 5;
const RATE_WINDOW = 70;
const CACHE_TTL = 60 * 60 * 24;

function normalizePlate(s) {
  return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
}

function normalizeChassi(s) {
  return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 17);
}

function clientIp(req) {
  const xf = req.headers.get('x-forwarded-for');
  if (xf && xf.length) return xf.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

async function checkRateLimit(ip) {
  const key = `rl:${ip}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, RATE_WINDOW);
  return count <= RATE_LIMIT;
}

function extractPayload(raw) {
  const arr = Array.isArray(raw) ? raw[0] : raw;
  if (!arr || typeof arr !== 'object') return null;
  if (arr.error === true) return null;

  if (arr.basico && arr.basico.dados && !arr.basico.error) {
    const v = { ...arr.basico.dados };
    if (arr.chassi && arr.chassi.dados && arr.chassi.dados.chassi) {
      v.chassi_completo = arr.chassi.dados.chassi;
    }
    return v;
  }

  if (arr.chassi && typeof arr.chassi === 'object') {
    if (arr.chassi.marca || arr.chassi.modelo || arr.chassi.chassi_completo) {
      return arr.chassi;
    }
    if (arr.chassi.dados) return arr.chassi.dados;
  }

  return arr.data || arr;
}

function normalizeVehicle(p, { plate, chassi }) {
  const marcaRaw = String(p.marca || '').toUpperCase().trim();
  const modeloRaw = String(p.modelo || '').toUpperCase().trim();
  const marca = marcaRaw === 'VW' ? 'VOLKSWAGEN' : marcaRaw;

  const cv = parseInt(p.potencia || p.cv || '0', 10) || null;
  let motor = String(p.motor || '').trim();
  const combust = String(p.combustivel || '').toUpperCase();

  if (motor && combust && !motor.toUpperCase().includes(combust)) {
    motor = `${motor} ${combust[0] + combust.slice(1).toLowerCase()}`;
  }

  const ano = parseInt(p.anoModelo || p.ano || '0', 10) || null;

  const plateOut = plate
    ? `${plate.slice(0, 3)}-${plate.slice(3)}`
    : (p.placa_modelo_novo || p.placa || '');

  const chassiFull = p.chassi_completo || p.chassi || chassi || '';
  const chassiTail = String(chassiFull).slice(-6);

  return {
    plate: plateOut,
    chassi_tail: chassiTail,
    marca,
    modelo: modeloRaw,
    motor,
    ano,
    cv,
  };
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const placaIn = body.placa ? normalizePlate(body.placa) : null;
  const chassiIn = body.chassi ? normalizeChassi(body.chassi) : null;

  let kind, query;
  if (placaIn && placaIn.length === 7) {
    kind = 'placa';
    query = placaIn;
  } else if (chassiIn && chassiIn.length >= 6 && chassiIn.length <= 17) {
    kind = 'chassi';
    query = chassiIn;
  } else {
    return Response.json(
      { error: 'invalid_input', message: 'Informe uma placa (7 caracteres) ou chassi (6-17 caracteres).' },
      { status: 400 },
    );
  }

  const ip = clientIp(req);
  try {
    const ok = await checkRateLimit(ip);
    if (!ok) {
      return Response.json(
        { error: 'rate_limited', message: 'Muitas consultas. Tente novamente em 1 minuto.' },
        { status: 429 },
      );
    }
  } catch (e) {
    console.error('rate_limit_error', e);
  }

  const cacheKey = `veiculo:${kind}:${query}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return Response.json({ ...cached, cached: true });
  } catch (e) {
    console.error('cache_read_error', e);
  }

  const webhookUrl = kind === 'placa' ? process.env.N8N_WEBHOOK_PLATE : process.env.N8N_WEBHOOK_CHASSI;
  if (!webhookUrl) return Response.json({ error: 'config_missing' }, { status: 500 });

  const payload = kind === 'placa' ? { placa: query } : { chassi: query };

  let raw;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const r = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!r.ok) {
      return Response.json({ error: 'upstream_error', status: r.status }, { status: 502 });
    }
    raw = await r.json();
  } catch (e) {
    if (e?.name === 'AbortError') {
      console.error('webhook_fetch_timeout', { kind, query });
      return Response.json({ error: 'upstream_timeout' }, { status: 504 });
    }
    console.error('webhook_fetch_error', e);
    return Response.json({ error: 'upstream_unreachable' }, { status: 502 });
  } finally {
    clearTimeout(timeoutId);
  }

  const data = extractPayload(raw);
  if (!data) {
    const resp = { found: false, reason: 'not_found', kind, query };
    try { await redis.set(cacheKey, resp, { ex: 60 * 60 }); } catch {}
    return Response.json(resp);
  }

  const vehicle = normalizeVehicle(data, {
    plate: kind === 'placa' ? query : null,
    chassi: kind === 'chassi' ? query : null,
  });

  const resp = { found: true, vehicle };
  try { await redis.set(cacheKey, resp, { ex: CACHE_TTL }); } catch {}
  return Response.json(resp);
}

export function GET() {
  return Response.json({ error: 'method_not_allowed' }, { status: 405 });
}
