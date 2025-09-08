import type { Project } from '../types';

export const projects: Project[] = [
  {
    id: '1',
    title: 'My Portfolio SPA',
    description: 'A simple React SPA to showcase my projects.',
    techStack: ['React', 'TypeScript', 'Vite', 'CSS'],
    githubUrl: 'https://github.com/yourusername/portfolio',
    demoUrl: 'https://yourdomain.com',
  },
  {
    id: '2',
    title: 'Blog Platform',
    description: 'A full-stack blog platform with Django backend.',
    techStack: ['Django', 'React', 'PostgreSQL'],
    githubUrl: 'https://github.com/yourusername/blog-platform',
  },
  // Добавь свои проекты
];