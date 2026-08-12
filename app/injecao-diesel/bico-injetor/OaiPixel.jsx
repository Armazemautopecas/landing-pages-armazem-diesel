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

    const onClick = (e) => {
      const a = e.target.closest && e.target.closest('a[href*="/wa/bico-injetor"]');
      if (!a || !window.oaiq) return;
      window.oaiq('measure', 'custom', { type: 'custom' }, { custom_event_name: 'whatsapp_click' });
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return null;
}
