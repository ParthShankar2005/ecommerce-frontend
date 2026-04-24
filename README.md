# EcoCart Frontend

Static e-commerce frontend (HTML/CSS/JS) with Firebase auth, service-worker caching, and multi-page routing.

## Prerequisites

1. Set Firebase keys in [scripts/firebase-config.js](./scripts/firebase-config.js).
2. Enable **Email/Password** in Firebase Authentication.

## Deployment Options

### GitHub Pages (Recommended for this repo)

This repo includes an auto-deploy workflow: [deploy-pages.yml](./.github/workflows/deploy-pages.yml).

1. Push to `main`.
2. In GitHub: `Settings -> Pages`.
3. Under **Build and deployment**, set **Source** to `GitHub Actions`.
4. After workflow success, your live URL will be:
   `https://<your-username>.github.io/ecommerce-frontend/`

Every push to `main` redeploys automatically.

### Netlify

This repo includes [netlify.toml](./netlify.toml).

1. Netlify -> **Add new site** -> **Import from Git**.
2. Select this repository.
3. Build command: leave empty.
4. Publish directory: `.` (already configured).
5. Deploy.

Every push redeploys automatically.

### Vercel

This repo includes [vercel.json](./vercel.json).

1. Vercel -> **Add New Project**.
2. Import this repository.
3. Framework preset: `Other`.
4. Build command: empty.
5. Output directory: empty/root.
6. Deploy.

Every push redeploys automatically.

## Hosting Notes

- Service worker cache is path-safe for root domains and subpaths (for example GitHub Pages project URLs).
- Caching headers are configured for:
  - Apache via [.htaccess](./.htaccess)
  - Netlify via [netlify.toml](./netlify.toml)
  - Vercel via [vercel.json](./vercel.json)
