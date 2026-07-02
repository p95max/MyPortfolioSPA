import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  ANALYTICS_SESSION_STORAGE_KEY,
  ANALYTICS_SOURCE_STORAGE_KEY,
  ANALYTICS_STORAGE_KEY,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
} from '../privacy';
import { getStoredCookieConsent } from '../cookieConsent';
import { CookieConsent } from './CookieConsent';

describe('CookieConsent', () => {
  it('shows preferences when consent has not been stored yet', async () => {
    render(<CookieConsent />);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /cookie preferences/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/analytics/i)).toBeChecked();
  });

  it('stores an analytics-enabled consent when accepting all', async () => {
    const user = userEvent.setup();
    const consentListener = vi.fn((event: Event) => event);

    window.addEventListener('cookie-consent-updated', consentListener);

    render(<CookieConsent />);

    await user.click(await screen.findByRole('button', { name: /accept all/i }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(getStoredCookieConsent()).toMatchObject({
      necessary: true,
      analytics: true,
      version: CONSENT_VERSION,
    });
    expect(consentListener).toHaveBeenCalledTimes(1);

    window.removeEventListener('cookie-consent-updated', consentListener);
  });

  it('rejects optional analytics and clears analytics storage', async () => {
    const user = userEvent.setup();

    localStorage.setItem(ANALYTICS_STORAGE_KEY, 'anonymous-id');
    sessionStorage.setItem(ANALYTICS_SESSION_STORAGE_KEY, 'session-id');
    sessionStorage.setItem(ANALYTICS_SOURCE_STORAGE_KEY, 'source-context');

    render(<CookieConsent />);

    await user.click(
      await screen.findByRole('button', { name: /reject optional/i })
    );

    expect(getStoredCookieConsent()).toMatchObject({
      necessary: true,
      analytics: false,
      version: CONSENT_VERSION,
    });
    expect(localStorage.getItem(ANALYTICS_STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem(ANALYTICS_SESSION_STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem(ANALYTICS_SOURCE_STORAGE_KEY)).toBeNull();
  });

  it('ignores stale stored consent versions', () => {
    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        necessary: true,
        analytics: true,
        version: CONSENT_VERSION - 1,
        updatedAt: new Date().toISOString(),
      })
    );

    expect(getStoredCookieConsent()).toBeNull();
  });
});
