# Brisbane Badminton

Website for Brisbane Badminton, Queensland's first dedicated badminton venue in Crestmead.

Built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS 4** and **lucide-react** icons. Every page is statically generated, so it can be hosted on Vercel or any static host.

## Getting started

Requires **Node.js 20.9 or newer** (`node -v` to check). With nvm, run `nvm use` to pick up `.nvmrc`.

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

Photos live in `public/images/` (academy, club, coaches, events, gallery, home, socials). They were taken from the current site's image bucket, with duplicates removed, resized to at most 2400px and compressed. Next.js serves smaller versions automatically.

Any image area without a photo shows a branded court-line graphic. To add or swap a photo:

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

## Logos

Brand logos live in `public/logos/`:

| File | Use on |
|---|---|
| `logo-full-white.png` | dark backgrounds (header, footer) |
| `logo-full-color.png` | light backgrounds |
| `logo-mono-white.png` | photos or brand-red backgrounds |
| `emblem-red.png`, `emblem-white.png` | emblem only |

Use `<Logo variant="dark" | "light" | "mono" />` from `src/components/Logo.tsx`. The browser-tab icon (`src/app/icon.png`), Apple touch icon and social share image (`src/app/opengraph-image.png`) are generated from these.

## Chat assistant ("Birdie")

A chat button in the bottom-right corner of every page opens **Birdie**, an AI assistant that answers visitor questions about the venue.

- **Answers come from the site content.** The assistant's instructions are built from `src/content/site.ts` (`src/lib/assistant.ts`), so updating the site content updates what Birdie knows. It is told not to guess prices, times or details that aren't listed, and to point people to WhatsApp or the phone number instead.
- **AI replies need an Anthropic API key.** Copy `.env.example` to `.env.local` and set `ANTHROPIC_API_KEY` (get one at https://console.anthropic.com), then restart `npm run dev`. On Vercel, add the same variable under Project → Settings → Environment Variables.
- **Without a key** the chat still works using simple built-in answers for common questions (hours, prices, location, academy, club, etc.).
- **Limits:** 20 questions per visitor per browser tab (shown as the counter), 800 characters per message, and a per-IP rate limit on `/api/chat`.
- **Model:** Claude Opus 5.5 at low effort, with prompt caching on the instructions and automatic fallback to another model if a reply is declined. Change these in `src/app/api/chat/route.ts`; the name, welcome message, quick replies and limits are in `src/lib/assistant-config.ts`.

## Contact form

The form on `/contact` currently opens the visitor's email app with the message pre-filled. To receive messages directly, swap it for a form service (Fillout, Formspree, etc.) or a Next.js route handler.
