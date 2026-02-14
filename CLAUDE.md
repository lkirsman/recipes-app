# spec-kit-recipes Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-14

## Active Technologies

- Node.js 20 LTS (backend), JavaScript/JSX (frontend) + Express 4.19.x, Mongoose 8.x, React 18.x, React Router 7.x, Axios 1.7.x, Multer 1.4.5-lts.1, CORS 2.8.5 (001-recipes-app)
- MongoDB (Mongoose ODM) — recipes stored as documents with embedded ingredients/steps, images as Buffer (001-recipes-app)

## Project Structure

```text
server/
├── models/
├── routes/
├── controllers/
├── middleware/
├── config/
└── server.js

client/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── vite.config.js

tests/
├── server/
└── client/
```

## Commands

npm test; npm run lint

## Code Style

JavaScript/TypeScript: Follow standard conventions

## Recent Changes

- 001-recipes-app: Added Node.js 20 LTS (backend), JavaScript/JSX (frontend) + Express 4.19.x, Mongoose 8.x, React 18.x, React Router 7.x, Axios 1.7.x, Multer 1.4.5-lts.1, CORS 2.8.5

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
