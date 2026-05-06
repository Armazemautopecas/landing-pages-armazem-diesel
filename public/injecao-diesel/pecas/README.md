# public/pecas/

Pasta shared de fotos de peças. Cada arquivo nomeado pelo **OEM sanitizado** (sem espaços, pontos ou traços).

## Convenção

```
public/pecas/<OEM_SANITIZADO>.webp
```

Exemplos:
- `0445110369.webp` — Bosch Amarok TDI 2.0
- `0445117083.webp` — Bosch Amarok V6
- `KS28229873.webp` — Delphi HR (até 2022)
- `0445110993.webp` — Bosch HR (2023+ Euro 6)

## Como o config aponta pra cá

No `app/<slug>/config.json`:

```json
"peca": {
  "foto_default": "/pecas/0445110369.webp",
  "fotos_por_oem": {
    "0445110369": "/pecas/0445110369.webp",
    "0445117083": "/pecas/0445117083.webp"
  }
}
```

`fotos_por_oem` mapeia OEM sanitizado → path absoluto. Tem precedência sobre `foto_por_marca`. Path absoluto (`/pecas/...`) é resolvido direto pelo Next; path relativo (sem `/`) cai em `/<slug>/<file>`.

## Por que shared

Bicos diesel são fornecidos por poucas marcas (Bosch, Delphi, Denso) — o **mesmo bico** roda em motores diferentes. Ex: o Bosch `0445110993` aparece no HR (2023+), Bongo III, K2500, K2700 — todos com motor 2.5 D4CB. Sem esta pasta shared, cada LP duplicaria a mesma foto.
