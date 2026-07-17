import { useEffect, useState } from "react";
import { getCredentials } from "../api/credentials";
import type { Credential, CredentialType } from "../types";

export interface UseCredentialsOptions {
  type?: CredentialType;
  featured?: boolean;
  enabled?: boolean;
}

export interface UseCredentialsResult {
  credentials: Credential[];
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
}

export function useCredentials(
  options: UseCredentialsOptions = {},
): UseCredentialsResult {
  const { type, featured, enabled = true } = options;
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setCredentials([]);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    setLoading(true);
    setError(null);

    getCredentials({ type, featured, signal: controller.signal })
      .then((items) => {
        if (!controller.signal.aborted) {
          setCredentials(items);
          setLoading(false);
        }
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        const message =
          requestError instanceof Error
            ? requestError.message
            : "Unable to load credentials.";

        setError(message);
        setLoading(false);
      });

    return () => controller.abort();
  }, [enabled, featured, type]);

  return {
    credentials,
    loading,
    error,
    isEmpty: !loading && error === null && credentials.length === 0,
  };
}
