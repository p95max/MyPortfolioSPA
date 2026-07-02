import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { trackContactSubmit } from '../analytics';
import Contact from './Contact';

vi.mock('../analytics', () => ({
  trackContactSubmit: vi.fn(),
  trackOutboundLinkClick: vi.fn(),
}));

function submitForm(container: HTMLElement): void {
  const form = container.querySelector('form');

  if (!form) {
    throw new Error('Contact form was not rendered.');
  }

  fireEvent.submit(form);
}

function installTurnstileMock(token = 'captcha-token'): void {
  window.turnstile = {
    render: vi.fn((_element, options) => {
      options.callback?.(token);
      return 'widget-id';
    }),
    remove: vi.fn(),
    reset: vi.fn(),
  };
}

describe('Contact', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.test');
  });

  it('shows client-side validation errors for empty required fields', async () => {
    const { container } = render(<Contact />);

    submitForm(container);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /please fix the highlighted fields/i
    );
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/message is required/i)).toBeInTheDocument();
  });

  it('requires captcha configuration before submitting a valid form', async () => {
    const user = userEvent.setup();
    const { container } = render(<Contact />);

    await user.type(screen.getByLabelText(/your name/i), 'Max Petrykin');
    await user.type(screen.getByLabelText(/email address/i), 'max@example.com');
    await user.type(
      screen.getByLabelText(/message/i),
      'This is a valid contact message.'
    );

    submitForm(container);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /captcha is not configured/i
    );
  });

  it('submits normalized data when captcha and API request succeed', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn(),
    });

    vi.stubEnv('VITE_TURNSTILE_SITEKEY', 'site-key');
    installTurnstileMock();
    vi.stubGlobal('fetch', fetchMock);

    render(<Contact />);

    await user.type(screen.getByLabelText(/your name/i), '  Max Petrykin  ');
    await user.type(screen.getByLabelText(/email address/i), 'MAX@EXAMPLE.COM');
    await user.type(
      screen.getByLabelText(/message/i),
      '  Please tell me more about the project.  '
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /send message/i })).toBeEnabled();
    });

    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.test/api/contact/',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Max Petrykin',
          email: 'max@example.com',
          message: 'Please tell me more about the project.',
          hp: '',
          cf_turnstile_token: 'captcha-token',
        }),
      })
    );
    expect(trackContactSubmit).toHaveBeenCalledTimes(1);
    expect(await screen.findByText(/message sent/i)).toBeInTheDocument();
  });

  it('renders server field errors returned by the contact API', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({
        email: ['Use a different email address.'],
      }),
    });

    vi.stubEnv('VITE_TURNSTILE_SITEKEY', 'site-key');
    installTurnstileMock();
    vi.stubGlobal('fetch', fetchMock);

    render(<Contact />);

    await user.type(screen.getByLabelText(/your name/i), 'Max Petrykin');
    await user.type(screen.getByLabelText(/email address/i), 'max@example.com');
    await user.type(
      screen.getByLabelText(/message/i),
      'This is a valid contact message.'
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /send message/i })).toBeEnabled();
    });

    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /please fix the highlighted fields/i
    );
    expect(screen.getByText(/use a different email address/i)).toBeInTheDocument();
  });
});
