# message_me

Contact form (Netlify) that validates email via AbstractAPI and forwards the lead to a Google Apps Script web app.

## Required Netlify environment variables

Set these in **Netlify → Site settings → Environment variables** (never commit values):

| Variable | Purpose |
| --- | --- |
| `ABSTRACT_API_KEY` | AbstractAPI email validation |
| `GOOGLE_SCRIPT_URL` | Full Google Apps Script `/exec` URL for the lead receiver |

## Security note (2026-08-15)

`GOOGLE_SCRIPT_URL` was previously hardcoded in the function source. It now must come from env. If this URL was ever public, **redeploy a new Apps Script web-app deployment** and revoke/disable the old one, then update the Netlify env var.
