# METIS — Maternal and Child Health Intelligence

METIS is an offline-first Progressive Web App for maternal and child health monitoring. It gives families a simple health workspace and helps ASHA workers identify risk early, prioritize follow-ups, review child records, and plan field visits.

Built by Team BuildShot for the MIT-ADT AI Grand Challenge 2026.

## Live app

- Production: [metis-buildshot-two.vercel.app](https://metis-buildshot-two.vercel.app)
- Family and mother login: `/auth`
- ASHA worker login: `/asha/login`

The landing-page **Launch App** button opens the PWA installation prompt when the browser supports it. After installation—or through the fallback instructions—it continues to the family login. The family login page includes a separate **Login for ASHA** option.

## Core features

### Families and mothers

- Family health dashboard
- Child growth tracking
- Nutrition logging and recommendations
- Vaccination reminders
- Infant cry analysis
- Malnutrition screening
- Consultation and activity views

### ASHA workers

- Early maternal and child risk monitoring
- Offline child registry
- High-risk and due-visit follow-up queue
- Village coverage map with Google Maps
- Screening and referral decision support
- Local device sessions and offline-ready records

## PWA and offline behavior

- Installable manifest with 192 px and 512 px icons
- Standalone mobile display mode
- Network-first navigation so deployments do not serve stale HTML
- Offline fallback page when navigation cannot reach the network
- Cached hashed Next.js assets and app imagery
- Automatic cleanup of older METIS caches
- Service workers disabled and cleared during local development to prevent hydration problems

Google Maps and services that require a live API remain network-dependent.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Public landing page and PWA launch action |
| `/auth` | Default family and mother login |
| `/dashboard` | Family health workspace |
| `/asha/login` | ASHA worker login and demo access |
| `/asha` | ASHA risk-monitoring panel |
| `/asha/children` | Offline child registry |
| `/asha/follow-ups` | Priority follow-up queue |
| `/asha/map` | Village map and route planning |

Legacy `/dashboard/asha/*` links redirect to their equivalent `/asha/*` pages.

## Technology

- Next.js 16 App Router and React 19
- TypeScript
- Tailwind CSS
- Supabase SSR authentication support
- Vercel Analytics and deployment
- Browser service worker, Cache Storage, and local storage for offline-first behavior

The UI can run in preview mode without Supabase credentials. Configure Supabase for real account verification and persistent cloud data.

## Local development

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Create `.env.local` when connecting a Supabase project:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Without these values, the family login uses local preview access and the ASHA login supports validated local device access plus a one-click demo.

## Validation

```bash
npm run lint
npm run build
npm audit --omit=dev
```

## Important health notice

METIS is a decision-support prototype. Risk indicators and AI-generated guidance do not replace clinical diagnosis, emergency services, or advice from a qualified healthcare professional.

## Team

Team BuildShot — MIT-ADT University, Pune, India.

- Krishna — Lead architecture and ecosystem integration
- Pratik — AI research and backend development
- Parth — Product design and frontend development

## License

Developed for the MIT-ADT AI Grand Challenge 2026. All rights reserved by Team BuildShot.
