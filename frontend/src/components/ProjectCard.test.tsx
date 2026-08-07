import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Project } from '../types';
import { trackProjectDemoClick, trackProjectView } from '../analytics';
import { ProjectCard } from './ProjectCard';

vi.mock('../analytics', () => ({
  trackProjectDemoClick: vi.fn(),
  trackProjectGithubClick: vi.fn(),
  trackProjectView: vi.fn(),
}));

const project: Project = {
  id: 'portfolio',
  title: 'Portfolio SPA',
  description: 'A React and Django portfolio.',
  techStack: ['React', 'Django'],
  githubUrl: 'https://github.com/p95max/MyPortfolioSPA',
  demoUrl: 'https://example.com',
  screenshots: ['/screenshots/one.png', '/screenshots/two.png'],
};

describe('ProjectCard', () => {
  it('renders project details and external links', () => {
    render(<ProjectCard project={project} />);

    expect(
      screen.getByRole('heading', { name: /portfolio spa/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/react and django portfolio/i)).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /github/i })).toHaveAttribute(
      'href',
      project.githubUrl
    );
    expect(screen.getByRole('link', { name: /live demo/i })).toHaveAttribute(
      'href',
      project.demoUrl
    );
  });

  it('tracks live demo clicks as a dedicated project event', async () => {
    const user = userEvent.setup();
    render(<ProjectCard project={project} />);

    await user.click(screen.getByRole('link', { name: /live demo/i }));

    expect(trackProjectDemoClick).toHaveBeenCalledWith(
      project.id,
      project.title,
      project.demoUrl
    );
  });

  it('switches gallery screenshots and opens a keyboard-controlled lightbox', async () => {
    const user = userEvent.setup();

    render(<ProjectCard project={project} />);

    expect(
      screen.getByRole('img', { name: /portfolio spa screenshot 1/i })
    ).toHaveAttribute('src', '/screenshots/one.png');

    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(
      screen.getByRole('img', { name: /portfolio spa screenshot 2/i })
    ).toHaveAttribute('src', '/screenshots/two.png');

    await user.click(
      screen.getByRole('button', {
        name: /open portfolio spa screenshot preview/i,
      })
    );

    const dialog = screen.getByRole('dialog', {
      name: /portfolio spa screenshot preview/i,
    });

    expect(trackProjectView).toHaveBeenCalledWith(project.id, project.title);
    expect(
      within(dialog).getByRole('img', {
        name: /portfolio spa screenshot 2/i,
      })
    ).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'ArrowLeft' });

    expect(
      within(dialog).getByRole('img', {
        name: /portfolio spa screenshot 1/i,
      })
    ).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('disables screenshot preview when no screenshot is available', () => {
    render(<ProjectCard project={{ ...project, screenshots: [] }} />);

    expect(
      screen.getByRole('button', {
        name: /open portfolio spa screenshot preview/i,
      })
    ).toBeDisabled();
  });
});
