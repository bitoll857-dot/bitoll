# Supabase Setup - Bitoll

1. Create a Supabase project.
2. Fill `.env` with:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SITE_URL` with the deployed app domain, for example
     `https://YOUR_DOMAIN`
   - `PUBLIC_SUPABASE_ANON_KEY` or `PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. In Supabase, open SQL Editor and run `supabase/schema.sql`.
4. In Supabase SQL Editor, run `supabase/seed.sql` to publish starter
   services, products and promotions in the database.
5. In Authentication > Providers > Google, enable Google.
6. In Google Cloud OAuth, add this redirect URL:
   - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
7. In Supabase Auth URL configuration, add the app URL:
   - Local: `http://localhost:5173/auth/callback`
   - Production: `https://bitoll.vercel.app/auth/callback`
   - Site URL: `https://bitoll.vercel.app`

The app uses Supabase Auth for login and keeps the first local fallback until
the remaining simulated services, promotions, projects, quotes and chat data
are migrated into the tables from `schema.sql`.
