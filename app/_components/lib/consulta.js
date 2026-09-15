// Decisão da consulta por placa/chassi — item #32 do backlog.
//
// O problema que isso resolve: a placa inventada ABC1234 voltava da API como
// "VW Santana CG · 0.0 Álcool · 1986" e a página cravava selo verde
// "VEÍCULO IDENTIFICADO" dizendo que trabalha com bico diesel pra essa linha.
// Lead lixo no WhatsApp do vendedor e a promessa da página ("compatibilidade
// que não erra") destruída.
//
// Esta é uma FUNÇÃO PURA: recebe o que a API devolveu + o escopo da LP e
// devolve um dos três estados. Não faz fetch, não mexe em DOM — dá pra testar
// sem chamar a API externa.
//
// Estados:
//   'ok'             → veículo existe, é diesel e é a linha desta LP  → pode mostrar a peça
//   'nao_encontrado' → placa não existe, API caiu, deu erro ou veio vazia
//   'fora_do_escopo' → veículo existe mas não é diesel / não é a linha desta LP
//
// NUNCA devolve 'ok' por omissão: qualquer dúvida cai em 'nao_encontrado' ou
// 'fora_do_escopo', que é o lado seguro (manda pro WhatsApp em vez de afirmar).

// Campos do retorno da API usados pra decidir:
//   found          → a rota já diz se o upstream achou alguma coisa
//   error          → a rota devolve isso quando o upstream falha/estoura tempo
//   vehicle.marca  → identidade (e escopo da LP)
//   vehicle.modelo → identidade (e escopo da LP)
//   vehicle.combustivel → PROVA de que é diesel (campo novo, ver route.js)
//   vehicle.motor  → fallback quando não veio combustível ("0.0" = dado podre)
//   vehicle.cv     → fallback de cilindrada/potência zerada
//   vehicle.ano    → coerência (1980..ano que vem)

const ANO_MIN = 1980;

function up(v) {
  return String(v == null ? '' : v)
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

/** O campo de combustível diz diesel? null = a API não informou. */
export function ehDiesel(combustivel) {
  const c = up(combustivel);
  if (!c) return null;
  return /DIESEL/.test(c);
}

/** Dado obviamente podre: motor/cilindrada zerada ou ano incoerente. */
export function dadoIncoerente(vehicle, hoje = new Date()) {
  const motor = up(vehicle?.motor);
  if (/(^|[^\d])0[.,]0([^\d]|$)/.test(motor)) return true;
  const ano = parseInt(vehicle?.ano, 10);
  if (!ano) return true;
  if (ano < ANO_MIN || ano > hoje.getFullYear() + 1) return true;
  return false;
}

/**
 * @param {object} data    resposta JSON da rota /api/consulta-veiculo (ou {error:...})
 * @param {object} opts
 *   @param {(v:object)=>boolean} opts.escopo  veículo pertence à linha desta LP?
 *   @param {Date}                opts.hoje    injetável pra teste
 * @returns {{status:'ok'|'nao_encontrado'|'fora_do_escopo', motivo:string, vehicle:object|null}}
 */
export function decidirConsulta(data, opts = {}) {
  const escopo = typeof opts.escopo === 'function' ? opts.escopo : () => true;
  const hoje = opts.hoje || new Date();

  // (a) não encontrei — inclui API fora do ar, timeout e resposta vazia
  if (!data || typeof data !== 'object') return { status: 'nao_encontrado', motivo: 'sem_resposta', vehicle: null };
  if (data.error) return { status: 'nao_encontrado', motivo: 'upstream_falhou', vehicle: null };
  if (data.found !== true) return { status: 'nao_encontrado', motivo: 'nao_achou', vehicle: null };

  const v = data.vehicle || null;
  if (!v || (!String(v.marca || '').trim() && !String(v.modelo || '').trim())) {
    return { status: 'nao_encontrado', motivo: 'campos_vazios', vehicle: null };
  }

  // (b) veículo existe, mas não é a linha desta página
  const diesel = ehDiesel(v.combustivel);
  if (diesel === false) return { status: 'fora_do_escopo', motivo: 'nao_e_diesel', vehicle: v };
  if (diesel === null && dadoIncoerente(v, hoje)) {
    // sem campo de combustível E com dado podre (0.0, ano fora da faixa) não dá
    // pra afirmar nada — é exatamente o caso do Santana 1986 a álcool.
    return { status: 'fora_do_escopo', motivo: 'dados_incoerentes', vehicle: v };
  }
  if (!escopo(v)) return { status: 'fora_do_escopo', motivo: 'outra_linha', vehicle: v };

  return { status: 'ok', motivo: 'compativel', vehicle: v };
}

/** "VW Santana" / "Santana" / "" — usado no texto do estado fora do escopo. */
export function identificacao(vehicle) {
  return [vehicle?.marca, vehicle?.modelo].map((x) => String(x || '').trim()).filter(Boolean).join(' ');
}
