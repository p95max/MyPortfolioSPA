# Frontend - React SPA

This is the frontend service for the portfolio SPA project, built with React and served by Nginx.

## Features

- React SPA built with Vite
- TypeScript support
- Static files served by Nginx
- Proxy API requests to backend
- Local development toggle for test data

## Development Toggle (Projects.tsx)

Inside the `Projects.tsx` component there is a toggle constant:

```ts
const USE_TEST_DATA = true;
```

- When `USE_TEST_DATA = true`  
  The app will load projects from a **local test data file** (`testProjects`) instead of the backend API.  
  👉 Useful for **local development** when the backend is not running.

- When `USE_TEST_DATA = false`  
  The app will fetch project data from the **backend API**, configured via the environment variable:  

  ```env
  VITE_API_URL=http://localhost:8000
  ```

  👉 This mode is used in **production** or when you want to integrate with the real Django backend.

## Usage

1. Install dependencies:

```bash
npm install
```

2. Run in development mode:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

4. Preview production build locally:

```bash
npm run preview
```

The production build output will be served by **Nginx** in the Docker setup of this project.

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/          # Page components (Home, Projects, Contact)
│   ├── data/           # Test data files
│   ├── types/          # TypeScript type definitions
│   └── App.tsx         # Main application component
├── dist/               # Production build output
├── public/             # Static assets
└── package.json        # Dependencies and scripts
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8000
```

This URL will be used when `USE_TEST_DATA = false` to fetch data from the Django backend.
