import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Home } from './Home';

vi.mock('../components/FeaturedCredentials', () => ({
  FeaturedCredentials: () => <div data-testid="featured-credentials" />,
}));

const homepageContent = {
  availability_en: 'Available remotely',
  availability_de: 'Remote verfügbar',
  greeting_en: 'Hello, I am',
  greeting_de: 'Hallo, ich bin',
  name: 'Admin Name',
  role_en: 'Backend Engineer',
  role_de: 'Backend-Entwickler',
  description_en: 'Content loaded from the API.',
  description_de: 'Inhalt aus der API.',
  stack: ['Python', 'Django'],
};

describe('Home', () => {
  beforeEach(() => {
    localStorage.setItem('portfolio-language', 'en');
    vi.stubEnv('VITE_API_URL', 'https://api.example.test');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(homepageContent),
      })
    );
  });

  it('renders homepage content returned by the admin API', async () => {
    render(<Home />);

    expect(await screen.findByText('Admin Name')).toBeInTheDocument();
    expect(screen.getByText('Backend Engineer')).toBeInTheDocument();
    expect(screen.getByText('Content loaded from the API.')).toBeInTheDocument();
    expect(screen.getByText('Django')).toBeInTheDocument();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.test/api/homepage-content/'
      );
    });
  });

  it('keeps the existing copy when the API is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    render(<Home />);

    expect(screen.getByText('Python Backend Developer')).toBeInTheDocument();
    expect(screen.getByText('Maksym')).toBeInTheDocument();
  });
});
