# Guild Gmail approval backend setup

The backend function is in `supabase/functions/guild-email/index.ts`. The Gmail review landing page is `guild-review.html`.

## Required secrets
In Supabase Dashboard → Edge Functions → Secrets, configure:
- `SUPABASE_URL`: project URL
- `SUPABASE_ANON_KEY`: project publishable/anon key
- `SUPABASE_SERVICE_ROLE_KEY`: service-role key (server secret only; NEVER place in browser/GitHub)
- `RESEND_API_KEY`: API key from your Resend account
- `GUILD_FROM_EMAIL`: sender address verified with Resend, e.g. `StudyQuest <guilds@your-verified-domain.example>`
- `SITE_URL`: deployed website origin, e.g. `https://your-site.example` (no trailing slash)

## Deploy
Install Supabase CLI and link the project, then deploy the function. Because Gmail review links are one-time tokens and do not require the admin to sign in, deploy this function with JWT verification disabled for the endpoint, or configure equivalent routing:
```sh
supabase functions deploy guild-email --no-verify-jwt
```
The function itself requires a valid Supabase Auth bearer token for all actions except `reviewEmailToken`. Do not remove the function's token validation.

## Run SQL
Run `guild-setup.sql` in Supabase Dashboard → SQL Editor. It creates tables for guilds, questions, applications, members, and one-time review tokens. RLS is enabled and direct browser table access is revoked; the Edge Function uses the service-role key on the server.

## Frontend configuration
The Guild Hall now uses Supabase Auth magic links and calls the `guild-email` Edge Function. Edit `guild-config.js` and replace `PASTE_YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY_HERE` with the project's public publishable/anon key. Never put the service-role key in this file. In Supabase Dashboard → Authentication → URL Configuration, add your deployed Guild Hall URL to Site URL/Redirect URLs (for GitHub Pages, include the full `.../guild.html` URL). The user must click the magic link in the same browser where the Guild Hall is open.

## Email review behavior
On application submission the function grades the 20 answers on the server, stores the score, and sends the admin an email with the score plus Accept/Reject links. Links are random, hashed in the database, expire after seven days, and are single-use. Acceptance inserts the user into the guild membership table. Configure a verified sender domain in Resend before testing real delivery.
