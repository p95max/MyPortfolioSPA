export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  demoUrl?: string;
  screenshots?: string[];
}

export type CredentialType = "certificate" | "badge";

export type CredentialCategory =
  | "backend"
  | "python"
  | "database"
  | "docker"
  | "cloud"
  | "linux"
  | "networking"
  | "security"
  | "it_fundamentals"
  | "other";

export interface Credential {
  id: string;
  title: string;
  issuer: string;
  credentialType: CredentialType;
  description?: string;
  issuedAt: string;
  credentialId?: string;
  credentialUrl?: string;
  imageUrl: string;
  category: CredentialCategory;
  skills: string[];
  isFeatured: boolean;
}
