'use client';

import { useEffect } from 'react';

// Item #33 do backlog — SÓ O GANCHO, sem medição de verdade.
//
// Por que não dá pra medir agora: o pixel.js do Vinicius é uma função fechada,
// sem API pública — não existe onde chamar "dispara o evento X". O OaiPixel.jsx
// da LP bico-injetor é o pixel do OpenAI Ads (campanha de teste, a ser
// encerrada) e não serve de modelo. Ligar o evento de clique no WhatsApp
// depende de o Vinicius expor uma API no pixel.js.
//
// O que isto faz: os links de WhatsApp da LP estão espalhados por vários
// componentes server-rendered, então não havia um ponto único de clique. Este é
// o ponto único — um listener delegado que só reconhece link que passa pela
// bridge de rastreio e emite um CustomEvent no window:
//
//   window.addEventListener('whatsapp_click', (e) => { e.detail.slug, e.detail.href })
//
// Não envia nada pra lugar nenhum, não bloqueia o clique, não depende de
// biblioteca. Quando o pixel.js tiver API, basta um listener aqui.
const BRIDGE = 'https://t.armazemautopecas.com.br/wa/';

export default function WaClickBeacon({ slug }) {
  useEffect(() => {
    const onClick = (ev) => {
      const a = ev.target?.closest?.('a[href]');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (!href.startsWith(BRIDGE) && !href.startsWith('https://wa.me/')) return;
      try {
        window.dispatchEvent(new CustomEvent('whatsapp_click', { detail: { slug, href } }));
      } catch {
        /* evento é acessório: nunca pode atrapalhar o clique */
      }
    };
    document.addEventListener('click', onClick, { capture: true, passive: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, [slug]);

  return null;
}
