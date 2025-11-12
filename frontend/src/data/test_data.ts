import type { Project } from '../types';

export const testProjects: Project[] = [
  {
    id: '1',
    title: 'ChattyM',
    description: 'Minimal social network demo (Django + DRF). Posts, comments, likes, profiles and a small admin interface — used as a portfolio showcase.',
    techStack: ['#Django', '#DRF', '#Bootstrap5', '#PostgreSQL'],
    githubUrl: 'https://github.com/p95max/ChattyM',
    demoUrl: '',
    screenshots: [
      '/screenshots/chattym1.png',
      '/screenshots/chattym2.png',
      '/screenshots/chattym3.png'
    ]
  },
  {
    id: '2',
    title: 'What2Cook',
    description: 'Lightweight recipe finder built with FastAPI and async SQLAlchemy — enter ingredients and get matching recipes.',
    techStack: ['#FastAPI', '#SQLAlchemy', '#PostgreSQL', '#Jinja2'],
    githubUrl: 'https://github.com/p95max/What2Cook',
    demoUrl: '',
    screenshots: [
      '/screenshots/what2cook1.png',
      '/screenshots/what2cook2.png',
      '/screenshots/what2cook3.png'
    ]
  },
  {
    id: '3',
    title: 'AutoService Book',
    description: 'Car service tracker — record services, fuel, parts and expenses. Demonstrates Django forms, auth, and export utilities.',
    techStack: ['#Django', '#Docker', '#PostgreSQL', '#Bootstrap5'],
    githubUrl: 'https://github.com/p95max/AutoService_Book',
    demoUrl: '',
    screenshots: [
      '/screenshots/as_book1.png',
      '/screenshots/as_book2.png',
      '/screenshots/as_book3.png'
    ]
  }
];
