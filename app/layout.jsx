import Script from 'next/script';
import './globals.css';

export const metadata = {
  metadataBase: new URL('https://www.armazemautopecas.com.br'),
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        {/* Pixel Armazém (Campaign Tracker) — Opção A do Vinicius (2026-05-08).
            afterInteractive = injetado após hidratação, equivale ao <script async>
            recomendado por ele. Roda em todas as LPs do path /injecao-diesel/*. */}
        <Script
          src="https://t.armazemautopecas.com.br/pixel.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
