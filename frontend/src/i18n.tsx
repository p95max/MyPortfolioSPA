import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Language = "en" | "de";
const STORAGE_KEY = "portfolio-language";

const messages = {
  en: {
    nav: { about: "About", projects: "Projects", certificates: "Certificates", contact: "Contact", menu: "Primary navigation", toggle: "Toggle menu", language: "Language" },
    footer: { legalNotice: "Legal Notice", privacyPolicy: "Privacy Policy", privacy: "Privacy settings", source: "View source on GitHub" },
    home: { availability: "Open to work \u00b7 Chemnitz, DE", greeting: "Hi, I'm", role: "Python Backend Developer", description: "I build APIs, integrations, and automation systems. Django, FastAPI, PostgreSQL, Docker \u2014 clean architecture, production-ready code, no shortcuts.", projects: "Explore projects", contact: "Contact me" },
    projects: { eyebrow: "Portfolio", title: "Projects", loading: "Loading projects...", filter: "Filter projects by technologies", filterLabel: "Filter projects by technology tags", all: "All", clear: "Clear", noMatches: "No matching projects found.", hint: "Try removing one or more technology filters.", clearFilters: "Clear filters" },
    credentials: { eyebrow: "Professional development", title: "Certificates", description: "Professional certificates that reflect my continuing work in backend development, infrastructure, and secure systems.", loading: "Loading credentials...", emptyTitle: "Certificates will be added soon.", emptyText: "Check back for verified professional certificates.", featuredEyebrow: "Professional certificates", featuredTitle: "Featured certificates", carouselControls: "Certificate carousel controls", previous: "Previous certificates", next: "Next certificates", viewAll: "View all certificates", carousel: "Featured certificates carousel", chooseGroup: "Choose certificate group", showGroup: "Show certificate group {{number}}", group: "Certificate group {{current}} of {{total}}", slide: "{{current}} of {{total}}" },
    cookie: { eyebrow: "Privacy settings", title: "Cookie preferences", text: "This website uses necessary storage to remember your cookie choice. Optional analytics are only enabled if you actively accept them.", necessary: "Necessary", necessaryText: "Required for basic website functionality.", analytics: "Analytics", analyticsText: "Helps understand website usage. You can disable it before saving.", reject: "Reject optional", save: "Save settings", accept: "Accept all" },
    contact: { eyebrow: "Get in touch", title: "Let's talk", intro: "Have a project, role, or question? Drop me a message.", sendTitle: "Send a message", required: "All fields are required.", name: "Your name", email: "Email address", message: "Message", send: "Send message", sending: "Sending...", successTitle: "Message sent.", successText: "I'll get back to you soon.", home: "Back to Home", other: "Also reachable", privacy: "Privacy Policy", contactWays: "Other ways to contact", captchaFailed: "Captcha failed to load. Please refresh the page.", fixFields: "Please fix the highlighted fields.", captchaMissing: "Captcha is not configured.", captchaRequired: "Please complete the captcha.", captchaInvalid: "Captcha verification failed. Please try again.", tooMany: "Too many attempts. Please try again later.", fallback: "Something went wrong", nameRequired: "Name is required.", nameMin: "Name must be at least 2 characters.", nameMax: "Name must be at most 80 characters.", emailRequired: "Email is required.", emailInvalid: "Please provide a valid email address.", messageRequired: "Message is required.", messageMin: "Message must be at least 10 characters.", messageMax: "Message must be at most 1000 characters." },
  },
  de: {
    nav: { about: "\u00dcber mich", projects: "Projekte", certificates: "Zertifikate", contact: "Kontakt", menu: "Hauptnavigation", toggle: "Men\u00fc \u00f6ffnen", language: "Sprache" },
    footer: { legalNotice: "Impressum", privacyPolicy: "Datenschutz", privacy: "Datenschutzeinstellungen", source: "Quellcode auf GitHub ansehen" },
    home: { availability: "Verf\u00fcgbar f\u00fcr neue Aufgaben \u00b7 Chemnitz, DE", greeting: "Hallo, ich bin", role: "Python Backend-Entwickler", description: "Ich entwickle APIs, Integrationen und Automatisierungssysteme. Django, FastAPI, PostgreSQL, Docker \u2014 saubere Architektur, produktionsreifer Code, keine Abk\u00fcrzungen.", projects: "Projekte ansehen", contact: "Kontakt aufnehmen" },
    projects: { eyebrow: "Portfolio", title: "Projekte", loading: "Projekte werden geladen...", filter: "Projekte nach Technologien filtern", filterLabel: "Projekte nach Technologie-Tags filtern", all: "Alle", clear: "Zur\u00fccksetzen", noMatches: "Keine passenden Projekte gefunden.", hint: "Entferne einen oder mehrere Technologie-Filter.", clearFilters: "Filter zur\u00fccksetzen" },
    credentials: { eyebrow: "Berufliche Weiterbildung", title: "Zertifikate", description: "Berufliche Zertifikate, die meine kontinuierliche Arbeit in Backend-Entwicklung, Infrastruktur und sicheren Systemen zeigen.", loading: "Zertifikate werden geladen...", emptyTitle: "Zertifikate werden bald hinzugef\u00fcgt.", emptyText: "Schau sp\u00e4ter f\u00fcr verifizierte berufliche Zertifikate wieder vorbei.", featuredEyebrow: "Berufliche Zertifikate", featuredTitle: "Ausgew\u00e4hlte Zertifikate", carouselControls: "Steuerung f\u00fcr Zertifikatskarussell", previous: "Vorherige Zertifikate", next: "N\u00e4chste Zertifikate", viewAll: "Alle Zertifikate", carousel: "Karussell mit ausgew\u00e4hlten Zertifikaten", chooseGroup: "Zertifikatsgruppe ausw\u00e4hlen", showGroup: "Zertifikatsgruppe {{number}} anzeigen", group: "Zertifikatsgruppe {{current}} von {{total}}", slide: "{{current}} von {{total}}" },
    cookie: { eyebrow: "Datenschutzeinstellungen", title: "Cookie-Einstellungen", text: "Diese Website verwendet erforderliche Speicherungen, um deine Cookie-Auswahl zu speichern. Optionale Analysen werden nur aktiviert, wenn du ihnen ausdr\u00fccklich zustimmst.", necessary: "Erforderlich", necessaryText: "F\u00fcr die grundlegende Funktion der Website erforderlich.", analytics: "Analyse", analyticsText: "Hilft, die Nutzung der Website zu verstehen. Du kannst sie vor dem Speichern deaktivieren.", reject: "Optionale ablehnen", save: "Einstellungen speichern", accept: "Alle akzeptieren" },
    contact: { eyebrow: "Kontakt", title: "Lass uns sprechen", intro: "Du hast ein Projekt, eine Stelle oder eine Frage? Schreib mir.", sendTitle: "Nachricht senden", required: "Alle Felder sind erforderlich.", name: "Dein Name", email: "E-Mail-Adresse", message: "Nachricht", send: "Nachricht senden", sending: "Wird gesendet...", successTitle: "Nachricht gesendet.", successText: "Ich melde mich bald bei dir.", home: "Zur Startseite", other: "Weitere Kontaktwege", privacy: "Datenschutzerkl\u00e4rung", contactWays: "Weitere Kontaktm\u00f6glichkeiten", captchaFailed: "Captcha konnte nicht geladen werden. Bitte lade die Seite neu.", fixFields: "Bitte korrigiere die markierten Felder.", captchaMissing: "Captcha ist nicht konfiguriert.", captchaRequired: "Bitte schlie\u00dfe das Captcha ab.", captchaInvalid: "Captcha-Pr\u00fcfung fehlgeschlagen. Bitte versuche es erneut.", tooMany: "Zu viele Versuche. Bitte versuche es sp\u00e4ter erneut.", fallback: "Etwas ist schiefgelaufen", nameRequired: "Name ist erforderlich.", nameMin: "Der Name muss mindestens 2 Zeichen lang sein.", nameMax: "Der Name darf maximal 80 Zeichen lang sein.", emailRequired: "E-Mail-Adresse ist erforderlich.", emailInvalid: "Bitte gib eine g\u00fcltige E-Mail-Adresse ein.", messageRequired: "Nachricht ist erforderlich.", messageMin: "Die Nachricht muss mindestens 10 Zeichen lang sein.", messageMax: "Die Nachricht darf maximal 1000 Zeichen lang sein." },
  },
} as const;

type I18nContextValue = { language: Language; setLanguage: (language: Language) => void; t: (key: string, values?: Record<string, string | number>) => string };
const I18nContext = createContext<I18nContextValue | null>(null);

function translate(language: Language, key: string, values: Record<string, string | number> = {}): string {
  const translated = key.split(".").reduce<unknown>((value, part) => value && typeof value === "object" ? (value as Record<string, unknown>)[part] : undefined, messages[language]);
  return typeof translated === "string" ? translated.replace(/{{(\w+)}}/g, (_, name: string) => String(values[name] ?? "")) : key;
}

function getInitialLanguage(): Language {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "en" || saved === "de") return saved;
  return navigator.language.toLowerCase().startsWith("de") ? "de" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, language); document.documentElement.lang = language; }, [language]);
  const value = useMemo(() => ({ language, setLanguage, t: (key: string, values?: Record<string, string | number>) => translate(language, key, values) }), [language]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const context = useContext(I18nContext);
  return context ?? { language: "en", setLanguage: () => undefined, t: (key: string, values?: Record<string, string | number>) => translate("en", key, values) };
}
