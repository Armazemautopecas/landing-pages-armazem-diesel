import Script from 'next/script';

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
const GADS_ID = process.env.NEXT_PUBLIC_GADS_ID;
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export function AnalyticsScripts() {
  if (GTM_ID) {
    return (
      <Script id="gtm-init" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>
    );
  }

  if (!GA4_ID && !GADS_ID) return null;

  const primaryId = GA4_ID || GADS_ID;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${primaryId}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
${GA4_ID ? `gtag('config', '${GA4_ID}');` : ''}
${GADS_ID ? `gtag('config', '${GADS_ID}');` : ''}`}
      </Script>
    </>
  );
}

export function AnalyticsNoscript() {
  if (!GTM_ID) return null;
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  );
}
