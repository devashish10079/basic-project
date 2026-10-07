# Fullstack React & Express Product Store

This repository contains a full-stack web application with a Node.js + Express backend and a React + Vite frontend.

## Project Structure

```
├── Backend/          # Node.js + Express + MongoDB REST API
│   ├── app.js
│   ├── data.json
│   ├── package.json
│   └── .env.example
└── Frontend/         # React + Vite Frontend
    ├── src/
    ├── package.json
    └── .env.example
```

## Deployment Configuration

### Backend → Render
- **Type**: Web Service
- **Root Directory**: `Backend`
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `PORT`: (automatically provided by Render)
  - `MONGO_URI`: MongoDB Atlas connection string
  - `FRONTEND_URL`: URL of the deployed Vercel frontend (e.g. `https://your-frontend.vercel.app`)

### Frontend → Vercel
- **Framework Preset**: Vite
- **Root Directory**: `Frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: URL of the deployed Render backend (e.g. `https://your-backend.onrender.com`)

## Local Development

### 1. Run Backend
```bash
cd Backend
npm install
npm start
# Server runs on http://localhost:3000
```

### 2. Run Frontend
```bash
cd Frontend
npm install
npm run dev
# Vite runs on http://localhost:5173
```
