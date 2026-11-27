/*
  Cloudflare hosting for the Sri Balaji Hospital website (free Workers static assets).

  Deploy with:  pnpm --filter @workspace/sri-sai-hospital run deploy:cloudflare
  That builds the site (Vite, then scripts/build-pages.mjs) and uploads dist/public as an assets-only Worker.

  - htmlHandling "auto-trailing-slash": /neurology-tanuku serves neurology-tanuku.html, and
    /neurology-tanuku.html redirects to the clean address (same behaviour as Vercel's cleanUrls).
  - notFoundHandling "single-page-application": any other address opens the home page, so old links
    such as /faq and /why-choose keep working.
  The live Google rating function (api/google-rating.mjs) is not part of this static deploy yet;
  the Reviews section shows its built-in rating until a Worker for it is added.
*/
import { defineConfig } from 'cf/config';

export default defineConfig({
  worker: {
    name: 'sri-balaji-hospital',
    compatibilityDate: '2026-11-20',
    // The hospital domain (Cloudflare manages its DNS and HTTPS certificate). www redirects to the main address.
    domains: ['sribalajihospitaltanuku.com', 'www.sribalajihospitaltanuku.com'],
    assets: {
      htmlHandling: 'auto-trailing-slash',
      notFoundHandling: 'single-page-application',
    },
  },
});
