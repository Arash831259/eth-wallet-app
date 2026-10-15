import { Header } from "./components/Header";
import { SendEthPanel } from "./components/SendEthPanel";
import { TokenPanel } from "./components/TokenPanel";
import { WalletPanel } from "./components/WalletPanel";
import { useWalletState } from "./hooks/useWalletState";
import { useI18n } from "./i18n";

export default function App() {
  const { t } = useI18n();
  const { isConnected } = useWalletState();

  return (
    <main className="app">
      <div className="stack">
        <Header />
        <WalletPanel />
        {isConnected && (
          <>
            <SendEthPanel />
            <TokenPanel />
          </>
        )}
        <p className="footer-note">{t("footerNote")}</p>
      </div>
    </main>
  );
}
