# Front Caller

The public website for Front Caller, hosted on Vercel.

## Contact form setup

The contact form sends enquiries through Resend. In the Vercel project, add these environment variables:

- `RESEND_API_KEY`: your Resend API key
- `LEAD_TO_EMAIL`: the email address that should receive enquiries
- `LEAD_FROM_EMAIL` (optional): a verified sender, such as `Front Caller Website <hello@frontcaller.com>`

After adding or changing environment variables, redeploy the website from Vercel.

## Deployment

Vercel deploys the `main` branch automatically. GitHub Pages is not used.

## Security

The form validates input on the server, rejects cross-site submissions, includes a hidden spam trap, and does not store submitted customer details in this repository. Vercel security headers are configured in `vercel.json`.
