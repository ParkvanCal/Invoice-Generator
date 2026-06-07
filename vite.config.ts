import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  // Automatically detect if we are building inside GitHub Actions
  // to dynamically set the correct base path for GitHub Pages
  const githubRepoRef = process.env.GITHUB_REPOSITORY;
  let base = './'; // Fallback for local preview & dev to keep assets local
  
  if (githubRepoRef) {
    const parts = githubRepoRef.split('/');
    if (parts.length === 2) {
      const [owner, repo] = parts;
      // If the repo is named 'username.github.io', it deploys to the domain root '/'
      if (repo.toLowerCase() === `${owner.toLowerCase()}.github.io`) {
        base = '/';
      } else {
        // Otherwise, it is a subpath deployment like 'https://username.github.io/repo-name/'
        base = `/${repo}/`;
      }
    }
  }

  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
