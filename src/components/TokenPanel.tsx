import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  erc20Abi,
  formatUnits,
  isAddress,
  isAddressEqual,
  parseUnits,
  zeroAddress,
} from "viem";
import {
  useReadContracts,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";
import { MAX_EVENTS, TOKEN_PRESETS } from "../constants";
import { useWalletState } from "../hooks/useWalletState";
import { useI18n } from "../i18n";
import { trimDecimals } from "../lib/format";
import type { RawTransferLog, TransferEvent } from "../types";
import { TransferFeed } from "./TransferFeed";
import { TxStatus } from "./TxStatus";

export function TokenPanel() {
  const { t } = useI18n();
  const { address, onSepolia } = useWalletState();

  const [tokenInput, setTokenInput] = useState<string>(TOKEN_PRESETS[0].address);
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [validation, setValidation] = useState<string | null>(null);
  const [sent, setSent] = useState<{ amount: string; symbol: string } | null>(null);
  const [events, setEvents] = useState<TransferEvent[]>([]);

  const token = isAddress(tokenInput) ? tokenInput : undefined;

  // ── Read: name, symbol, decimals and balanceOf in a single multicall ──────
  const meta = useReadContracts({
    allowFailure: true,
    contracts: [
      { address: token ?? zeroAddress, abi: erc20Abi, functionName: "name" },
      { address: token ?? zeroAddress, abi: erc20Abi, functionName: "symbol" },
      { address: token ?? zeroAddress, abi: erc20Abi, functionName: "decimals" },
      {
        address: token ?? zeroAddress,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address ?? zeroAddress],
      },
    ],
    query: { enabled: !!token && !!address },
  });
  const { refetch: refetchMeta } = meta;

  const [nameResult, symbolResult, decimalsResult, balanceResult] = meta.data ?? [];
  const name = nameResult?.status === "success" ? nameResult.result : undefined;
  const symbol = symbolResult?.status === "success" ? symbolResult.result : undefined;
  const decimals = decimalsResult?.status === "success" ? decimalsResult.result : undefined;
  const balance = balanceResult?.status === "success" ? balanceResult.result : undefined;
  const isToken = symbol !== undefined && decimals !== undefined && balance !== undefined;

  // ── Listen: Transfer events to or from the connected account ─────────────
  const handleLogs = useCallback(
    (logs: readonly RawTransferLog[]) => {
      const incoming: TransferEvent[] = [];
      for (const log of logs) {
        const { from, to: recipient, value } = log.args;
        if (!log.transactionHash || !from || !recipient || value === undefined) continue;
        incoming.push({
          id: `${log.transactionHash}-${log.logIndex}`,
          hash: log.transactionHash,
          from,
          to: recipient,
          value,
        });
      }
      if (incoming.length === 0) return;

      setEvents((prev) => {
        const seen = new Set(prev.map((e) => e.id));
        const fresh = incoming.filter((e) => {
          if (seen.has(e.id)) return false;
          seen.add(e.id);
          return true;
        });
        return [...fresh.reverse(), ...prev].slice(0, MAX_EVENTS);
      });
      void refetchMeta(); // keep the balance in sync with what just happened
    },
    [refetchMeta],
  );

  const fromArgs = useMemo(() => ({ from: address }), [address]);
  const toArgs = useMemo(() => ({ to: address }), [address]);
  const watching = isToken && !!address;

  useWatchContractEvent({
    address: token ?? zeroAddress,
    abi: erc20Abi,
    eventName: "Transfer",
    args: fromArgs,
    enabled: watching,
    onLogs: handleLogs,
  });
  useWatchContractEvent({
    address: token ?? zeroAddress,
    abi: erc20Abi,
    eventName: "Transfer",
    args: toArgs,
    enabled: watching,
    onLogs: handleLogs,
  });

  // Start with a clean feed whenever the token or account changes.
  useEffect(() => {
    setEvents([]);
  }, [token, address]);

  // ── Write: transfer(to, value) ───────────────────────────────────────────
  const {
    writeContract,
    data: hash,
    isPending: signing,
    error: writeError,
    reset,
  } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });

  const reverted = receipt.isSuccess && receipt.data.status === "reverted";
  const succeeded = receipt.isSuccess && receipt.data.status === "success";
  const confirming = !!hash && !receipt.isSuccess && !receipt.isError;

  useEffect(() => {
    if (succeeded) {
      void refetchMeta();
      setAmount("");
      setTo("");
    }
  }, [succeeded, refetchMeta]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    reset();
    setSent(null);

    if (!token || !isToken) return setValidation(t("tokenNotFound"));
    if (!isAddress(to)) return setValidation(t("invalidAddress"));
    if (address && isAddressEqual(to, address)) return setValidation(t("sameAddress"));
    if (!onSepolia) return setValidation(t("needSepolia"));

    let value: bigint;
    try {
      value = parseUnits(amount, decimals);
    } catch {
      return setValidation(t("invalidAmount"));
    }
    if (value <= 0n) return setValidation(t("invalidAmount"));
    if (value > balance) return setValidation(t("insufficientToken"));

    setValidation(null);
    setSent({ amount, symbol });
    writeContract({
      address: token,
      abi: erc20Abi,
      functionName: "transfer",
      args: [to, value],
    });
  }

  const busy = signing || confirming;

  return (
    <section className="card">
      <h2>{t("tokenTitle")}</h2>

      <div className="form">
        <label htmlFor="token-address">{t("tokenAddress")}</label>
        <input
          id="token-address"
          className="mono"
          dir="ltr"
          placeholder="0x…"
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value.trim())}
          disabled={busy}
          autoComplete="off"
          spellCheck={false}
        />
        <div className="chips" aria-label={t("tokenPresetsLabel")}>
          {TOKEN_PRESETS.map((preset) => (
            <button
              key={preset.address}
              type="button"
              className={
                token && isAddressEqual(token, preset.address) ? "chip active" : "chip"
              }
              disabled={busy}
              onClick={() => setTokenInput(preset.address)}
            >
              {preset.symbol}
            </button>
          ))}
        </div>
      </div>

      {!token && <div className="status error">{t("tokenInvalid")}</div>}
      {token && meta.isLoading && <p className="hint">{t("tokenLoading")}</p>}
      {token && !meta.isLoading && meta.isFetched && !isToken && (
        <div className="status error">{t("tokenNotFound")}</div>
      )}

      {isToken && address && (
        <>
          <div className="info">
            <div className="row">
              <span className="label">{name ?? symbol}</span>
              <span className="value mono" dir="ltr">
                {symbol}
              </span>
            </div>
            <div className="row">
              <span className="label">{t("tokenBalance")}</span>
              <span className="value mono" dir="ltr">
                {trimDecimals(formatUnits(balance, decimals))} {symbol}
              </span>
            </div>
          </div>

          <form className="form" onSubmit={onSubmit}>
            <label htmlFor="token-to">{t("recipient")}</label>
            <input
              id="token-to"
              className="mono"
              dir="ltr"
              placeholder={t("recipientPlaceholder")}
              value={to}
              onChange={(e) => setTo(e.target.value.trim())}
              disabled={busy}
              autoComplete="off"
              spellCheck={false}
            />
            <label htmlFor="token-amount">{t("tokenAmount")}</label>
            <input
              id="token-amount"
              className="mono"
              dir="ltr"
              inputMode="decimal"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value.trim())}
              disabled={busy}
              autoComplete="off"
            />
            {validation && <div className="status error">{validation}</div>}
            <button
              type="submit"
              className="btn primary"
              disabled={!to || !amount || !onSepolia || busy}
            >
              {t("tokenSendButton", { symbol })}
            </button>
          </form>

          <TxStatus
            signing={signing}
            hash={hash}
            confirming={confirming}
            success={succeeded}
            error={writeError ?? receipt.error ?? (reverted ? new Error("reverted") : null)}
            successMessage={t("tokenSent", {
              amount: sent?.amount ?? "",
              symbol: sent?.symbol ?? symbol,
            })}
          />

          <TransferFeed
            events={events}
            account={address}
            symbol={symbol}
            decimals={decimals}
          />
        </>
      )}
    </section>
  );
}
