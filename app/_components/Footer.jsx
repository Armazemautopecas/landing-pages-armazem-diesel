import { WA_NUMBER_DISPLAY } from './lib/wa';

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="foot-grid">
          <div className="foot-brand">
            <img
              src="/injecao-diesel/logo-armazem.png"
              alt="Armazém Auto Peças"
              className="foot-logo"
              width="160"
              height="74"
            />
            <div className="tl">Compra segura. Entrega garantida.</div>
            <div className="tl" style={{ marginTop: 20, fontFamily: 'var(--f-mono)', fontSize: 11 }}>
              CNPJ 20.195.765/0001-31
            </div>
          </div>
          <div className="foot-col">
            <h3>Contato</h3>
            <ul>
              <li>WhatsApp {WA_NUMBER_DISPLAY}</li>
              <li>Telefone (49) 3025-8380</li>
              <li>sac@armazemautopecas.com.br</li>
              <li>Chapecó/SC</li>
            </ul>
          </div>
          <div className="foot-col">
            <h3>Institucional</h3>
            <ul>
              <li><a href="https://www.armazemautopecas.com.br/trocas-e-devolucoes" target="_blank" rel="noreferrer">Trocas e Devoluções</a></li>
              <li><a href="https://www.armazemautopecas.com.br/privacidade" target="_blank" rel="noreferrer">Política de Privacidade</a></li>
              <li><a href="https://www.armazemautopecas.com.br/termos-de-uso" target="_blank" rel="noreferrer">Termos de Uso</a></li>
            </ul>
          </div>
          <div className="foot-col">
            <h3>Redes</h3>
            <ul>
              <li><a href="https://www.instagram.com/armazemautopecas/" target="_blank" rel="noreferrer">Instagram</a></li>
              <li><a href="https://www.facebook.com/ArmazemAutopecasImportados" target="_blank" rel="noreferrer">Facebook</a></li>
            </ul>
          </div>
        </div>
        <div className="foot-bot">
          <div>© 2026 Armazém Auto Peças Ltda.</div>
        </div>
      </div>
    </footer>
  );
}
