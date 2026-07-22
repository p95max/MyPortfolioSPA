import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Language = "en" | "de";

const STORAGE_KEY = "portfolio-language";

const messages = {
  en: {
    nav: { about: "About", projects: "Projects", certificates: "Certificates", contact: "Contact", menu: "Primary navigation", toggle: "Toggle menu", language: "Language" },
    footer: { privacy: "Privacy settings", source: "View source on GitHub" },
    home: { availability: "Open to work · Chemnitz, DE", greeting: "Hi, I'm", role: "Python Backend Developer", description: "I build APIs, integrations, and automation systems. Django, FastAPI, PostgreSQL, Docker — clean architecture, production-ready code, no shortcuts.", projects: "Explore projects", contact: "Contact me" },
    projects: { eyebrow: "Portfolio", title: "Projects", loading: "Loading projects...", filter: "Filter projects by technologies", filterLabel: "Filter projects by technology tags", all: "All", clear: "Clear", noMatches: "No matching projects found.", hint: "Try removing one or more technology filters.", clearFilters: "Clear filters", previous: "Previous", next: "Next", screenshot: "Screenshot {{number}}", openPreview: "Open {{title}} screenshot preview", closePreview: "Close preview", liveDemo: "Live demo" },
    credentials: { eyebrow: "Professional development", title: "Certificates", description: "Professional certificates that reflect my continuing work in backend development, infrastructure, and secure systems.", loading: "Loading credentials...", emptyTitle: "Certificates will be added soon.", emptyText: "Check back for verified professional certificates.", certificate: "Certificate", badge: "Badge", openCertificate: "Open certificate preview", openBadge: "Open badge preview", category: "Credential category and skills", verify: "Verify credential", issuedBy: "Issued by {{issuer}}", previewUnavailable: "Preview unavailable. Use the original link below.", openOriginal: "Open original", closeCredential: "Close credential preview", featuredEyebrow: "Professional certificates", featuredTitle: "Featured certificates", carouselControls: "Certificate carousel controls", previousCertificates: "Previous certificates", nextCertificates: "Next certificates", viewAll: "View all certificates", carousel: "Featured certificates carousel", chooseGroup: "Choose certificate group", showGroup: "Show certificate group {{number}}", group: "Certificate group {{current}} of {{total}}" },
    cookie: { eyebrow: "Privacy settings", title: "Cookie preferences", text: "This website uses necessary storage to remember your cookie choice. Optional analytics are only enabled if you actively accept them.", necessary: "Necessary", necessaryText: "Required for basic website functionality.", analytics: "Analytics", analyticsText: "Helps understand website usage. You can disable it before saving.", reject: "Reject optional", save: "Save settings", accept: "Accept all" },
  },
  de: {
    nav: { about: "Über mich", projects: "Projekte", certificates: "Zertifikate", contact: "Kontakt", menu: "Hauptnavigation", toggle: "Menü öffnen", language: "Sprache" },
    footer: { privacy: "Datenschutzeinstellungen", source: "Quellcode auf GitHub ansehen" },
    home: { availability: "Verfügbar für neue Aufgaben · Chemnitz, DE", greeting: "Hallo, ich bin", role: "Python Backend-Entwickler", description: "Ich entwickle APIs, Integrationen und Automatisierungssysteme. Django, FastAPI, PostgreSQL, Docker — saubere Architektur, produktionsreifer Code, keine Abkürzungen.", projects: "Projekte ansehen", contact: "Kontakt aufnehmen" },
    projects: { eyebrow: "Portfolio", title: "Projekte", loading: "Projekte werden geladen...", filter: "Projekte nach Technologien filtern", filterLabel: "Projekte nach Technologie-Tags filtern", all: "Alle", clear: "Zurücksetzen", noMatches: "Keine passenden Projekte gefunden.", hint: "Entferne einen oder mehrere Technologie-Filter.", clearFilters: "Filter zurücksetzen", previous: "Zurück", next: "Weiter", screenshot: "Screenshot {{number}}", openPreview: "Screenshot-Vorschau für {{title}} öffnen", closePreview: "Vorschau schließen", liveDemo: "Live-Demo" },
    credentials: { eyebrow: "Berufliche Weiterbildung", title: "Zertifikate", description: "Berufliche Zertifikate, die meine kontinuierliche Arbeit in Backend-Entwicklung, Infrastruktur und sicheren Systemen zeigen.", loading: "Zertifikate werden geladen...", emptyTitle: "Zertifikate werden bald hinzugefügt.", emptyText: "Schau später für verifizierte berufliche Zertifikate wieder vorbei.", certificate: "Zertifikat", badge: "Abzeichen", openCertificate: "Zertifikatsvorschau öffnen", openBadge: "Abzeichenvorschau öffnen", category: "Zertifikatskategorie und Fähigkeiten", verify: "Zertifikat prüfen", issuedBy: "Ausgestellt von {{issuer}}", previewUnavailable: "Vorschau nicht verfügbar. Verwende den Original-Link unten.", openOriginal: "Original öffnen", closeCredential: "Zertifikatsvorschau schließen", featuredEyebrow: "Berufliche Zertifikate", featuredTitle: "Ausgewählte Zertifikate", carouselControls: "Steuerung für Zertifikatskarussell", previousCertificates: "Vorherige Zertifikate", nextCertificates: "Nächste Zertifikate", viewAll: "Alle Zertifikate", carousel: "Karussell mit ausgewählten Zertifikaten", chooseGroup: "Zertifikatsgruppe auswählen", showGroup: "Zertifikatsgruppe {{number}} anzeigen", group: "Zertifikatsgruppe {{current}} von {{total}}" },
    cookie: { eyebrow: "Datenschutzeinstellungen", title: "Cookie-Einstellungen", text: "Diese Website verwendet erforderliche Speicherungen, um deine Cookie-Auswahl zu speichern. Optionale Analysen werden nur aktiviert, wenn du ihnen ausdrücklich zustimmst.", necessary: "Erforderlich", necessaryText: "Für die grundlegende Funktion der Website erforderlich.", analytics: "Analyse", analyticsText: "Hilft, die Nutzung der Website zu verstehen. Du kannst sie vor dem Speichern deaktivieren.", reject: "Optionale ablehnen", save: "Einstellungen speichern", accept: "Alle akzeptieren" },
  },
} as const;

type MessageKey = string;
type I18nContextValue = { language: Language; setLanguage: (language: Language) => void; t: (key: MessageKey, values?: Record<string, string | number>) => string };
const I18nContext = createContext<I18nContextValue | null>(null);

function getInitialLanguage(): Language {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "en" || saved === "de") return saved;
  return navigator.language.toLowerCase().startsWith("de") ? "de" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, language); document.documentElement.lang = language; }, [language]);
  const value = useMemo(() => ({ language, setLanguage, t: (key: string, values: Record<string, string | number> = {}) => {
    const translated = key.split(".").reduce<unknown>((part, item) => item && typeof item === "object" ? (item as Record<string, unknown>)[part] : undefined, messages[language]);
    return typeof translated === "string" ? translated.replace(/{{(\w+)}}/g, (_, name: string) => String(values[name] ?? "")) : key;
  } }), [language]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useTranslation must be used inside I18nProvider");
  return context;
}
