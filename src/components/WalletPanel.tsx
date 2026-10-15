import { formatUnits } from "viem";
import { useBalance, useConnect, useConnectors, useDisconnect, useSwitchChain } from "wagmi";
import { TARGET_CHAIN } from "../constants";
import { useWalletState } from "../hooks/useWalletState";
import { useI18n } from "../i18n";
import { describeConnectError } from "../lib/errors";
import { shorten, trimDecimals } from "../lib/format";

export function WalletPanel() {
  const { t } = useI18n();
  const { address, chainId, isConnected, onSepolia } = useWalletState();

  const allConnectors = useConnectors();
  // Hide the generic "Injected" entry when a specific wallet was discovered.
  const connectors =
    allConnectors.length > 1
      ? allConnectors.filter((c) => c.id !== "injected")
      : allConnectors;

  const { connect, isPending, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: switching } = useSwitchChain();
  const balance = useBalance({ address });

  if (!isConnected || !address) {
    return (
      <section className="card connect">
        <p>{t("connectIntro")}</p>
        <div className="connector-list">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              type="button"
              className="btn primary"
              disabled={isPending}
              onClick={() => connect({ connector })}
            >
              {isPending
                ? t("connecting")
                : t("connectWith", { name: connector.name })}
            </button>
          ))}
        </div>
        {connectors.length === 0 && <div className="status error">{t("noWallet")}</div>}
        {connectError && (
          <div className="status error" role="status">
            {describeConnectError(connectError, t)}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="card">
      <div className="info">
        <div className="row">
          <span className="label">{t("address")}</span>
          <span className="value mono" dir="ltr" title={address}>
            {shorten(address)}
          </span>
        </div>
        <div className="row">
          <span className="label">{t("network")}</span>
          <span className={`value ${onSepolia ? "ok" : "warn"}`}>
            {onSepolia
              ? TARGET_CHAIN.name
              : t("wrongNetwork", { id: chainId ?? "?" })}
          </span>
        </div>
        <div className="row">
          <span className="label">{t("balance")}</span>
          <span className="value mono" dir="ltr">
            {balance.data
              ? `${trimDecimals(
                  formatUnits(balance.data.value, balance.data.decimals),
                  4,
                )} ${balance.data.symbol}`
              : "…"}
          </span>
        </div>
      </div>

      {!onSepolia && (
        <button
          type="button"
          className="btn warning"
          disabled={switching}
          onClick={() => switchChain({ chainId: TARGET_CHAIN.id })}
        >
          {switching ? t("switching") : t("switchNetwork")}
        </button>
      )}

      <button type="button" className="btn ghost" onClick={() => disconnect()}>
        {t("disconnect")}
      </button>
    </section>
  );
}
