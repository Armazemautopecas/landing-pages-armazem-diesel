---
target: LP da Amarok
total_score: 29
p0_count: 0
p1_count: 3
timestamp: 2026-07-14T20-41-01Z
slug: app-injecao-diesel-amarok
---
# Critique — LP Amarok (app/injecao-diesel/amarok)

Method: dual-agent (A: design review · B: detector CLI; browser steps skipped — no browser automation)

## Design Health Score — 29/40 (Good)

| # | Heurística | Score | Issue |
|---|---|---|---|
| 1 | Visibilidade de status | 3 | fetch sem timeout (LandingClient.jsx:135) → spinner eterno |
| 2 | Match mundo real | 4 | "chassi" sem explicação |
| 3 | Controle e liberdade | 2 | mobile pós-resultado sem caminho pra nova busca |
| 4 | Consistência | 2 | "Ver detalhes" abre WhatsApp; CTAs navy vs vermelho entre fluxos |
| 5 | Prevenção de erro | 3 | placa com 6 chars vira busca de chassi silenciosa |
| 6 | Reconhecimento | 3 | "confira nº estampado na peça antiga" exige desmontagem |
| 7 | Flexibilidade | 3 | falta caminho "não sei nada" visível |
| 8 | Estética minimalista | 3 | 6 animações infinitas simultâneas |
| 9 | Recuperação de erro | 3 | 5 estados de erro com WA contextual (excelente); falta "tentar de novo" |
| 10 | Ajuda | 3 | FAQ 8 perguntas + TechnicalBlock |

## Anti-patterns
- Não é AI-slop: stack tipográfica própria (Big Shoulders + Work Sans + JetBrains Mono), paleta navy/vermelho distintiva, prefers-reduced-motion coberto.
- Tell principal: 6 animações infinitas simultâneas (red-dot :524, pulse-width :503, pulse-arrow :587, blink-dot :782, cascata sintomas :1084, wa-pulse :1039).
- TrustBar com template hero-metric (100%/24h/OEM/10K+); "OEM" como número é forçado.
- Detector: 3 hits, 2 falsos-positivos (broken-image em comentário Hero.jsx:4; side-tab .aplic-card não usado pela Amarok). 1 confirmado: layout-transition width em .why-card::before (styles.css:869), atenuado (pseudo-elemento 3px absoluto).

## Priority Issues
- [P1] Beco sem saída pós-busca no mobile (SearchSection.jsx:407-419 + styles.css:382). Fix: botão "↻ Consultar outra placa" que faz setResult(null).
- [P1] "Ver detalhes" abre WhatsApp (SearchSection.jsx:338-341). Fix: rotular "Cotar no WhatsApp" + ícone, cor vermelha.
- [P1] Garantia anti-risco ("não serviu = troca/reembolso", FAQ id troca) ausente no result card. Fix: promover pra bullet do card.
- [P2] Fetch sem timeout (LandingClient.jsx:135). Fix: AbortSignal.timeout(10000).
- [P2] font-display: optional (styles.css:6) mata Big Shoulders em cache frio 4G. Fix: swap nas faces de heading.
- [P3] "Cód. OEM: Consulte no WhatsApp" parece bug de template. Fix: omitir linha e usar frase.

## Persona Red Flags
- Jordan (leigo): não sabe o que é chassi; "Motor (opcional)" sem saber qual tem; variantes em 11px exigem desmontar motor.
- Casey (mecânico mobile): beco sem saída pós-resultado atinge consultas em série; códigos OEM 11px sem tap-to-copy.
- Riley (stress): placa 6 chars → chassi silencioso; API pendurada → spinner infinito; sem JS o CTA mobile ancora em selector morto; JSON-LD com faixa de preço que a página nunca mostra.

## Minor
- Footer headings rgba(.5) sobre navy ≈4.3:1 em 11px — subir pra .6.
- .ph-label 10px sobre gradiente — redundante.
- .hint-row amarelo fora do sistema de cor.
- Eyebrow hero genérico ("COMPRA SEGURA...") no pixel mais valioso.
- ~130 linhas de CSS de máquinas pesadas carregadas em toda LP pickup.

## Questions
1. A busca por placa deveria SER o hero no mobile?
2. Faixa de preço honesta no result card mataria menos leads no "quanto custa"?
3. Por que o pico "✓ Veículo Identificado" é seguido de códigos em 11px e não de dobra de aposta com garantia?
