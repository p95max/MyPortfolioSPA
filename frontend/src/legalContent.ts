import { useEffect, useState } from "react";
import { getApiUrl } from "./apiBaseUrl";

export type LegalContent = {
  impressum_html: string;
  privacy_html: string;
  responsible_name?: string;
  responsible_address?: string;
  responsible_email?: string;
  cookie_eyebrow_en: string;
  cookie_title_en: string;
  cookie_text_en: string;
  cookie_necessary_en: string;
  cookie_necessary_text_en: string;
  cookie_analytics_en: string;
  cookie_analytics_text_en: string;
  cookie_reject_en: string;
  cookie_save_en: string;
  cookie_accept_en: string;
  cookie_eyebrow_de: string;
  cookie_title_de: string;
  cookie_text_de: string;
  cookie_necessary_de: string;
  cookie_necessary_text_de: string;
  cookie_analytics_de: string;
  cookie_analytics_text_de: string;
  cookie_reject_de: string;
  cookie_save_de: string;
  cookie_accept_de: string;
};

let cachedContent: LegalContent | null = null;
let pendingRequest: Promise<LegalContent | null> | null = null;

function isLegalContent(value: unknown): value is LegalContent {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return typeof record.impressum_html === "string" && typeof record.privacy_html === "string";
}

async function loadLegalContent(): Promise<LegalContent | null> {
  if (cachedContent) return cachedContent;
  if (pendingRequest) return pendingRequest;

  pendingRequest = fetch(getApiUrl("/api/legal-content/"))
    .then(async (response) => {
      if (!response.ok) return null;
      const data: unknown = await response.json();
      if (!isLegalContent(data)) return null;
      cachedContent = data;
      return data;
    })
    .catch(() => null)
    .finally(() => {
      pendingRequest = null;
    });

  return pendingRequest;
}

export function useLegalContent(): LegalContent | null {
  const [content, setContent] = useState<LegalContent | null>(cachedContent);

  useEffect(() => {
    let active = true;
    void loadLegalContent().then((loaded) => {
      if (active && loaded) setContent(loaded);
    });
    return () => {
      active = false;
    };
  }, []);

  return content;
}
