# Deploying VN Music

## Local Development

Keep these values while running locally:

### `frontend/.env`

```env
REACT_APP_API_URL=http://localhost:5000
DANGEROUSLY_DISABLE_HOST_CHECK=true
HOST=localhost
```

### `backend/.env`

```env
FRONTEND_URL=http://localhost:3000
```

## Backend on Render

Render supports deploying Node Express apps as a web service. Their docs say to create a new Web Service, connect your repo, and use your app's install/start commands. Source: https://render.com/docs/deploy-node-express-app

Use:

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/api/health`

Set these environment variables in Render:

```env
MONGODB_URI=...
JWT_SECRET=...
YOUTUBE_API_KEY=...
FRONTEND_URL=https://your-frontend.vercel.app
FRONTEND_URLS=https://your-frontend.vercel.app
```

After deploy, copy the Render backend URL, for example:

```text
https://your-backend.onrender.com
```

## Frontend on Vercel

Vercel supports Create React App and Git-based deployments. Source: https://vercel.com/docs/frameworks/create-react-app

For this project:

- Framework Preset: `Create React App`
- Root Directory: `frontend`

Set this environment variable in Vercel:

```env
REACT_APP_API_URL=https://your-backend.onrender.com
```

`vercel.json` is included so browser refreshes on routes like `/search`, `/jam`, and `/playlists/...` still load the SPA entry page. Vercel documents using `vercel.json` rewrites for app routing when needed. Source: https://vercel.com/docs/rewrites

## Deploy Order

1. Deploy backend to Render
2. Copy backend URL
3. Deploy frontend to Vercel with `REACT_APP_API_URL` set to that backend URL
4. Update Render `FRONTEND_URL` to your Vercel URL
5. Redeploy backend if needed

## Important

- Keep local `.env` values on your machine for local development
- Use Vercel/Render dashboard env vars for production
- Do not put production URLs permanently into your local `.env` unless you want local frontend to call production backend
