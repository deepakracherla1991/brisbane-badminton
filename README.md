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

## Mobile app (installable web app)

The site can be installed on phones as an app (a Progressive Web App), with no app store needed. Visitors open **/app** ("Get the app" in the footer, the mobile menu and the portal) for an **Install** button on Android and desktop Chrome, or step-by-step instructions on iPhone (Safari → Share → Add to Home Screen).

- `src/app/manifest.ts`: app name, colours, icons and home-screen shortcuts (My classes, Enrol, Court hire).
- `public/icons/`: app icons generated from the logo emblem. `src/app/apple-icon.png` is the iPhone home-screen icon.
- `public/sw.js`: service worker. Pages always load from the network, so portal data is never stale; `public/offline.html` is shown when there's no connection. It only runs in production builds.
- "Get the app" links are hidden when the site is already running as the installed app.

Every website update is in the app straight away.

## Academy enrolment form (`/academy/enrol`)

Replaces the Google Form and Google Sheet for term group-training enrolments. Every "Enrol now" button on the site opens it, and no account is needed. It has four steps:

1. **Program**: dropdowns for Program (Kids Group Training / Advanced Squad / Trial Lesson) and Training plan, preferred sessions (full classes can't be picked; the plan sets the minimum number of sessions a week), and the family (sibling) discount.
2. **Player**: name, date of birth (age is calculated), gender, playing level, experience, medical notes, and how they heard about us.
3. **Parent / guardian**: name, mobile, email, emergency contact and suburb. Pre-filled for signed-in portal users.
4. **Payment**: the total (worked out on the server), payment method (bank transfer / PlayOn / both), bank details with copy buttons and the payment reference, PlayOn voucher number, receipt upload (photos or PDF, up to 5 files of 10 MB each, stored privately), and agreement to the important notes.

After submitting, the parent gets a reference such as `BB-T4-K7Q2M` and an email copy, and the academy inbox gets a notification (`ACADEMY_NOTIFY_EMAIL`, default `admin@badmintonbrisbane.com.au`). Drafts are saved in the browser, so parents can come back to finish. "Enrol a sibling" starts a new form with the parent details and the next sibling discount already filled in.

**Staff** see submissions under **Portal → Enrolments**: filter by status and term, search, view details and receipts, set the enrolment status (New / Confirmed / Waitlisted / Declined / Cancelled) and payment status, add staff notes, optionally email the parent, and **Export CSV** for Excel or Google Sheets.

**Each term**, edit `src/content/enrolment.ts`: term name and dates, sessions (and whether each is open, limited or full), plans and prices, discounts, bank details and important notes. Set `enrolmentTerm.open = false` to close enrolments.

**Setup:** run `supabase/migrations/0002_enrolment_form.sql` in the Supabase SQL editor (after `0001`). It creates the `enrolment_applications` table and the private `enrolment-uploads` storage bucket with their access rules.

**Card payments (later):** the payment step is built so a card option (e.g. Stripe Checkout) can be added as another payment method. `card` is already an allowed `payment_method` in the database.

## Academy portal (`/portal`)

Customers create an account, add students (a parent can add several children), browse the open term's classes and enrol, or join the waitlist when a class is full. They can see their enrolments and payment status, and withdraw. Staff with the **admin** role manage terms and classes, see each class roster with parent contact details, mark payments, and withdraw students. When a place frees up (someone withdraws, or capacity is raised), the first person on the waitlist is enrolled automatically and emailed.

There's no online payment: enrolments start as **Awaiting payment** and staff mark them **Paid** (or **No charge**) in the admin roster. Payment wording is `academy.paymentInstructions` in `src/content/site.ts`.

### One-time setup

1. **Create a Supabase project** at https://supabase.com (free tier is fine).
2. **Create the database tables.** In the Supabase dashboard open **SQL Editor**, paste in the contents of `supabase/migrations/0001_academy_portal.sql` and run it. Optionally run `supabase/seed.sql` too, for a sample term with six sample classes (edit or delete them afterwards in the admin page).
3. **Add the keys.** Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Supabase: **Connect** button, or **Project Settings → API Keys**). Restart `npm run dev`.
4. **Set the login links.** In Supabase **Authentication → URL Configuration**, set **Site URL** to your site (e.g. `http://localhost:3000` while testing) and add `http://localhost:3000/portal/auth/confirm` (plus your live domain's `/portal/auth/confirm`) under **Redirect URLs**.
5. **Recommended: make email links work in any browser.** In **Authentication → Emails**, edit the templates so the links point at the portal:
   - *Confirm signup*: `{{ .SiteURL }}/portal/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/portal`
   - *Reset password*: `{{ .SiteURL }}/portal/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/portal/reset-password`

   With the default templates, links only work when opened in the same browser the person signed up in.
6. **Make yourself an admin.** Register through `/portal/register`, then in the Supabase SQL editor run:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
   The **Admin** tab then appears in the portal.

### "Continue with Google" (optional)

The sign-in and sign-up pages show a **Continue with Google** button once `NEXT_PUBLIC_AUTH_GOOGLE=true` is set in `.env.local`. Turn it on only after this setup, or visitors will see an error page:

1. In [Google Cloud Console](https://console.cloud.google.com), create a project (or use an existing one).
2. **APIs & Services → OAuth consent screen**: set it up as **External**, with the app name "Brisbane Badminton", your support email and your logo.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**, type **Web application**. Under **Authorised redirect URIs** add your Supabase callback URL, shown in Supabase under **Authentication → Sign In / Providers → Google** (it looks like `https://<project-ref>.supabase.co/auth/v1/callback`).
4. Copy the **Client ID** and **Client secret** into Supabase **Authentication → Sign In / Providers → Google**, enable it and save.
5. Add `NEXT_PUBLIC_AUTH_GOOGLE=true` to `.env.local` and restart `npm run dev`.

Google doesn't share a mobile number, so people who sign up with Google are asked to add one on the **Account** page before their first enrolment.

### Emails

- **Sign-up confirmation and password reset** emails are sent by Supabase. Its built-in sender is limited to a few emails per hour, so before going live set up custom SMTP under **Authentication → Emails → SMTP Settings** (Resend provides SMTP).
- **Enrolment, waitlist and "a place opened up"** emails are sent by the site through [Resend](https://resend.com). Set `RESEND_API_KEY` and `EMAIL_FROM` (an address on a domain verified in Resend). Without a key, these emails are printed in the server log instead.

### How it's built

- `supabase/migrations/0001_academy_portal.sql`: tables, row level security (customers only ever see their own students and enrolments) and the `enrol_student` / `withdraw_enrolment` / `promote_waitlist` functions, which lock the class so two people can't take the last place at once.
- `src/app/portal/`: pages; `actions.ts`, `auth-actions.ts` and `admin/actions.ts` are the server actions.
- `src/proxy.ts`: keeps the login session fresh on portal pages.
- `src/lib/email.ts`: email templates.

## Chat assistant ("Birdie")

A chat button in the bottom-right corner of every page opens **Birdie**, an AI assistant that answers visitor questions about the venue.

- **Answers come from the site content.** The assistant's instructions are built from `src/content/site.ts` (`src/lib/assistant.ts`), so updating the site content updates what Birdie knows. It is told not to guess prices, times or details that aren't listed, and to point people to WhatsApp or the phone number instead.
- **AI replies need an Anthropic API key.** Copy `.env.example` to `.env.local` and set `ANTHROPIC_API_KEY` (get one at https://console.anthropic.com), then restart `npm run dev`. On Vercel, add the same variable under Project → Settings → Environment Variables.
- **Without a key** the chat still works using simple built-in answers for common questions (hours, prices, location, academy, club, etc.).
- **Limits:** 20 questions per visitor per browser tab (shown as the counter), 800 characters per message, and a per-IP rate limit on `/api/chat`.
- **Model:** Claude Opus 5.5 at low effort, with prompt caching on the instructions and automatic fallback to another model if a reply is declined. Change these in `src/app/api/chat/route.ts`; the name, welcome message, quick replies and limits are in `src/lib/assistant-config.ts`.

## Contact form

The form on `/contact` currently opens the visitor's email app with the message pre-filled. To receive messages directly, swap it for a form service (Fillout, Formspree, etc.) or a Next.js route handler.
