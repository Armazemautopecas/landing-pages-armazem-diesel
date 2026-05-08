import './globals.css';
import { AnalyticsScripts, AnalyticsNoscript } from './_components/Analytics';

export const metadata = {
  metadataBase: new URL('https://www.armazemautopecas.com.br'),
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <AnalyticsScripts />
        <AnalyticsNoscript />
        {children}
      </body>
    </html>
  );
}
