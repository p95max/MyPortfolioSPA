import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Language = "en" | "de";
const STORAGE_KEY = "portfolio-language";

const messages = {
  en: {
    nav: { about: "About", projects: "Projects", certificates: "Certificates", contact: "Contact", menu: "Primary navigation", toggle: "Toggle menu", language: "Language", lightTheme: "Switch to light theme", darkTheme: "Switch to dark theme" },
    footer: { legalNotice: "Legal Notice", privacyPolicy: "Privacy Policy", privacy: "Privacy settings", source: "View source on GitHub" },
    home: { availability: "Open to work · Chemnitz, DE", greeting: "Hi, I'm", role: "Python Backend Developer", description: "I build APIs, integrations, and automation systems. Django, FastAPI, PostgreSQL, Docker — clean architecture, production-ready code, no shortcuts.", projects: "Explore projects", contact: "Contact me" },
    projects: { eyebrow: "Portfolio", title: "Projects", loading: "Loading projects...", filter: "Filter projects by technologies", filterLabel: "Filter projects by technology tags", all: "All", clear: "Clear", noMatches: "No matching projects found.", hint: "Try removing one or more technology filters.", clearFilters: "Clear filters" },
    credentials: { eyebrow: "Professional development", title: "Certificates", description: "Professional certificates that reflect my continuing work in backend development, infrastructure, and secure systems.", loading: "Loading credentials...", emptyTitle: "Certificates will be added soon.", emptyText: "Check back for verified professional certificates.", featuredEyebrow: "Professional certificates", featuredTitle: "Featured certificates", carouselControls: "Certificate carousel controls", previous: "Previous certificates", next: "Next certificates", viewAll: "View all certificates", carousel: "Featured certificates carousel", chooseGroup: "Choose certificate group", showGroup: "Show certificate group {{number}}", group: "Certificate group {{current}} of {{total}}", slide: "{{current}} of {{total}}" },
    cookie: { eyebrow: "Privacy settings", title: "Cookie preferences", text: "This website uses necessary storage to remember your cookie choice. Optional analytics are only enabled if you actively accept them.", necessary: "Necessary", necessaryText: "Required for basic website functionality.", analytics: "Analytics", analyticsText: "Helps understand website usage. You can disable it before saving.", reject: "Reject optional", save: "Save settings", accept: "Accept all" },
    contact: { eyebrow: "Get in touch", title: "Let's talk", intro: "Have a project, role, or question? Drop me a message.", sendTitle: "Send a message", required: "All fields are required.", name: "Your name", email: "Email address", message: "Message", send: "Send message", sending: "Sending...", successTitle: "Message sent.", successText: "I'll get back to you soon.", home: "Back to Home", other: "Also reachable", privacy: "Privacy Policy", contactWays: "Other ways to contact", captchaFailed: "Captcha failed to load. Please refresh the page.", fixFields: "Please fix the highlighted fields.", captchaMissing: "Captcha is not configured.", captchaRequired: "Please complete the captcha.", captchaInvalid: "Captcha verification failed. Please try again.", tooMany: "Too many attempts. Please try again later.", fallback: "Something went wrong", nameRequired: "Name is required.", nameMin: "Name must be at least 2 characters.", nameMax: "Name must be at most 80 characters.", emailRequired: "Email is required.", emailInvalid: "Please provide a valid email address.", messageRequired: "Message is required.", messageMin: "Message must be at least 10 characters.", messageMax: "Message must be at most 1000 characters." },
  },
  de: {
    nav: { about: "Über mich", projects: "Projekte", certificates: "Zertifikate", contact: "Kontakt", menu: "Hauptnavigation", toggle: "Menü öffnen", language: "Sprache", lightTheme: "Zu hellem Design wechseln", darkTheme: "Zu dunklem Design wechseln" },
    footer: { legalNotice: "Impressum", privacyPolicy: "Datenschutz", privacy: "Datenschutzeinstellungen", source: "Quellcode auf GitHub ansehen" },
    home: { availability: "Verfügbar für neue Aufgaben · Chemnitz, DE", greeting: "Hallo, ich bin", role: "Python Backend-Entwickler", description: "Ich entwickle APIs, Integrationen und Automatisierungssysteme. Django, FastAPI, PostgreSQL, Docker — saubere Architektur, produktionsreifer Code, keine Abkürzungen.", projects: "Projekte ansehen", contact: "Kontakt aufnehmen" },
    projects: { eyebrow: "Portfolio", title: "Projekte", loading: "Projekte werden geladen...", filter: "Projekte nach Technologien filtern", filterLabel: "Projekte nach Technologie-Tags filtern", all: "Alle", clear: "Zurücksetzen", noMatches: "Keine passenden Projekte gefunden.", hint: "Zum Anzeigen weiterer Projekte einen oder mehrere Technologie-Filter entfernen.", clearFilters: "Filter zurücksetzen" },
    credentials: { eyebrow: "Berufliche Weiterbildung", title: "Zertifikate", description: "Berufliche Zertifikate, die meine kontinuierliche Arbeit in Backend-Entwicklung, Infrastruktur und sicheren Systemen zeigen.", loading: "Zertifikate werden geladen...", emptyTitle: "Zertifikate werden bald hinzugefügt.", emptyText: "Weitere verifizierte berufliche Zertifikate folgen in Kürze.", featuredEyebrow: "Berufliche Zertifikate", featuredTitle: "Ausgewählte Zertifikate", carouselControls: "Steuerung für Zertifikatskarussell", previous: "Vorherige Zertifikate", next: "Nächste Zertifikate", viewAll: "Alle Zertifikate", carousel: "Karussell mit ausgewählten Zertifikaten", chooseGroup: "Zertifikatsgruppe auswählen", showGroup: "Zertifikatsgruppe {{number}} anzeigen", group: "Zertifikatsgruppe {{current}} von {{total}}", slide: "{{current}} von {{total}}" },
    cookie: { eyebrow: "Datenschutzeinstellungen", title: "Cookie-Einstellungen", text: "Diese Website verwendet erforderliche Speicherungen, um die Cookie-Auswahl zu speichern. Optionale Analysen werden nur nach ausdrücklicher Zustimmung aktiviert.", necessary: "Erforderlich", necessaryText: "Für die grundlegende Funktion der Website erforderlich.", analytics: "Analyse", analyticsText: "Hilft, die Nutzung der Website zu verstehen. Die Analyse lässt sich vor dem Speichern deaktivieren.", reject: "Optionale ablehnen", save: "Einstellungen speichern", accept: "Alle akzeptieren" },
    contact: { eyebrow: "Kontakt", title: "Kontakt aufnehmen", intro: "Ob Projekt, Position oder Frage – eine Nachricht ist jederzeit willkommen.", sendTitle: "Nachricht senden", required: "Alle Felder sind erforderlich.", name: "Name", email: "E-Mail-Adresse", message: "Nachricht", send: "Nachricht senden", sending: "Wird gesendet...", successTitle: "Nachricht gesendet.", successText: "Eine Rückmeldung erfolgt in Kürze.", home: "Zur Startseite", other: "Weitere Kontaktwege", privacy: "Datenschutzerklärung", contactWays: "Weitere Kontaktmöglichkeiten", captchaFailed: "Captcha konnte nicht geladen werden. Die Seite bitte neu laden.", fixFields: "Die markierten Felder bitte prüfen.", captchaMissing: "Captcha ist nicht konfiguriert.", captchaRequired: "Der Abschluss des Captchas ist erforderlich.", captchaInvalid: "Captcha-Prüfung fehlgeschlagen. Bitte erneut versuchen.", tooMany: "Zu viele Versuche. Bitte später erneut versuchen.", fallback: "Etwas ist schiefgelaufen", nameRequired: "Name ist erforderlich.", nameMin: "Der Name muss mindestens 2 Zeichen lang sein.", nameMax: "Der Name darf maximal 80 Zeichen lang sein.", emailRequired: "E-Mail-Adresse ist erforderlich.", emailInvalid: "Eine gültige E-Mail-Adresse eingeben.", messageRequired: "Nachricht ist erforderlich.", messageMin: "Die Nachricht muss mindestens 10 Zeichen lang sein.", messageMax: "Die Nachricht darf maximal 1000 Zeichen lang sein." },
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

// eslint-disable-next-line react-refresh/only-export-components
export function useTranslation() {
  const context = useContext(I18nContext);
  return context ?? { language: "en", setLanguage: () => undefined, t: (key: string, values?: Record<string, string | number>) => translate("en", key, values) };
}
