import { formatUnits, isAddressEqual, type Address } from "viem";
import { TARGET_CHAIN } from "../constants";
import { useI18n } from "../i18n";
import { shorten, trimDecimals } from "../lib/format";
import type { TransferEvent } from "../types";

type Props = {
  events: TransferEvent[];
  account: Address;
  symbol: string;
  decimals: number;
};

export function TransferFeed({ events, account, symbol, decimals }: Props) {
  const { t } = useI18n();
  const explorer = TARGET_CHAIN.blockExplorers.default.url;

  return (
    <div className="feed">
      <h3>
        <span className="live-dot" aria-hidden="true" />
        {t("eventsTitle")}
      </h3>
      <p className="hint">{t("eventsHint", { symbol })}</p>

      {events.length === 0 ? (
        <p className="empty">{t("eventsEmpty")}</p>
      ) : (
        <ul>
          {events.map((event) => {
            const outgoing = isAddressEqual(event.from, account);
            const counterparty = outgoing ? event.to : event.from;
            return (
              <li key={event.id} className={outgoing ? "out" : "in"}>
                <span className="dir">{outgoing ? t("eventOut") : t("eventIn")}</span>
                <span className="amount mono" dir="ltr">
                  {outgoing ? "−" : "+"}
                  {trimDecimals(formatUnits(event.value, decimals))} {symbol}
                </span>
                <a
                  className="mono"
                  dir="ltr"
                  href={`${explorer}/tx/${event.hash}`}
                  target="_blank"
                  rel="noreferrer"
                  title={counterparty}
                >
                  {shorten(counterparty)}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
