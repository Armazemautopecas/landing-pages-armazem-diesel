'use client';

// Pixel de medição do ChatGPT Ads (OpenAI oaiq) — SÓ nesta LP (destino da
// campanha teste). Carrega o SDK, inicializa com o pixelId da conta e dispara
// o evento custom "whatsapp_click" em qualquer clique de CTA WhatsApp da
// página (tudo que aponta pro bridge do tracker /wa/bico-injetor — cobre
// hero, puxa-placa, grade de linhas, FinalCTA e o botão flutuante).
// Docs: https://developers.openai.com/ads/measurement-pixel

import { useEffect } from 'react';
import { LINHAS, normalizar } from './linhas-data';

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

    // Identifica O QUE o visitante escolheu. O slug do bridge é sempre
    // 'bico-injetor' (carimbo da campanha); o veículo vem da mensagem
    // pré-preenchida do link (?text=...). Casamento por LISTA (linhas-data.js,
    // a mesma que monta a grade — linha nova nasce medida), nunca por gramática:
    // se a copy mudar mas seguir citando o veículo, continua funcionando.
    // Falha visível: clique em área de veículo sem casamento → 'nao-identificado'
    // (nunca vazio); CTAs genéricos (hero/fab/CTA final) → 'cta-geral'.
    const vehicleFromClick = (a) => {
      let text = '';
      try {
        text = normalizar(decodeURIComponent(new URL(a.href).searchParams.get('text') || ''));
      } catch (_) { /* href fora do padrão */ }
      const hit = LINHAS.find((l) => text.includes(l.chave) || text.includes(normalizar(l.nome)));
      if (hit) return { id: hit.slug, name: hit.nome };
      const oem = text.match(/bico injetor ([a-z0-9-]{6,})/);
      if (oem) return { id: `oem-${oem[1]}`, name: `OEM ${oem[1].toUpperCase()}` };
      // Área onde DEVIA ter veículo (busca por placa ou grade de linhas)?
      const areaVeiculo = a.closest('#buscar') || a.closest('#linhas');
      return areaVeiculo
        ? { id: 'nao-identificado', name: 'Não identificado' }
        : { id: 'cta-geral', name: 'CTA geral' };
    };
    const onClick = (e) => {
      const a = e.target.closest && e.target.closest('a[href*="/wa/bico-injetor"]');
      if (!a || !window.oaiq) return;
      const veic = vehicleFromClick(a);
      window.oaiq('measure', 'custom', {
        type: 'custom',
        contents: [{ id: veic.id, name: veic.name, content_type: 'cta' }],
      }, { custom_event_name: 'whatsapp_click' });
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return null;
}
