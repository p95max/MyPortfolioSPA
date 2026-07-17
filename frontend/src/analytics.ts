import { getStoredCookieConsent } from "./cookieConsent";
import {
  ANALYTICS_SESSION_STORAGE_KEY,
  ANALYTICS_SOURCE_STORAGE_KEY,
  ANALYTICS_STORAGE_KEY,
} from "./privacy";
import { getApiUrl } from "./apiBaseUrl";
import type { Credential } from "./types";

type AnalyticsEventType =
  | "page_view"
  | "project_view"
  | "project_github_click"
  | "contact_submit"
  | "outbound_link_click"
  | "credential_view"
  | "credential_link_click";

type AnalyticsMetadata = Record<string, string | number | boolean | null>;

type SourceContext = {
  source_type: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
};

type AnalyticsPayload = {
  event_type: AnalyticsEventType;
  path: string;
  referrer: string;
  language: string;
  source_type: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  os: string;
  browser: string;
  device_type: string;
  anonymous_id: string;
  session_id: string;
  metadata: AnalyticsMetadata;
};

function analyticsAllowed(): boolean {
  return getStoredCookieConsent()?.analytics === true;
}

function createAnonymousId(): string {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getAnonymousId(): string {
  try {
    const existingId = localStorage.getItem(ANALYTICS_STORAGE_KEY);

    if (existingId) {
      return existingId;
    }

    const newId = createAnonymousId();
    localStorage.setItem(ANALYTICS_STORAGE_KEY, newId);

    return newId;
  } catch {
    return createAnonymousId();
  }
}

function getSessionId(): string {
  try {
    const existingId = sessionStorage.getItem(ANALYTICS_SESSION_STORAGE_KEY);

    if (existingId) {
      return existingId;
    }

    const newId = createAnonymousId();
    sessionStorage.setItem(ANALYTICS_SESSION_STORAGE_KEY, newId);

    return newId;
  } catch {
    return createAnonymousId();
  }
}

function getOperatingSystem(): string {
  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes("windows")) {
    return "Windows";
  }

  if (userAgent.includes("android")) {
    return "Android";
  }

  if (
    userAgent.includes("iphone") ||
    userAgent.includes("ipad") ||
    userAgent.includes("ipod")
  ) {
    return "iOS";
  }

  if (userAgent.includes("mac os") || userAgent.includes("macintosh")) {
    return "macOS";
  }

  if (userAgent.includes("linux")) {
    return "Linux";
  }

  return "Unknown";
}

function getBrowser(): string {
  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes("edg/")) {
    return "Edge";
  }

  if (userAgent.includes("firefox/")) {
    return "Firefox";
  }

  if (userAgent.includes("chrome/") && !userAgent.includes("edg/")) {
    return "Chrome";
  }

  if (userAgent.includes("safari/") && !userAgent.includes("chrome/")) {
    return "Safari";
  }

  return "Unknown";
}

function getDeviceType(): string {
  const userAgent = navigator.userAgent.toLowerCase();
  const width = window.innerWidth || 0;

  if (/ipad|tablet/.test(userAgent)) {
    return "tablet";
  }

  if (/mobile|iphone|ipod|android/.test(userAgent)) {
    return "mobile";
  }

  if (width > 0 && width < 768) {
    return "mobile";
  }

  if (width >= 768 && width < 1024) {
    return "tablet";
  }

  return "desktop";
}

function getQueryParam(name: string): string {
  return new URLSearchParams(window.location.search).get(name)?.trim() ?? "";
}

function normalizeSourceType(value: string): string {
  const source = value.toLowerCase();

  if (!source) {
    return "";
  }

  if (source.includes("linkedin")) {
    return "linkedin";
  }

  if (source.includes("github")) {
    return "github";
  }

  if (
    source.includes("google") ||
    source.includes("bing") ||
    source.includes("duckduckgo")
  ) {
    return "search";
  }

  if (
    source.includes("facebook") ||
    source.includes("instagram") ||
    source.includes("telegram") ||
    source.includes("x.com") ||
    source.includes("twitter")
  ) {
    return "social";
  }

  return "referral";
}

function getReferrerHost(): string {
  if (!document.referrer) {
    return "";
  }

  try {
    const referrerUrl = new URL(document.referrer);

    if (referrerUrl.origin === window.location.origin) {
      return "";
    }

    return referrerUrl.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function getExternalReferrer(): string {
  if (!document.referrer) {
    return "";
  }

  try {
    const referrerUrl = new URL(document.referrer);

    if (referrerUrl.origin === window.location.origin) {
      return "";
    }

    return document.referrer;
  } catch {
    return "";
  }
}

function createSourceContext(): SourceContext {
  const utmSource = getQueryParam("utm_source");
  const utmMedium = getQueryParam("utm_medium");
  const utmCampaign = getQueryParam("utm_campaign");
  const referrerHost = getReferrerHost();

  let sourceType = normalizeSourceType(utmSource);

  if (!sourceType && referrerHost) {
    sourceType = normalizeSourceType(referrerHost);
  }

  if (!sourceType) {
    sourceType = referrerHost ? "referral" : "direct";
  }

  return {
    source_type: sourceType || "unknown",
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
  };
}

function getSourceContext(): SourceContext {
  try {
    const existing = sessionStorage.getItem(ANALYTICS_SOURCE_STORAGE_KEY);

    if (existing) {
      return JSON.parse(existing) as SourceContext;
    }

    const sourceContext = createSourceContext();

    sessionStorage.setItem(
      ANALYTICS_SOURCE_STORAGE_KEY,
      JSON.stringify(sourceContext)
    );

    return sourceContext;
  } catch {
    return createSourceContext();
  }
}

function getUrlHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function cleanPath(path: string): string {
  try {
    const url = new URL(path, window.location.origin);
    return url.pathname || "/";
  } catch {
    return path.split("?")[0] || "/";
  }
}

export function trackAnalyticsEvent(
  eventType: AnalyticsEventType,
  path: string,
  metadata: AnalyticsMetadata = {}
): void {
  if (!analyticsAllowed()) {
    return;
  }

  const sourceContext = getSourceContext();

  const payload: AnalyticsPayload = {
    event_type: eventType,
    path: cleanPath(path),
    referrer: getExternalReferrer(),
    language: navigator.language || "",
    source_type: sourceContext.source_type,
    utm_source: sourceContext.utm_source,
    utm_medium: sourceContext.utm_medium,
    utm_campaign: sourceContext.utm_campaign,
    os: getOperatingSystem(),
    browser: getBrowser(),
    device_type: getDeviceType(),
    anonymous_id: getAnonymousId(),
    session_id: getSessionId(),
    metadata,
  };

  fetch(getApiUrl("/api/analytics/"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    // Analytics must never break UX.
  });
}

export function trackPageView(path: string): void {
  trackAnalyticsEvent("page_view", path);
}

export function trackProjectView(projectId: string, projectTitle: string): void {
  trackAnalyticsEvent("project_view", window.location.pathname, {
    project_id: projectId,
    project_title: projectTitle,
  });
}

export function trackProjectGithubClick(
  projectId: string,
  projectTitle: string,
  url: string
): void {
  trackAnalyticsEvent("project_github_click", window.location.pathname, {
    project_id: projectId,
    project_title: projectTitle,
    target: "project_github",
    url_host: getUrlHost(url),
  });
}

export function trackContactSubmit(): void {
  trackAnalyticsEvent("contact_submit", window.location.pathname, {
    target: "contact_form",
  });
}

export function trackOutboundLinkClick(target: string, url: string): void {
  trackAnalyticsEvent("outbound_link_click", window.location.pathname, {
    target,
    url_host: getUrlHost(url),
  });
}

function getCredentialMetadata(
  credential: Credential,
  target: "preview" | "original" | "verification_url",
  url = "",
): AnalyticsMetadata {
  return {
    credential_id: credential.id,
    credential_title: credential.title,
    credential_type: credential.credentialType,
    issuer: credential.issuer,
    target,
    url_host: getUrlHost(url),
  };
}

export function trackCredentialView(credential: Credential): void {
  trackAnalyticsEvent(
    "credential_view",
    window.location.pathname,
    getCredentialMetadata(credential, "preview", credential.imageUrl),
  );
}

export function trackCredentialLinkClick(
  credential: Credential,
  target: "original" | "verification_url",
  url: string,
): void {
  trackAnalyticsEvent(
    "credential_link_click",
    window.location.pathname,
    getCredentialMetadata(credential, target, url),
  );
}
