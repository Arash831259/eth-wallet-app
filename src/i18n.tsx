import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "fa";

const en = {
  appTitle: "Ethereum Wallet",
  testnetBadge: "Sepolia Testnet",
  language: "Language",

  connectIntro:
    "Connect your wallet to view your balance and send test ETH and tokens.",
  connectWith: "Connect {name}",
  connecting: "Connecting…",
  noWallet:
    "No wallet detected. Install a browser wallet such as MetaMask and reload the page.",
  connectFailed: "Could not connect to the wallet.",
  connectRejected: "You rejected the connection request.",
  disconnect: "Disconnect",

  address: "Address",
  network: "Network",
  balance: "ETH balance (Sepolia)",
  wrongNetwork: "Wrong network (chain {id})",
  switchNetwork: "Switch to Sepolia",
  switching: "Switching…",

  sendEthTitle: "Send ETH",
  recipient: "Recipient address",
  recipientPlaceholder: "0x…",
  sendEthButton: "Send {amount} ETH",
  invalidAddress: "That is not a valid Ethereum address.",
  sameAddress: "The recipient must be different from your own address.",
  needSepolia: "Switch to the Sepolia network first.",
  confirmInWallet: "Confirm the transaction in your wallet…",
  waitingConfirmation: "Transaction sent — waiting for confirmation…",
  ethSent: "Sent {amount} ETH successfully.",
  txFailed: "Transaction failed",
  userRejected: "You rejected the transaction.",
  insufficientFunds: "Not enough funds to cover the amount plus the network fee.",
  viewOnExplorer: "View on Etherscan",

  tokenTitle: "ERC-20 token",
  tokenAddress: "Token contract address",
  tokenPresetsLabel: "Presets",
  tokenLoading: "Reading token…",
  tokenInvalid: "Enter a valid token contract address.",
  tokenNotFound: "This address does not look like an ERC-20 token on Sepolia.",
  tokenBalance: "Token balance",
  tokenAmount: "Amount",
  tokenSendButton: "Send {symbol}",
  invalidAmount: "Enter a valid amount greater than zero.",
  insufficientToken: "Amount exceeds your token balance.",
  tokenSent: "Sent {amount} {symbol} successfully.",

  eventsTitle: "Live Transfer events",
  eventsHint: "Listening for {symbol} Transfer events to or from your address.",
  eventsEmpty: "No events yet. Send a transfer, or wait for one to arrive.",
  eventIn: "Received",
  eventOut: "Sent",

  footerNote: "Testnet only. Test tokens have no monetary value.",
};

export type MessageKey = keyof typeof en;

const fa: Record<MessageKey, string> = {
  appTitle: "کیف‌پول اتریوم",
  testnetBadge: "شبکه آزمایشی Sepolia",
  language: "زبان",

  connectIntro:
    "برای دیدن موجودی و ارسال ETH و توکن آزمایشی، کیف‌پول خود را متصل کنید.",
  connectWith: "اتصال با {name}",
  connecting: "در حال اتصال…",
  noWallet:
    "کیف‌پولی پیدا نشد. یک کیف‌پول مرورگر مثل MetaMask نصب کنید و صفحه را دوباره باز کنید.",
  connectFailed: "اتصال به کیف‌پول ناموفق بود.",
  connectRejected: "درخواست اتصال را رد کردید.",
  disconnect: "قطع اتصال",

  address: "آدرس",
  network: "شبکه",
  balance: "موجودی ETH (Sepolia)",
  wrongNetwork: "شبکه نامعتبر (Chain {id})",
  switchNetwork: "تغییر به Sepolia",
  switching: "در حال تغییر…",

  sendEthTitle: "ارسال ETH",
  recipient: "آدرس مقصد",
  recipientPlaceholder: "0x…",
  sendEthButton: "ارسال {amount} ETH",
  invalidAddress: "این آدرس اتریوم معتبر نیست.",
  sameAddress: "آدرس مقصد نباید با آدرس خودتان یکی باشد.",
  needSepolia: "ابتدا به شبکه Sepolia تغییر دهید.",
  confirmInWallet: "تراکنش را در کیف‌پول تأیید کنید…",
  waitingConfirmation: "تراکنش ارسال شد؛ در انتظار تأیید شبکه…",
  ethSent: "{amount} ETH با موفقیت ارسال شد.",
  txFailed: "تراکنش ناموفق بود",
  userRejected: "تراکنش را رد کردید.",
  insufficientFunds: "موجودی برای مبلغ و کارمزد شبکه کافی نیست.",
  viewOnExplorer: "مشاهده در Etherscan",

  tokenTitle: "توکن ERC-20",
  tokenAddress: "آدرس قرارداد توکن",
  tokenPresetsLabel: "پیشنهادها",
  tokenLoading: "در حال خواندن اطلاعات توکن…",
  tokenInvalid: "یک آدرس قرارداد معتبر وارد کنید.",
  tokenNotFound: "این آدرس روی Sepolia شبیه یک توکن ERC-20 نیست.",
  tokenBalance: "موجودی توکن",
  tokenAmount: "مقدار",
  tokenSendButton: "ارسال {symbol}",
  invalidAmount: "یک مقدار معتبر و بزرگ‌تر از صفر وارد کنید.",
  insufficientToken: "مقدار بیشتر از موجودی توکن شماست.",
  tokenSent: "{amount} {symbol} با موفقیت ارسال شد.",

  eventsTitle: "رویدادهای زنده Transfer",
  eventsHint: "در حال گوش دادن به رویدادهای Transfer توکن {symbol} از/به آدرس شما.",
  eventsEmpty: "هنوز رویدادی نیست. یک انتقال انجام دهید یا منتظر دریافت بمانید.",
  eventIn: "دریافت",
  eventOut: "ارسال",

  footerNote: "فقط شبکه آزمایشی؛ توکن‌های تستی ارزش مالی ندارند.",
};

const dictionaries: Record<Lang, Record<MessageKey, string>> = { en, fa };

export type TFunction = (
  key: MessageKey,
  vars?: Record<string, string | number>,
) => string;

type I18nValue = { lang: Lang; setLang: (lang: Lang) => void; t: TFunction };

const I18nContext = createContext<I18nValue | null>(null);

const STORAGE_KEY = "lang";

function readStoredLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "fa") return stored;
  } catch {
    // localStorage can be unavailable (private mode); fall through to default.
  }
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStoredLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback<TFunction>(
    (key, vars) => {
      let text = dictionaries[lang][key];
      if (vars) {
        for (const [name, value] of Object.entries(vars)) {
          text = text.split(`{${name}}`).join(String(value));
        }
      }
      return text;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
