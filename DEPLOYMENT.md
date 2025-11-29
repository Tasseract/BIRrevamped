# Deployment Guide (Supabase + Railway + Vercel)

This guide covers a recommended free-friendly deployment using:
- Supabase (Postgres DB)
- Railway (Node backend)
- Vercel (static frontend)

Prerequisites
- GitHub repo with this project pushed
- Accounts on Supabase, Railway, Vercel

1) Supabase (Database)
- Create a new project on https://app.supabase.com
- In Project Settings → Database → Connection string, copy the `postgres` URL.
- Save that URL as `DATABASE_URL` in Railway and in GitHub Secrets.

2) Apply migrations
- Option A: Use GitHub Actions (recommended): add `DATABASE_URL` to GitHub repo Secrets. The workflow `.github/workflows/prisma-migrate.yml` runs on push to `main` and applies migrations.
- Option B: Run locally (if you have network access to the DB):
```powershell
$env:DATABASE_URL = "postgresql://<user>:<pass>@db.<region>.supabase.co:5432/postgres"
npx prisma migrate deploy
npx prisma generate
```

3) Railway (Backend)
- Create a new project and connect your GitHub repo.
- Set environment variables in Railway:
  - `DATABASE_URL` = (Supabase connection string)
  - `FRONTEND_URL` = `https://<your-vercel-site>.vercel.app` (optional, for CORS)
- Ensure `package.json` has `start` and `postinstall` scripts (already added in this repo).
- Deploy — Railway will build and start your Node server and provide a public URL.

4) Vercel (Frontend)
- Import the repo on Vercel and set the project to use Root directory as static site.
- Set `Build & Output Settings`: no build command, Output Directory `/`.
- (Optional) Set an environment variable `API_URL` pointing to the Railway backend URL so the frontend can call the API.

Docker image CI (optional, automated)
------------------------------------
This repo now contains a GitHub Action that builds and pushes a Docker image to GitHub Container Registry (GHCR) on every push to `main`.

- Image name: `ghcr.io/<your-org-or-user>/birrevamped:latest`
- To use this image on Railway/Render/Fly: configure a new service and set the image to the GHCR image above (you may need to give the host access to GHCR or use a deploy key).

Railway / Render using GHCR image (short)
1. In Railway/Render create a new service and choose Docker image as source.
2. For GHCR, you may need to create a read token or use your provider's registry integration. Use `ghcr.io/<owner>/birrevamped:latest` as the image.
3. Set environment variables (`DATABASE_URL`, `FRONTEND_URL`) in the host UI.
4. Start the service; it will run your image and expose the backend.

Why use the GHCR image?
- It allows you to build once in GitHub Actions and deploy the same image to whichever host you prefer.
- Useful if you want a single click deploy to multiple hosts without building in each host.

5) CORS and Environment
- `server.js` reads `FRONTEND_URL` (optional). In production, set it to your Vercel URL in Railway environment variables.

6) Test
- Open Vercel site, sign up, register a business, and check Railway logs for requests.

Notes
- Keep `DATABASE_URL` secret. Do not commit `.env`.
- The GitHub Action will run `prisma migrate deploy` on each push to `main`. Only grant the secret to trusted workflows.
