// Fonte ÚNICA das linhas da LP hub — usada pela grade (Linhas.jsx) e pelo
// vigia do pixel (OaiPixel.jsx). Linha nova entra AQUI e nasce na grade e no
// rastreamento juntos. `slug` é o id normalizado que vai no relatório do Ads.

export const GRUPOS = [
  {
    titulo: 'Picapes e SUVs diesel',
    itens: [
      { nome: 'VW Amarok', slug: 'amarok' },
      { nome: 'Toyota Hilux', slug: 'hilux' },
      { nome: 'Ford Ranger', slug: 'ranger' },
      { nome: 'Chevrolet S10', slug: 's10' },
      { nome: 'Nissan Frontier', slug: 'frontier' },
      { nome: 'Mitsubishi L200', slug: 'l200' },
      { nome: 'Mitsubishi Triton', slug: 'triton' },
      { nome: 'Mitsubishi Pajero', slug: 'pajero' },
      { nome: 'Mitsubishi Pajero Sport', slug: 'pajero-sport' },
    ],
  },
  {
    titulo: 'Vans e utilitários',
    itens: [
      { nome: 'Mercedes-Benz Sprinter', slug: 'sprinter' },
      { nome: 'Renault Master', slug: 'master' },
      { nome: 'Fiat Ducato', slug: 'ducato' },
      { nome: 'Peugeot Boxer', slug: 'boxer' },
      { nome: 'Citroën Jumper', slug: 'jumper' },
      { nome: 'Iveco Daily', slug: 'daily' },
      { nome: 'Hyundai HR', slug: 'hr' },
      { nome: 'Ford Transit', slug: 'transit' },
    ],
  },
  {
    titulo: 'Land Rover',
    itens: [
      { nome: 'Discovery', slug: 'discovery' },
      { nome: 'Discovery Sport', slug: 'discovery-sport' },
      { nome: 'Range Rover Sport', slug: 'range-rover-sport' },
      { nome: 'Evoque', slug: 'evoque' },
      { nome: 'Freelander', slug: 'freelander' },
    ],
  },
  {
    titulo: 'Caminhões e máquinas',
    itens: [
      { nome: 'Motores Cummins', slug: 'cummins' },
      { nome: 'Ford Cargo', slug: 'ford-cargo' },
      { nome: 'VW Constellation', slug: 'vw-caminhao' },
      { nome: 'Caterpillar', slug: 'caterpillar' },
      { nome: 'JCB', slug: 'jcb' },
      { nome: 'John Deere', slug: 'john-deere' },
      { nome: 'Case', slug: 'case' },
      { nome: 'New Holland', slug: 'new-holland' },
    ],
  },
];

// Remove acento e baixa a caixa — comparação e ids sempre normalizados.
export function normalizar(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

// Lista plana pro casamento por nome: mais específico primeiro ("pajero sport"
// antes de "pajero", "discovery sport" antes de "discovery").
export const LINHAS = GRUPOS.flatMap((g) => g.itens)
  .map((it) => ({ ...it, chave: normalizar(it.nome.replace(/^(vw|toyota|ford|chevrolet|nissan|mitsubishi|mercedes-benz|renault|fiat|peugeot|citroen|iveco|hyundai|motores) /i, '')) }))
  .sort((a, b) => b.chave.length - a.chave.length);
