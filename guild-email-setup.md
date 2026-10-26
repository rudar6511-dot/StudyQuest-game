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

## Important integration status
The current `guild.html`/ `guild.js` page still contains its earlier localStorage demo workflow. It asks for the emails but does not yet call this Edge Function for creating guilds or submitting applications. The existing site login also stores a local browser flag; that is not a verified Supabase Auth session. Therefore, running SQL alone will not activate the full workflow. The UI must be connected to Supabase Auth and the `guild-email` actions before real Gmail delivery works.

## Email review behavior
On application submission the function grades the 20 answers on the server, stores the score, and sends the admin an email with the score plus Accept/Reject links. Links are random, hashed in the database, expire after seven days, and are single-use. Acceptance inserts the user into the guild membership table. Configure a verified sender domain in Resend before testing real delivery.
