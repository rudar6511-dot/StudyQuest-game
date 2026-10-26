# StudyQuest Guild Gmail review — setup status

## What the current commit does
- Guild creation asks for the admin's Gmail/email and saves it with the guild in demo mode.
- Applying to a guild asks for the applicant's email and records it with the score.
- The current Guild page still stores applications in browser localStorage. It does **not** send an email, and it cannot safely process Accept/Reject links from Gmail yet.

## Why the email approval flow needs backend setup
The requested workflow needs a server-side email provider and a database-backed review endpoint. A browser-only mailto link is not automatic email delivery, and a link that changes membership must be validated on the server so another person cannot accept/reject an application by editing the URL.

## Next implementation/setup requirements
1. Use Supabase Auth so guild creators/applicants have verified accounts.
2. Run guild-setup.sql in Supabase SQL Editor. The new admin_email and applicant_email columns are included; existing tables get safe ADD COLUMN IF NOT EXISTS statements.
3. Configure an email provider such as Resend on a Supabase Edge Function. Store the provider API key as a Supabase secret (never in GitHub/frontend).
4. Move guilds, applications, scores, and review decisions from localStorage into Supabase tables.
5. Send the admin an email with the applicant name, email, score out of 20, and one-time Accept/Reject links. The links must call a server-side endpoint that verifies a one-time token and updates the application status in the database.

**Important:** Do not advertise the feature as working email approval until steps 3–5 are implemented and tested. The present commit is the email-field groundwork, not the completed automated Gmail workflow.
