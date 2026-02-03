# Pin Map + Calendar Project

## Project Overview
An interactive community website with two main features:
1. **Map** - Leaflet/OpenStreetMap map where anyone can drop pins
2. **Calendar** - Month-grid calendar where anyone can add events

Pins and events are unified - a pin with a date shows on both the map and calendar. Events can be temporary (disappear from map after end date) or permanent.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Map**: Leaflet + React-Leaflet + OpenStreetMap (free)
- **Database**: Supabase PostgreSQL (free tier)
- **Hosting**: Vercel (free tier) - LIVE at https://pin-map-phi.vercel.app/
- **Styling**: Tailwind CSS
- **Email**: Resend (not yet configured)

## Project Location
`C:\Users\yaako\pin-map`

## GitHub Repository
https://github.com/yaakovaldrich-ops/pin-map

## Database (Supabase)
- **Project ID**: mstfdemxpuuascovfqib
- **URL**: https://mstfdemxpuuascovfqib.supabase.co
- **Anon Key**: sb_secret_R04bVG4MjifZJSddOVIx_w_43upty-0

### Tables
1. **pins** - Stores both location pins and events
   - id, lat, lng, title, description, category, created_at, visitor_id
   - start_date, end_date, address (for events)

2. **site_config** - Site settings (name, theme, legend categories)

3. **page_views** - Analytics tracking

## Environment Variables Needed
```
NEXT_PUBLIC_SUPABASE_URL=https://mstfdemxpuuascovfqib.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_secret_R04bVG4MjifZJSddOVIx_w_43upty-0
ADMIN_PASSWORD=transpride
RESEND_API_KEY=re_xxxxx (not yet set up)
RESEND_FROM_EMAIL=onboarding@resend.dev
ADMIN_EMAIL=yaakov.aldrich@gmail.com
```

## Admin Access
- URL: `/admin`
- Password: `transpride`
- Features: Legend editor, site settings, pin moderation, events moderation, stats

## Key Files
```
src/
├── app/
│   ├── page.tsx              # Map page
│   ├── calendar/page.tsx     # Calendar page
│   ├── admin/page.tsx        # Admin dashboard
│   └── api/
│       ├── pins/route.ts     # CRUD for pins/events
│       ├── events/route.ts   # Calendar event queries
│       ├── config/route.ts   # Site config
│       ├── stats/route.ts    # Analytics
│       ├── auth/route.ts     # Admin auth
│       └── notify/route.ts   # Email notifications
├── components/
│   ├── Map.tsx               # Leaflet map
│   ├── Calendar.tsx          # Month grid calendar
│   ├── Navigation.tsx        # Map/Calendar tabs
│   ├── PinForm.tsx           # Pin/event creation form
│   └── Legend.tsx            # Map legend
└── lib/
    ├── supabase.ts           # Database client
    ├── types.ts              # TypeScript types
    ├── pin-icons.ts          # Custom map markers
    └── email.ts              # Email helper
```

## Pin/Event Types
- **Location-only pin**: No dates, always shows on map, never on calendar
- **Permanent event**: Has start_date but no end_date, shows on both forever
- **Temporary event**: Has start_date AND end_date, disappears from map after end_date but stays grayed out on calendar

## Git Config
- Name: Yaakov A
- Email: yaakov.aldrich@gmail.com

## Deployment Status: INCOMPLETE

### Next Steps to Deploy
1. Go to vercel.com
2. Sign up with GitHub (use FREE/Hobby tier, skip Pro trial)
3. Import the pin-map repository
4. Add the 3 environment variables listed above
5. Deploy

### Vercel Note
If Vercel asks for credit card info, you may have accidentally selected Pro trial. Look for:
- "Hobby" plan option
- "Skip" or "Continue with free" button
- Or go directly to: https://vercel.com/new and select Hobby when prompted

## Email Notifications (Not Yet Set Up)
To enable email notifications when events are created:
1. Sign up at resend.com (free, 100 emails/day)
2. Get API key from dashboard
3. Add to environment variables:
   - RESEND_API_KEY
   - RESEND_FROM_EMAIL
   - ADMIN_EMAIL

## Running Locally
```bash
cd C:\Users\yaako\pin-map
npm run dev
# Opens at http://localhost:3000
```

## Database Schema Migration (Already Applied)
```sql
ALTER TABLE pins
  ADD COLUMN IF NOT EXISTS start_date timestamptz,
  ADD COLUMN IF NOT EXISTS end_date timestamptz,
  ADD COLUMN IF NOT EXISTS address text;

ALTER TABLE pins
  ALTER COLUMN lat DROP NOT NULL,
  ALTER COLUMN lng DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pins_start_date ON pins(start_date);
CREATE INDEX IF NOT EXISTS idx_pins_end_date ON pins(end_date);
```
