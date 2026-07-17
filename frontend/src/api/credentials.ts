import { getApiUrl } from "../apiBaseUrl";
import type {
  Credential,
  CredentialCategory,
  CredentialType,
} from "../types";

type ApiCredential = {
  id?: unknown;
  title?: unknown;
  issuer?: unknown;
  credential_type?: unknown;
  description?: unknown;
  issued_at?: unknown;
  credential_id?: unknown;
  credential_url?: unknown;
  image_url?: unknown;
  category?: unknown;
  skills?: unknown;
  is_featured?: unknown;
};

type CredentialsApiResponse = ApiCredential[] | {
  results?: unknown;
  credentials?: unknown;
};

export interface GetCredentialsOptions {
  type?: CredentialType;
  featured?: boolean;
  signal?: AbortSignal;
}

const CREDENTIAL_CATEGORIES: ReadonlySet<CredentialCategory> = new Set<CredentialCategory>([
  "backend",
  "python",
  "database",
  "docker",
  "cloud",
  "linux",
  "networking",
  "security",
  "it_fundamentals",
  "other",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function requiredString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized || null;
}

function optionalString(value: unknown): string | undefined {
  return requiredString(value) ?? undefined;
}

function getResponseItems(value: unknown): ApiCredential[] {
  const response = value as CredentialsApiResponse;

  if (Array.isArray(response)) {
    return response.filter(isRecord) as ApiCredential[];
  }

  if (!isRecord(response)) {
    return [];
  }

  const items = Array.isArray(response.results)
    ? response.results
    : Array.isArray(response.credentials)
      ? response.credentials
      : [];

  return items.filter(isRecord) as ApiCredential[];
}

function normalizeSkills(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((skill): skill is string => typeof skill === "string")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function isCredentialType(value: unknown): value is CredentialType {
  return value === "certificate" || value === "badge";
}

function normalizeCategory(value: unknown): CredentialCategory {
  return typeof value === "string" && CREDENTIAL_CATEGORIES.has(value as CredentialCategory)
    ? value as CredentialCategory
    : "other";
}

export function normalizeCredential(value: unknown): Credential | null {
  if (!isRecord(value)) {
    return null;
  }

  const raw = value as ApiCredential;
  const title = requiredString(raw.title);
  const issuer = requiredString(raw.issuer);
  const imageUrl = requiredString(raw.image_url);
  const issuedAt = requiredString(raw.issued_at);

  if (
    (typeof raw.id !== "string" && typeof raw.id !== "number") ||
    !title ||
    !issuer ||
    !imageUrl ||
    !issuedAt ||
    !isCredentialType(raw.credential_type)
  ) {
    return null;
  }

  return {
    id: String(raw.id),
    title,
    issuer,
    credentialType: raw.credential_type,
    description: optionalString(raw.description),
    issuedAt,
    credentialId: optionalString(raw.credential_id),
    credentialUrl: optionalString(raw.credential_url),
    imageUrl,
    category: normalizeCategory(raw.category),
    skills: normalizeSkills(raw.skills),
    isFeatured: raw.is_featured === true,
  };
}

export async function getCredentials(
  options: GetCredentialsOptions = {},
): Promise<Credential[]> {
  const query = new URLSearchParams();

  if (options.type) {
    query.set("type", options.type);
  }

  if (options.featured) {
    query.set("featured", "true");
  }

  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  const response = await fetch(getApiUrl(`/api/credentials/${suffix}`), {
    signal: options.signal,
  });

  if (!response.ok) {
    throw new Error(`Unable to load credentials (HTTP ${response.status}).`);
  }

  const data: unknown = await response.json();

  return getResponseItems(data)
    .map(normalizeCredential)
    .filter((credential): credential is Credential => credential !== null);
}
