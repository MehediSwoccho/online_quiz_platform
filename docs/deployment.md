# Deployment: MongoDB Atlas, Render, and Vercel

## Architecture

- MongoDB Atlas stores application data.
- Render runs the Express API from `backend/`; its health check is `GET /api/health`.
- Vercel serves the Vite/React app from `frontend/`. Its `/api/*` rewrite proxies to the Render service, and its final rewrite sends React Router paths to `/index.html`.
- In production, leave `VITE_API_URL` unset so the browser calls the same-origin `/api` path.

`render.yaml` contains the backend build/start commands and environment-variable names only. The Vercel API rewrite currently targets `https://module-3-normal-backend.onrender.com`, matching the Render service name. If Render assigns a different hostname, update the rewrite destination in `frontend/vercel.json` before deploying Vercel.

## Environment variables

Set values in the hosting provider's environment-variable dashboard, never in committed source or deployment files. Do not commit `.env` files, Atlas connection strings, JWT keys, or Cloudinary credentials.

| Variable | Where | Required | Purpose |
|---|---|---:|---|
| `MONGODB_URI` | Render | Yes | Atlas connection string, including the application database name. Keep the database user's password in the provider secret field and URL-encode special characters in the URI. |
| `JWT_SECRET` | Render | Yes | Signs and verifies JWT sessions. Generate a high-entropy random value (at least 32 random bytes); do not reuse an example or commit it. |
| `NODE_ENV` | Render | Yes | Set to `production`; enables the `Secure` flag on JWT cookies. |
| `CLIENT_URL` | Render | Yes | Comma-separated exact frontend origins allowed by the API CORS middleware. Set the Vercel production origin after the first Vercel deployment; include a custom domain only if one is used. Do not add a trailing slash. |
| `CLOUDINARY_CLOUD_NAME` | Render | Optional | Cloudinary account name for profile-image uploads. Configure together with the API key and secret. |
| `CLOUDINARY_API_KEY` | Render | Optional | Cloudinary API key. Configure together with the other two Cloudinary values. |
| `CLOUDINARY_API_SECRET` | Render | Optional | Cloudinary API secret. Configure together with the other two Cloudinary values. |
| `PORT` | Render | Platform-managed | Render supplies the listening port. The backend defaults to port 5001 for local development; do not set a fixed production port. |
| `VITE_API_URL` | Vercel / local frontend | Optional | Frontend API base URL override. Leave unset in Vercel so `/api` stays on the Vercel origin. Use only for local development when calling an API directly. It is a public build-time value, never a place for secrets. |

Cloudinary is optional at startup. If any Cloudinary credential is missing, the SDK is not configured and the backend still starts. Profile-image uploads then return HTTP 503 until all three values are configured.

## 1. Create the Atlas database

1. Create an Atlas organization/project and a cluster in the region closest to the Render service.
2. In **Database Access**, create a database user with a strong unique password and only the privileges needed for the application's database (for example, read/write on the application database).
3. In **Network Access**, allow the Render service's outbound IP addresses for its selected region when available. If the Render plan does not provide a sufficiently stable outbound range, Atlas may require a broader access-list entry; use `0.0.0.0/0` only as a deliberate fallback, and rely on a strong database-user credential and least privilege.
4. Select **Connect → Drivers**, copy the MongoDB connection string, and configure the application database name in the URI. Replace the password placeholder locally, URL-encode special characters, then store the completed URI only as Render's `MONGODB_URI` secret. Do not paste it into this repository or into Vercel.

## 2. Deploy the frontend to Vercel

1. Import the same repository into Vercel and set **Root Directory** to `frontend`.
2. Select the Vite framework preset. Use `npm ci` for installation, `npm run build` for the build command, and `dist` as the output directory. The checked-in `frontend/vercel.json` supplies the API proxy and SPA fallback rewrites.
3. Do not set `VITE_API_URL` for production. The frontend's Axios instance already uses `/api` by default.
4. Deploy the static site and note its production origin (scheme and hostname only). The SPA can deploy before its API; API requests will work after the Render service is live.

## 3. Deploy the API to Render

1. Push the repository to the Git provider connected to Render. In Render, choose **New → Blueprint** and select this repository's `render.yaml` at the repository root.
2. Review the Blueprint service. It uses the `backend` root directory, runs `npm ci` to build/install, runs `npm start` to serve, and checks `GET /api/health`.
3. Add the required values in the Render service's **Environment** settings: `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV` set to `production`, and `CLIENT_URL` set to the Vercel origin from step 2. The `render.yaml` uses `sync: false` so no values are stored in the file. If using a custom frontend domain, include it as another comma-separated origin.
4. Optionally add all three Cloudinary variables. Leave all three unset if profile-image uploads are not needed; partial credentials are treated as not configured.
5. Deploy and wait for the Render health check to pass at the service's `/api/health` endpoint. The response is a simple health status and does not expose configuration.
6. The Vercel rewrite targets `module-3-normal-backend.onrender.com`, matching the Render service name. If Render assigns a different hostname, update `frontend/vercel.json` and redeploy Vercel.
7. Open the Vercel deployment and verify that `/api/health` returns the API health response and that a React Router deep link loads the SPA.

## JWT cookie and CORS behavior

The browser talks to `https://<your-vercel-origin>/api/...`; Vercel proxies that request server-to-server to Render while keeping the browser-visible URL on the Vercel origin. The API's host-only `jwt` cookie is therefore set for the Vercel host rather than for a cross-site Render host. This keeps the cookie first-party and avoids relying on third-party-cookie behavior. The cookie remains `HttpOnly`, `SameSite=Lax`, path `/`, and `Secure` when `NODE_ENV=production`; frontend requests already enable credentials.

Express trusts one proxy hop (`app.set('trust proxy', 1)`) so it can interpret the forwarded HTTPS request correctly behind Render/Vercel. The API's CORS middleware still checks the forwarded browser `Origin`, so `CLIENT_URL` must contain the exact Vercel production origin (and any intentionally supported custom origin). The rewrite does not require exposing the Render URL in browser API calls. Keep `VITE_API_URL` unset in production; pointing it directly to Render would make the browser cross-origin and undermine this first-party-cookie setup.

## Post-deploy checks

- `GET https://<your-vercel-origin>/api/health` returns HTTP 200.
- Sign up or log in and inspect browser storage metadata: `jwt` should be `HttpOnly`, `Secure`, `SameSite=Lax`, and scoped to the Vercel host. Do not copy or print its value.
- Refresh a protected page to verify the cookie-backed `/api/auth/check` flow.
- If Cloudinary is intentionally unset, confirm ordinary backend startup works; profile-image upload is expected to return HTTP 503 until the three credentials are configured.
