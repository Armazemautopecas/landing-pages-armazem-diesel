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

function faqsTemplate(F, V) {
  // Quando F está preenchido (LP com 1 fabricante, ex: Amarok=Bosch), cita o nome.
  // Quando F está vazio (LP multi-marca, ex: HR=Delphi+Bosch), usa termo genérico.
  const oemLabel = F ? `OEM ${F}` : 'peça original';
  const oemLabelCap = F ? `OEM ${F}` : 'Peça original';
  const garantia = F ? `Garantia de fábrica ${F}` : 'Garantia de fábrica';
  const peca = F ? `OEM ${F} é a peça original do fabricante` : 'Peça original é a do fabricante que monta na sua';
  const pecaTail = F ? ` — a mesma marca montada na sua ${V} de fábrica` : ` ${V} de fábrica`;

  return [
    {
      q: 'Como sei que o bico é o certo pro meu carro?',
      a: 'Inserindo a placa ou chassi, nosso sistema identifica seu veículo via consulta FIPE/Denatran e mostra só o bico compatível com seu motor e ano. Se tiver dúvida, o vendedor confere o código antes do envio.',
    },
    {
      q: `Qual a diferença entre ${oemLabel} e primeira linha?`,
      a: `${peca}${pecaTail}. Primeira linha é de outro fornecedor homologado, com qualidade equivalente e garantia, preço mais acessível. Mostramos as duas opções quando disponíveis pra você escolher.`,
    },
    {
      q: 'E se a peça não servir no meu carro?',
      a: 'Se o sistema identificou pela placa e a peça não servir, a gente resolve: troca sem custo pra você ou reembolso integral. É pra isso que cruzamos os dados com FIPE/Denatran antes de liberar o pedido.',
    },
    {
      q: 'Prazo de entrega e garantia?',
      a: `Despacho no mesmo dia útil da confirmação do pagamento, entrega rastreada pra todo Brasil de Chapecó/SC. ${garantia} mais garantia de loja da Armazém Auto Peças.`,
    },
    {
      q: 'Formas de pagamento, nota fiscal e troca?',
      a: 'PIX, boleto e cartão em até 10x; toda compra sai com nota fiscal eletrônica (pessoa física ou CNPJ). Troca/devolução em até 7 dias (CDC) + garantia de defeito. Oficinas/frotistas têm condição de revenda — chame no WhatsApp.',
    },
  ];
}

export function getContent(cfg) {
  const F = getFabricanteLabel(cfg);
  const V = modelLabel(cfg.veiculo.modelo_aliases[0]);

  return {
    TESTIMONIALS: cfg.content?.testimonials || TESTIMONIALS_DEFAULT,
    FAQS: cfg.content?.faqs || faqsTemplate(F, V),
  };
}
