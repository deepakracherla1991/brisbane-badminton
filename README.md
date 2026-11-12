# Brisbane Badminton

Website for Brisbane Badminton, Queensland's first dedicated badminton venue in Crestmead.

Built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS 4** and **lucide-react** icons. Every page is statically generated, so it can be hosted on Vercel or any static host.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck
```

## Editing content

Almost all copy lives in **`src/content/site.ts`**: contact details, opening hours, navigation, rates, academy programs, FAQs and booking links. Search that file for `TODO` to find placeholders that need real values before launch:

- `links.bookCourt`, `links.academyEnrol`, `links.clubJoin`: point these at the real booking and registration forms.
- Court-hire peak rates, program times and prices, and social session times.

In development (`npm run dev`), pages show amber **TODO** notes where details are missing. They are hidden in production builds.

## Photos

Until photos are added, image areas show a branded court-line graphic. To use a real photo:

1. Put it in `public/images/` (e.g. `public/images/little-smashers.jpg`).
2. Set `image: "/images/little-smashers.jpg"` on the matching program in `src/content/site.ts`, or pass `image` to `<Media>` / `<FeatureSplit>` on a page.

Remote images must have their host listed in `next.config.ts` under `images.remotePatterns`.

## Structure

```
src/
  app/             one folder per page (about, academy, club, contact, court-hire, pro-shop, services, socials)
  components/      Header, Footer, ContactForm and shared UI blocks (ui.tsx)
  content/site.ts  all site content
```

## Contact form

The form on `/contact` currently opens the visitor's email app with the message pre-filled. To receive messages directly, swap it for a form service (Fillout, Formspree, etc.) or a Next.js route handler.
