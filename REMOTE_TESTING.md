# Remote Testing

## Quick Tunnel

Use a tunnel when you want friends outside your Wi-Fi to test the app before deployment.

1. Start the backend on your machine.
2. Start the frontend on your machine.
3. Expose both with a tunnel.

Example with `cloudflared`:

```powershell
cloudflared tunnel --url http://localhost:5000
cloudflared tunnel --url http://localhost:3000
```

Example with `ngrok`:

```powershell
ngrok http 5000
ngrok http 3000
```

## Required Env Setup

Your backend must allow the frontend tunnel origin through CORS.

Set one of these in `backend/.env`:

```env
FRONTEND_URL=https://your-frontend-tunnel-url
```

or

```env
FRONTEND_URLS=https://your-frontend-tunnel-url,https://your-deployed-frontend-url
```

For the frontend, point API traffic to the backend tunnel:

```env
REACT_APP_API_URL=https://your-backend-tunnel-url
```

Then restart both servers.

## Recommended Path

- Use a tunnel for quick friend testing.
- Deploy once jam sessions, auth, and playback feel stable.
- Keep the tunnel flow only as a temporary beta path.
