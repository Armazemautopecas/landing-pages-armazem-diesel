'use client';

// Pixel de medição do ChatGPT Ads (OpenAI oaiq) — SÓ nesta LP (destino da
// campanha teste). Carrega o SDK, inicializa com o pixelId da conta e dispara
// o evento custom "whatsapp_click" em qualquer clique de CTA WhatsApp da
// página (tudo que aponta pro bridge do tracker /wa/bico-injetor — cobre
// hero, puxa-placa, grade de linhas, FinalCTA e o botão flutuante).
// Docs: https://developers.openai.com/ads/measurement-pixel

import { useEffect } from 'react';

const PIXEL_ID = 'L6sE6mJzi9S38GNo8MAAsF';

export default function OaiPixel() {
  useEffect(() => {
    (function (w, d, s, u) {
      if (w.oaiq) return;
      var q = function () { q.q.push(arguments); };
      q.q = [];
      w.oaiq = q;
      var js = d.createElement(s);
      js.async = true;
      js.src = u;
      var f = d.getElementsByTagName(s)[0];
      f.parentNode.insertBefore(js, f);
    })(window, document, 'script', 'https://bzrcdn.openai.com/sdk/oaiq.min.js');

    // Init + page_viewed uma única vez — navegação SPA de volta não repete.
    // page_viewed é chamada explícita (docs: o SDK NÃO dispara sozinho) e é o
    // denominador da campanha: sem ela só teríamos cliques, sem taxa de conversão.
    if (!window.__oaiqInitDone) {
      window.oaiq('init', { pixelId: PIXEL_ID });
      window.oaiq('measure', 'page_viewed', {
        type: 'contents',
        contents: [{ id: 'bico-injetor', name: 'LP Bico Injetor Diesel', content_type: 'page' }],
      });
      window.__oaiqInitDone = true;
    }

    // Identifica O QUE o visitante escolheu: o slug do bridge é sempre
    // 'bico-injetor' (carimbo da campanha), então o veículo vem da mensagem
    // pré-preenchida do link (?text=...). Recorta o modelo conhecido e manda
    // no contents — mesmo formato do page_viewed.
    const VEICULOS = [
      'PAJERO SPORT', 'DISCOVERY SPORT', 'RANGE ROVER SPORT', 'NEW HOLLAND',
      'FORD CARGO', 'CONSTELLATION', 'JOHN DEERE', 'CATERPILLAR', 'AMAROK',
      'HILUX', 'RANGER', 'FRONTIER', 'SPRINTER', 'MASTER', 'DUCATO', 'BOXER',
      'JUMPER', 'TRANSIT', 'DAILY', 'TRITON', 'PAJERO', 'EVOQUE', 'FREELANDER',
      'DISCOVERY', 'CUMMINS', 'S10', 'L200', 'JCB', 'CASE', 'HR',
    ];
    const vehicleFromHref = (href) => {
      try {
        const text = decodeURIComponent(new URL(href).searchParams.get('text') || '').toUpperCase();
        const hit = VEICULOS.find((v) => text.includes(v));
        if (hit) return hit;
        const oem = text.match(/BICO INJETOR ([A-Z0-9-]{6,})/);
        if (oem) return `OEM ${oem[1]}`;
      } catch (_) { /* href fora do padrão — segue genérico */ }
      return 'geral';
    };
    const onClick = (e) => {
      const a = e.target.closest && e.target.closest('a[href*="/wa/bico-injetor"]');
      if (!a || !window.oaiq) return;
      const veic = vehicleFromHref(a.href);
      window.oaiq('measure', 'custom', {
        type: 'custom',
        contents: [{
          id: veic.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name: `WhatsApp: ${veic}`,
          content_type: 'cta',
        }],
      }, { custom_event_name: 'whatsapp_click' });
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return null;
}
