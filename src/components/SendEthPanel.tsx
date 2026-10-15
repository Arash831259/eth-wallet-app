import { useEffect, useState, type FormEvent } from "react";
import { isAddress, isAddressEqual, parseEther } from "viem";
import { useBalance, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { ETH_SEND_AMOUNT } from "../constants";
import { useWalletState } from "../hooks/useWalletState";
import { useI18n } from "../i18n";
import { TxStatus } from "./TxStatus";

export function SendEthPanel() {
  const { t } = useI18n();
  const { address, onSepolia } = useWalletState();
  const [to, setTo] = useState("");
  const [validation, setValidation] = useState<string | null>(null);

  const { refetch: refetchBalance } = useBalance({ address });
  const {
    sendTransaction,
    data: hash,
    isPending: signing,
    error: sendError,
    reset,
  } = useSendTransaction();
  const receipt = useWaitForTransactionReceipt({ hash });

  const reverted = receipt.isSuccess && receipt.data.status === "reverted";
  const succeeded = receipt.isSuccess && receipt.data.status === "success";
  const confirming = !!hash && !receipt.isSuccess && !receipt.isError;

  useEffect(() => {
    if (succeeded) {
      void refetchBalance();
      setTo("");
    }
  }, [succeeded, refetchBalance]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    reset();

    if (!isAddress(to)) return setValidation(t("invalidAddress"));
    if (address && isAddressEqual(to, address)) return setValidation(t("sameAddress"));
    if (!onSepolia) return setValidation(t("needSepolia"));

    setValidation(null);
    sendTransaction({ to, value: parseEther(ETH_SEND_AMOUNT) });
  }

  return (
    <section className="card">
      <h2>{t("sendEthTitle")}</h2>
      <form className="form" onSubmit={onSubmit}>
        <label htmlFor="eth-to">{t("recipient")}</label>
        <input
          id="eth-to"
          className="mono"
          dir="ltr"
          placeholder={t("recipientPlaceholder")}
          value={to}
          onChange={(e) => setTo(e.target.value.trim())}
          disabled={signing || confirming}
          autoComplete="off"
          spellCheck={false}
        />
        {validation && <div className="status error">{validation}</div>}
        <button
          type="submit"
          className="btn primary"
          disabled={!to || !onSepolia || signing || confirming}
        >
          {t("sendEthButton", { amount: ETH_SEND_AMOUNT })}
        </button>
      </form>

      <TxStatus
        signing={signing}
        hash={hash}
        confirming={confirming}
        success={succeeded}
        error={sendError ?? receipt.error ?? (reverted ? new Error("reverted") : null)}
        successMessage={t("ethSent", { amount: ETH_SEND_AMOUNT })}
      />
    </section>
  );
}
