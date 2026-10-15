import { BaseError, InsufficientFundsError, UserRejectedRequestError } from "viem";
import type { TFunction } from "../i18n";

/** Turn a viem/wagmi transaction error into a short, translated message. */
export function describeTxError(error: unknown, t: TFunction): string {
  if (error instanceof BaseError) {
    if (error.walk((e) => e instanceof UserRejectedRequestError)) {
      return t("userRejected");
    }
    if (error.walk((e) => e instanceof InsufficientFundsError)) {
      return t("insufficientFunds");
    }
    return `${t("txFailed")}: ${error.shortMessage}`;
  }
  return t("txFailed");
}

function hasErrorName(error: unknown, name: string): boolean {
  let current: unknown = error;
  for (let depth = 0; depth < 6 && current instanceof Error; depth++) {
    if (current.name === name) return true;
    current = (current as Error & { cause?: unknown }).cause;
  }
  return false;
}

/** Turn a wallet-connection error into a short, translated message. */
export function describeConnectError(error: unknown, t: TFunction): string {
  if (hasErrorName(error, "ProviderNotFoundError")) return t("noWallet");
  if (hasErrorName(error, "UserRejectedRequestError")) return t("connectRejected");
  return t("connectFailed");
}
