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

// Depoimentos reais coletados do Google Business da Armazém Auto Peças
// (4,6 ★ · 109 avaliações). Curadoria de 6 dos 12 mais relevantes — variedade
// geográfica + perfil (oficina/Local Guide/cliente final) + foco no que o
// público da LP procura ouvir (peça certa, entrega rápida, atendimento).
// Os 12 originais ficam catalogados em ~/.claude/projects/-root/memory/
// reference_armazem_depoimentos_google.md pra rotação futura.
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
    q: 'Encontrei exatamente a peça que precisava com um ótimo preço. Recomendo o Armazém Auto Peças para quem busca qualidade, agilidade e confiança. Com certeza voltarei.',
    name: 'Sara C.',
    role: 'Cliente recorrente',
  },
  {
    q: 'Atendimento ímpar, gentileza e presteza absoluta. Com certeza comprarei novamente.',
    name: 'Joaquim F.',
    role: 'Cliente Armazém',
  },
];

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
function faqsTemplate(F, V, M) {
  const oemLabel = F ? `OEM ${F}` : 'peça original';
  const garantia = F ? `Garantia de fábrica ${F}` : 'Garantia de fábrica';
  const peca = F ? `OEM ${F} é a peça original do fabricante` : 'Peça original é a do fabricante que monta na sua';
  const pecaTail = F ? ` — a mesma marca montada na sua ${V} de fábrica` : ` ${V} de fábrica`;
  const motoresFrase = M ? ` ${M}` : '';

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
  const F = getFabricanteLabel(cfg);
  const V = modelLabel(cfg.veiculo.modelo_aliases[0]);
  const M = cfg.peca?.motores_label || '';

  return {
    TESTIMONIALS: cfg.content?.testimonials || TESTIMONIALS_DEFAULT,
    FAQS: applyFaqOverrides(faqsTemplate(F, V, M), cfg.content?.faqs),
  };
}
