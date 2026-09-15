// Conteúdo compartilhado entre LPs (testimonials + FAQs).
// Templates são parametrizados por CFG (fabricante + modelo).
// Pra customizar por LP, sobrescrever via CFG.content.testimonials ou CFG.content.faqs no config.json.
//
// Uso:
//   import CFG from '../config.json';
//   import { getContent } from '@/lib/content';
//   const { TESTIMONIALS, FAQS } = getContent(CFG);

function modelLabel(modelAlias) {
  // siglas curtas mantém UPPER (HR, S10), nomes >3 chars Title Case (Amarok, Hilux)
  const m = modelAlias || '';
  return m.length <= 3 ? m : m.charAt(0) + m.slice(1).toLowerCase();
}

// LP com 1 fabricante (ex: Amarok=Bosch) → cita o nome.
// LP com múltiplas marcas convivendo por ano (ex: HR=Delphi+Bosch) deixa
// fabricante_principal_short vazio → texto inicial vira genérico ("peças originais").
// Quando o cliente busca, SearchSection mostra a marca real do ano via variant.marca_bico.
export function getFabricanteLabel(cfg) {
  return cfg?.peca?.fabricante_principal_short || '';
}

// LP de máquina/caminhão pesado (Caterpillar, JCB, John Deere, New Holland,
// Case, Cummins, VW Caminhão, Ford Cargo): tem catálogo de peças por código E
// bloco de aplicações por motor. Máquina não tem placa, não está na FIPE e não
// tem Denatran — regra N16/N17 da skill. A LP `bico-injetor` também tem
// catálogo, mas é o hub da linha diesel de rua e TEM consulta por placa, por
// isso a segunda condição.
export function isMaquina(cfg) {
  return !!(cfg?.catalogo_pecas && cfg?.aplicacoes_por_motor);
}

// Rótulo da família em LP de máquina. Sai do próprio H1 da LP ("CATERPILLAR",
// "FORD CARGO", "VW CONSTELLATION, WORKER E DELIVERY" → "VW Constellation").
// Não usa modelo_aliases[0] porque lá está o código do modelo (320D, 821E),
// que no meio de uma frase virava "320d C7, C9, ...".
const SIGLAS = ['VW', 'JCB', 'MAN', 'CAT', 'NH', 'CNH', 'JD', 'MWM', 'FPT'];

function maquinaLabel(cfg) {
  const bruto = (cfg?.hero?.h1_linha2 || '').split(',')[0].trim();
  return bruto
    .split(/\s+/)
    .map((w) => (SIGLAS.includes(w.toUpperCase()) ? w.toUpperCase() : w.charAt(0) + w.slice(1).toLowerCase()))
    .join(' ');
}

// Marcas de peça que a própria LP já cita no texto do bloco "por que a gente",
// na ordem em que aparecem. Não inventa marca: se a LP só fala de Bosch, sai
// "Bosch". Usado na barra de confiança das LPs de máquina, onde "OEM Bosch"
// sozinho contradizia o texto logo abaixo.
const MARCAS_CONHECIDAS = ['Bosch', 'Delphi', 'Denso', 'Vitesco', 'Continental', 'Siemens'];

export function getMarcasLabel(cfg) {
  const texto = (cfg?.why?.items || []).map((i) => i.body || '').join(' ');
  const achadas = MARCAS_CONHECIDAS
    .map((m) => [m, texto.indexOf(m)])
    .filter(([, i]) => i >= 0)
    .sort((a, b) => a[1] - b[1])
    .map(([m]) => m);
  if (achadas.length === 0) return '';
  if (achadas.length === 1) return achadas[0];
  return `${achadas.slice(0, -1).join(', ')} e ${achadas[achadas.length - 1]}`;
}

// Depoimentos reais coletados do Google Business da Armazém Auto Peças
// (4,6 ★ · 109 avaliações). Curadoria dos mais relevantes — variedade
// geográfica + perfil (oficina/Local Guide/cliente final) + foco no que o
// público da LP procura ouvir (peça certa, entrega rápida, atendimento).
// Os 12 originais ficam catalogados em ~/.claude/projects/-root/memory/
// reference_armazem_depoimentos_google.md pra rotação futura.
// 2026-09-15 (item #34 do backlog, parte executável): removido o depoimento
// assinado por "Sara C." — Sara é pessoa do time da Armazém. Sobraram 5.
// A troca dos demais por depoimento da MESMA família da LP (picape / máquina)
// depende de o Diego fornecer depoimentos reais dessas famílias.
const TESTIMONIALS_DEFAULT = [
  {
    q: 'Peça cara, mas aqui o preço estava bem melhor. Fiz o pix na sexta, a peça chegou na segunda. Original, já foi instalada, ficou perfeito. Ganharam um bom cliente.',
    name: 'Ton R.',
    role: 'Automaticar · Londrina/PR',
  },
  {
    q: 'Empresa séria e com compromisso com o cliente. Comprei 4 bicos injetores da Triton 2.4 diesel 2020 para um cliente meu. Chegaram todos novos e lacrados. Excelente atendimento.',
    name: 'Marcos Henrique P.',
    role: 'Oficina parceira, ES',
  },
  {
    q: 'Recebi as peças conforme pedido, originais. Entrega e rastreio muito bom e fácil. Obrigado Vanderson pelo atendimento.',
    name: 'Ramon R.',
    role: 'Local Guide do Google · 53 avaliações',
  },
  {
    q: 'Fui muito bem atendido, a peça veio corretamente, com qualidade. Com certeza voltarei a comprar. Super indico a loja Armazém Auto Peças.',
    name: 'Marcelo M.',
    role: 'Cliente, Erechim/RS',
  },
  {
    q: 'Atendimento ímpar, gentileza e presteza absoluta. Com certeza comprarei novamente.',
    name: 'Joaquim F.',
    role: 'Cliente Armazém',
  },
];

// FAQ das LPs de máquina/caminhão pesado. Mesmo sentido do template de rua,
// mas sem "meu carro", sem "placa" e sem FIPE/Denatran — escavadeira,
// colheitadeira e caminhão não têm nada disso (regras N16 e N17 da skill).
// A porta de entrada vira o modelo + motor do equipamento ou o código gravado
// na peça, que é como o frotista realmente pede.
function faqsMaquina(F, V, M, s) {
  return [
    {
      id: 'sintomas',
      q: `Quais os sintomas de bico injetor defeituoso na linha ${V}?`,
      a: `Os principais sinais${s.motoresFrase} são: fumaça preta ou branca no escapamento, perda de potência, consumo de combustível acima do normal, marcha irregular ou dificuldade na partida a frio. Se você notar a combinação desses sintomas, o ideal é passar o equipamento num mecânico de confiança antes da pane total — bico injetor falhando danifica o motor a médio prazo.`,
    },
    {
      id: 'qualidade',
      q: `Qual a diferença entre ${s.oemLabel} e primeira linha?`,
      a: `${s.peca}${s.pecaTail}. Primeira linha é de outro fornecedor homologado, com qualidade equivalente e garantia, preço mais acessível. Mostramos as duas opções quando disponíveis pra você escolher.`,
    },
    {
      id: 'calibracao',
      q: 'Preciso calibrar ou codificar o bico depois de trocar?',
      a: 'Sim. Bicos common-rail modernos têm um código IMA (Injector Mass Adjustment) ou CSC gravado a laser na carcaça. Esse código precisa ser inserido na ECU do equipamento via scanner profissional após a troca, pra ECU saber a tolerância exata daquele bico específico. Sem essa codificação, o motor pode apresentar marcha irregular e consumo alto. Qualquer oficina equipada com scanner OEM (autorizada ou independente que trabalha com diesel) faz esse procedimento em ~10 minutos por bico.',
    },
    {
      id: 'preco',
      q: `Quanto custa um bico injetor original pra ${V}?`,
      a: `O preço varia conforme o motor${M ? ` (${M})` : ''} e o nível de exigência: bicos OEM originais ficam mais caros que primeira linha homologada. Como cada referência tem preço próprio e o estoque muda, o jeito mais rápido é consultar pelo WhatsApp informando o modelo e o motor do equipamento, ou o código gravado na peça. Mostramos os valores das opções disponíveis (OEM e primeira linha quando houver) na hora.`,
    },
    {
      id: 'compatibilidade',
      q: 'Como sei que o bico é o certo pro meu equipamento?',
      a: 'Informe o modelo e o motor do equipamento, ou o código do fabricante gravado na peça: conferimos o código e a aplicação e mostramos só o bico compatível. Se tiver dúvida, o vendedor confere o código antes do envio.',
    },
    {
      id: 'troca',
      q: 'E se a peça não servir no meu equipamento?',
      a: 'Se confirmamos pelo código do fabricante e a peça não servir, a gente resolve: troca sem custo pra você ou reembolso integral. É pra isso que conferimos o código e a aplicação antes de liberar o pedido.',
    },
    {
      id: 'prazo',
      q: 'Prazo de entrega e garantia?',
      a: `Despacho no mesmo dia útil da confirmação do pagamento, entrega rastreada pra todo Brasil de Chapecó/SC. ${s.garantia} mais garantia de loja da Armazém Auto Peças.`,
    },
    {
      id: 'pagamento',
      q: 'Formas de pagamento, nota fiscal e troca?',
      a: 'PIX, boleto e cartão em até 10x; toda compra sai com nota fiscal eletrônica (pessoa física ou CNPJ). Troca/devolução em até 7 dias (CDC) + garantia de defeito. Oficinas/frotistas têm condição de revenda — chame no WhatsApp.',
    },
  ];
}

// Template de FAQ. Cada pergunta tem id estável pra suportar override por LP
// via cfg.content.faqs (MERGE por id, não replace total — ver getContent).
//
// Slots:
//   F = fabricante principal ("Bosch") ou "" se multi-marca (ex: HR=Delphi+Bosch)
//   V = modelo formatado ("Amarok", "HR")
//   M = motores cobertos ("2.0 TDI e 3.0 V6") — vem de cfg.peca.motores_label.
//       Se ausente, fica string vazia e o template silenciosamente omite frases que dependem.
//
// Ordem das 8 perguntas segue funil cognitivo:
//   diagnóstico → qualidade → instalação → preço → compatibilidade → objection killers → closure
function faqsTemplate(F, V, M, maquina) {
  const oemLabel = F ? `OEM ${F}` : 'peça original';
  const garantia = F ? `Garantia de fábrica ${F}` : 'Garantia de fábrica';
  const peca = F
    ? `OEM ${F} é a peça original do fabricante`
    : (maquina ? 'Peça original é a do fabricante que monta o motor' : 'Peça original é a do fabricante que monta na sua');
  const pecaTail = maquina
    ? (F ? ' — a mesma marca montada de fábrica no seu motor' : ' de fábrica')
    : (F ? ` — a mesma marca montada na sua ${V} de fábrica` : ` ${V} de fábrica`);
  // Em LP de máquina a lista de motores entra numa frase ("nos motores C7, C9,
  // C9.3…") em vez de colada no nome do modelo, que gerava "na 320d C7, C9,…".
  const motoresFrase = maquina ? (M ? ` nos motores ${M}` : '') : (M ? ` ${M}` : '');

  if (maquina) return faqsMaquina(F, V, M, { oemLabel, garantia, peca, pecaTail, motoresFrase });

  return [
    {
      id: 'sintomas',
      q: `Quais os sintomas de bico injetor defeituoso na ${V}?`,
      a: `Os principais sinais que aparecem na ${V}${motoresFrase} são: fumaça preta ou branca no escapamento, perda de potência em aceleração, consumo de combustível acima do normal, tranco ao engatar marcha ou dificuldade na partida a frio. Se você notar a combinação desses sintomas, o ideal é consultar um mecânico de confiança antes da pane total — bico injetor falhando danifica o motor a médio prazo.`,
    },
    {
      id: 'qualidade',
      q: `Qual a diferença entre ${oemLabel} e primeira linha?`,
      a: `${peca}${pecaTail}. Primeira linha é de outro fornecedor homologado, com qualidade equivalente e garantia, preço mais acessível. Mostramos as duas opções quando disponíveis pra você escolher.`,
    },
    {
      id: 'calibracao',
      q: 'Preciso calibrar ou codificar o bico depois de trocar?',
      a: `Sim. Bicos common-rail modernos têm um código IMA (Injector Mass Adjustment) ou CSC gravado a laser na carcaça. Esse código precisa ser inserido na ECU da ${V} via scanner profissional após a troca, pra ECU saber a tolerância exata daquele bico específico. Sem essa codificação, o motor pode apresentar marcha irregular e consumo alto. Qualquer oficina equipada com scanner OEM (autorizada ou independente que trabalha com diesel) faz esse procedimento em ~10 minutos por bico.`,
    },
    {
      id: 'preco',
      q: `Quanto custa um bico injetor original pra ${V}?`,
      a: `O preço varia conforme o motor${motoresFrase ? ` (${M})` : ''} e o nível de exigência: bicos OEM originais ficam mais caros que primeira linha homologada. Como cada referência tem preço próprio e o estoque muda, o jeito mais rápido é consultar pelo WhatsApp informando a placa ou o ano e motor da sua ${V}. Mostramos os valores das opções disponíveis (OEM e primeira linha quando houver) na hora.`,
    },
    {
      id: 'compatibilidade',
      q: 'Como sei que o bico é o certo pro meu carro?',
      a: 'Inserindo a placa ou chassi, nosso sistema identifica seu veículo via consulta FIPE/Denatran e mostra só o bico compatível com seu motor e ano. Se tiver dúvida, o vendedor confere o código antes do envio.',
    },
    {
      id: 'troca',
      q: 'E se a peça não servir no meu carro?',
      a: 'Se o sistema identificou pela placa e a peça não servir, a gente resolve: troca sem custo pra você ou reembolso integral. É pra isso que cruzamos os dados com FIPE/Denatran antes de liberar o pedido.',
    },
    {
      id: 'prazo',
      q: 'Prazo de entrega e garantia?',
      a: `Despacho no mesmo dia útil da confirmação do pagamento, entrega rastreada pra todo Brasil de Chapecó/SC. ${garantia} mais garantia de loja da Armazém Auto Peças.`,
    },
    {
      id: 'pagamento',
      q: 'Formas de pagamento, nota fiscal e troca?',
      a: 'PIX, boleto e cartão em até 10x; toda compra sai com nota fiscal eletrônica (pessoa física ou CNPJ). Troca/devolução em até 7 dias (CDC) + garantia de defeito. Oficinas/frotistas têm condição de revenda — chame no WhatsApp.',
    },
  ];
}

// Override de FAQ por LP é MERGE por id — não replace total. Permite uma LP
// sobrescrever só 1 ou 2 respostas (ex: Amarok V6 com "estoque sob consulta")
// sem precisar duplicar as 8 perguntas no config.json.
//
// Forma esperada em cfg.content.faqs:
//   { "preco": { "q": "...", "a": "..." }, "qualidade": { "a": "..." } }
//
// Cada chave é o id da pergunta. Pode sobrescrever só `q`, só `a` ou ambos.
// Pra adicionar pergunta nova fora do template, usar id desconhecido — vai pro fim.
function applyFaqOverrides(baseFaqs, overrides) {
  if (!overrides || typeof overrides !== 'object') return baseFaqs;
  const knownIds = new Set(baseFaqs.map((f) => f.id));
  const merged = baseFaqs.map((f) => (overrides[f.id] ? { ...f, ...overrides[f.id] } : f));
  for (const [id, extra] of Object.entries(overrides)) {
    if (!knownIds.has(id)) merged.push({ id, ...extra });
  }
  return merged;
}

export function getContent(cfg) {
  const maquina = isMaquina(cfg);
  const F = getFabricanteLabel(cfg);
  const V = maquina ? maquinaLabel(cfg) : modelLabel(cfg.veiculo.modelo_aliases[0]);
  const M = cfg.peca?.motores_label || '';

  return {
    TESTIMONIALS: cfg.content?.testimonials || TESTIMONIALS_DEFAULT,
    FAQS: applyFaqOverrides(faqsTemplate(F, V, M, maquina), cfg.content?.faqs),
  };
}

// ---------------------------------------------------------------------------
// PADRÃO DE CTA — decisão Diego 15/09/2026 (Onda 1, padronização do hero).
//
// Antes cada LP escrevia o texto do botão no seu próprio config.json, e as 31
// LPs do diesel + as 15 do gasolina + as 10 da CdI acabaram com 3 variações
// diferentes ("Falar com vendedor", "Falar com o vendedor no WhatsApp", ...).
// Agora o texto é UM só, escrito aqui, e todo botão de WhatsApp da LP (topo,
// meio e fecho) lê esta constante. O config.json continua trazendo o campo
// final_cta.btn com o mesmo texto — o gate `cta-padrao` confere os dois.
//
// NÃO alterar sem decisão explícita do Diego: o gate reprova qualquer variação.
export const CTA_PRINCIPAL = 'FALAR COM O VENDEDOR AGORA';

// Botão secundário do topo — só nas LPs que têm busca por placa/ano.
export const CTA_SECUNDARIO = 'ACHAR O BICO CERTO';
