import type { Project } from '../types';

export const testProjects: Project[] = [
  {
    id: '1',
    title: 'DemoWallet',
    description: 'A modern MVP for a digital wallet and payment system...',
    techStack: ['#React', '#Django', '#Docker', '#nginx', '#PostgreSQL'],
    githubUrl: 'https://github.com/yourusername/demowallet',
    demoUrl: 'https://demowallet.example.com',
  },
  {
    id: '2',
    title: 'News Portal',
    description: 'A news portal with user authentication and admin panel...',
    techStack: ['#React', '#FastAPI', '#PostgreSQL'],
    githubUrl: 'https://github.com/yourusername/news-portal',
    demoUrl: '',
  },
];