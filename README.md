# 🚨 Archived: Remix → React Router Transition

With the introduction of React Router v7, the Remix team has announced that the
official upgrade path for existing Remix applications is to move to React Router
v7, as described in their
[announcement](https://remix.run/blog/react-router-v7).

This example application has been **archived** and is no longer being updated.
However, **we continue to fully support and maintain the [Remix
SDK (`@arcjet/remix`)](https://www.npmjs.com/package/@arcjet/remix)**.

For an up-to-date reference implementation that follows the new recommended
direction, please see our [**React Router
example**](https://github.com/arcjet/example-react-router).

---

<a href="https://arcjet.com" target="_arcjet-home">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://arcjet.com/logo/arcjet-dark-lockup-voyage-horizontal.svg">
    <img src="https://arcjet.com/logo/arcjet-light-lockup-voyage-horizontal.svg" alt="Arcjet Logo" height="128" width="auto">
  </picture>
</a>

# Arcjet Remix example app

[Arcjet](https://arcjet.com) helps developers protect their apps in just a few
lines of code. Bot detection. Rate limiting. Email validation. Attack
protection. Data redaction. A developer-first approach to security.

This is an example Remix application demonstrating the use of multiple features.
There is a version deployed at
[https://example.arcjet.com](https://example.arcjet.com).

## Features

- [Signup form protection](https://example.arcjet.com/signup) uses Arcjet's
  server-side email verification configured to block disposable providers and
  ensure that the domain has a valid MX record. It also includes rate limiting
  and bot protection to prevent automated abuse.
- [Bot protection](https://example.arcjet.com/bots) shows how a page can be
  protected from automated clients.
- [Rate limiting](https://example.arcjet.com/rate-limiting) shows the use of
  different rate limit configurations depending on the authenticated user. A
  logged-in user can make more requests than an anonymous user.
- [Attack protection](https://example.arcjet.com/attack) demonstrates Arcjet
  Shield, which detects suspicious behavior, such as SQL injection and
  cross-site scripting attacks.
- [Sensitive info](https://example.arcjet.com/sensitive-info) protects against
  clients sending you sensitive information such as PII that you do not wish to
  handle.

## Run locally

1. [Register for a free Arcjet account](https://app.arcjet.com).

2. Install dependencies:

```bash
npm ci
```

3. Rename `.env.example` to `.env` and add your Arcjet key. If you want to test
   the rate limiting authentication, you will also need to add a GitHub app key
   and secret after [creating a GitHub OAuth
   app](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app).

4. Start the dev server

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy

If you use this for production, edit the `app/sessions.server.ts` file to
include your domain.

## Need help?

Check out [the docs](https://docs.arcjet.com/), [contact
support](https://docs.arcjet.com/support), or [join our Discord
server](https://arcjet.com/discord).

## Stack

- Auth: [Auth.js](https://authjs.dev/)
- App: [Remix](https://remix.run/)
- UI: [shadcn/ui](https://ui.shadcn.com/) + [Tailwind
  CSS](https://tailwindcss.com/)
- Security: [Arcjet](https://arcjet.com/)
