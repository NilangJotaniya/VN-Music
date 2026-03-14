# VN Music

VN Music is a full-stack music streaming project with a React frontend and a Node/Express backend.

## Project Structure

- `frontend/` React app
- `backend/` Express API
- `UI/` pasted reference UI source
- `render.yaml` Render backend deploy config
- `vercel.json` Vercel frontend routing config
- `DEPLOYMENT.md` deployment notes
- `REMOTE_TESTING.md` remote testing notes

## Main Features

- authentication
- search and trending music
- favorites and playlists
- jam sessions
- real-time jam chat, reactions, voting, host transfer, and moderator controls
- lyrics lookup

## Local Development

Frontend:

```powershell
cd frontend
npm install
npm start
```

Backend:

```powershell
cd backend
npm install
npm start
```

## Deployment

- frontend: Vercel
- backend: Render

See [DEPLOYMENT.md](DEPLOYMENT.md) for the deployment steps.
