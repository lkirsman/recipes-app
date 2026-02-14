# Quickstart: Recipes App

**Feature**: 001-recipes-app | **Date**: 2026-02-14

## Prerequisites

- **Node.js** 20 LTS or later
- **npm** 9.x or later
- **MongoDB** connection string (Atlas or local instance)

## Project Setup

### 1. Initialize the Server

```bash
mkdir server && cd server
npm init -y
npm install express mongoose cors multer dotenv
npm install --save-dev jest supertest nodemon
```

**package.json scripts**:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --verbose"
  }
}
```

### 2. Initialize the Client

```bash
cd .. && npm create vite@latest client -- --template react
cd client
npm install axios react-router-dom
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

### 3. Environment Configuration

Create `server/.env`:
```env
MONGODB_URI=<your-mongodb-connection-string>
PORT=5000
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Vite API Proxy (Development)

Add to `client/vite.config.js`:
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
```

## Running the Application

### Development Mode

Terminal 1 (Server):
```bash
cd server && npm run dev
```

Terminal 2 (Client):
```bash
cd client && npm run dev
```

- **Server**: http://localhost:5000
- **Client**: http://localhost:5173
- **API Base**: http://localhost:5000/api

### Running Tests

```bash
# Server tests
cd server && npm test

# Client tests
cd client && npm test
```

## Key Files to Create First

1. `server/config/db.js` — MongoDB connection
2. `server/models/Recipe.js` — Mongoose schema
3. `server/server.js` — Express app with middleware
4. `server/routes/recipes.js` — API routes
5. `client/src/services/recipeService.js` — API client
6. `client/src/App.jsx` — Router setup with Tuscany styling

## Technology Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 20 LTS |
| Backend | Express | 4.19.x |
| Database | MongoDB (Mongoose) | 8.x |
| Frontend | React | 18.x |
| Bundler | Vite | 6.x |
| Routing | React Router | 7.x |
| HTTP Client | Axios | 1.7.x |
| Image Upload | Multer | 1.4.5-lts.1 |
| Testing (API) | Jest + Supertest | 29.x / 7.x |
| Testing (UI) | React Testing Library | 16.x |
