import type { Hash } from "viem";
import { TARGET_CHAIN } from "../constants";
import { useI18n } from "../i18n";
import { describeTxError } from "../lib/errors";

type Props = {
  /** Waiting for the user to sign in their wallet. */
  signing: boolean;
  hash?: Hash;
  /** Submitted, waiting for the block confirmation. */
  confirming: boolean;
  success: boolean;
  error: unknown;
  successMessage: string;
};

export function TxStatus({
  signing,
  hash,
  confirming,
  success,
  error,
  successMessage,
}: Props) {
  const { t } = useI18n();

  let kind: "error" | "pending" | "success" | null = null;
  let message = "";

  if (error) {
    kind = "error";
    message = describeTxError(error, t);
  } else if (signing) {
    kind = "pending";
    message = t("confirmInWallet");
  } else if (hash && confirming) {
    kind = "pending";
    message = t("waitingConfirmation");
  } else if (success) {
    kind = "success";
    message = successMessage;
  }

  if (!kind) return null;

  const explorer = TARGET_CHAIN.blockExplorers.default.url;

  return (
    <div className={`status ${kind}`} role="status">
      <span>{message}</span>
      {hash && (
        <a href={`${explorer}/tx/${hash}`} target="_blank" rel="noreferrer">
          {t("viewOnExplorer")}
        </a>
      )}
    </div>
  );
}
