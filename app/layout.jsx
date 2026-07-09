import Script from 'next/script';
import './globals.css';

export const metadata = {
  metadataBase: new URL('https://www.armazemautopecas.com.br'),
};

// GTM-5JR9ND6 — container Armazém. Pixel Campaign Tracker já está ativo
// como tag "All Pages" dentro do GTM. Futuras tags (GA4, Google Ads,
// eventos custom) são adicionadas pela UI do GTM sem precisar deploy.
// Decisão Vinicius 2026-05-08 (Opção B em vez de pixel direto).
const GTM_ID = 'GTM-5JR9ND6';

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
