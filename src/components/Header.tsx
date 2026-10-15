import { useI18n, type Lang } from "../i18n";

const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "fa", label: "فا" },
];

export function Header() {
  const { t, lang, setLang } = useI18n();

  return (
    <header className="header">
      <div>
        <h1>{t("appTitle")}</h1>
        <span className="badge">{t("testnetBadge")}</span>
      </div>
      <div className="lang-switch" role="group" aria-label={t("language")}>
        {LANGS.map(({ code, label }) => (
          <button
            key={code}
            type="button"
            className={code === lang ? "active" : ""}
            aria-pressed={code === lang}
            onClick={() => setLang(code)}
          >
            {label}
          </button>
        ))}
      </div>
    </header>
  );
}
