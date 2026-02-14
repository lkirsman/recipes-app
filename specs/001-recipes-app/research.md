# Research: Recipes App

**Feature**: 001-recipes-app | **Date**: 2026-02-14

## Technology Stack Decisions

### Backend Framework: Express 4.19.x

- **Decision**: Use Express.js as the Node.js web framework
- **Rationale**: User-specified requirement. Express is the most mature and widely-used Node.js framework, ideal for REST APIs. Minimal overhead for a personal app.
- **Alternatives considered**: Fastify (faster but less ecosystem), Koa (lighter but less middleware), NestJS (over-engineered for this scope)

### Database ODM: Mongoose 8.x

- **Decision**: Use Mongoose as the MongoDB ODM
- **Rationale**: Provides schema validation, middleware hooks, and query builder. The embedded document pattern maps naturally to recipes with ingredients and steps.
- **Alternatives considered**: MongoDB native driver (no schema validation), Prisma (less mature MongoDB support)

### Frontend Framework: React 18.x with Vite

- **Decision**: Use React with Vite as the build tool
- **Rationale**: User-specified React requirement. Vite offers fast HMR and minimal config. React 18 provides stable concurrent features.
- **Alternatives considered**: Create React App (deprecated/unmaintained), Next.js (SSR unnecessary for personal app)

### Routing: React Router 7.x

- **Decision**: Use React Router v7 with `createBrowserRouter`
- **Rationale**: Latest stable version with improved bundle size (~15% smaller than v6). Modern data router pattern.
- **Alternatives considered**: TanStack Router (newer, less community adoption), React Router v6 (older)

### State Management: React Context API + useReducer

- **Decision**: Use React Context with useReducer for global recipe state
- **Rationale**: Single-user CRUD app with straightforward state. Redux/Zustand add unnecessary complexity. Context + useReducer provides sufficient state management with no extra dependencies.
- **Alternatives considered**: Redux Toolkit (overkill), Zustand (unnecessary dependency), local state only (insufficient for cross-component recipe list)

### HTTP Client: Axios 1.7.x

- **Decision**: Use Axios for frontend API calls
- **Rationale**: Better error handling, request/response interceptors, automatic JSON transforms. FormData support for image uploads is cleaner than fetch.
- **Alternatives considered**: Native fetch (more verbose, less error handling)

## Architecture Decisions

### Image Storage: MongoDB Buffer (not GridFS)

- **Decision**: Store images as Buffer type directly in the recipe document
- **Rationale**: Max image size is 5MB. MongoDB document limit is 16MB. Buffer is more efficient than Base64 string (~33% smaller). GridFS is designed for files >16MB and adds unnecessary complexity.
- **Upload flow**: Multer memory storage → `req.file.buffer` → Mongoose Buffer field
- **Serving flow**: Convert Buffer to Base64 string in API response → `data:image/...;base64,...` in `<img>` tag

### Image Upload: Multer with Memory Storage

- **Decision**: Use Multer with `memoryStorage()` for handling multipart form uploads
- **Rationale**: No need to write to disk since images go directly to MongoDB. Memory storage keeps the upload in buffer, which maps directly to the Mongoose Buffer field.
- **Config**: 5MB file size limit, image MIME type filter, single file upload per request

### MongoDB Schema: Embedded Document Pattern

- **Decision**: Embed ingredients and steps arrays directly in the Recipe document
- **Rationale**: Classic "one-to-few" relationship. Ingredients and steps are always accessed with their parent recipe, never independently. No cross-document queries needed.
- **Schema structure**: Single `Recipe` collection with embedded `ingredients[]` and `steps[]` arrays

### Search: MongoDB Text Index + Filter Queries

- **Decision**: Use MongoDB text index on `title` field for search, compound index on `categories` and `difficulty` for filters
- **Rationale**: Text index provides stemming and relevance scoring. Combined with `$in` operator for category OR logic and exact match for difficulty. Performant for ~100 recipes.
- **Alternatives considered**: Regex-only (slower, no relevance scoring), Elasticsearch (massive overkill)

### Category Tags: Predefined Array Constant

- **Decision**: Store categories as a constant array in a shared config. Each recipe stores selected category strings in an array field.
- **Rationale**: User specified predefined taxonomy (Dessert, Italian, Mexican, Breakfast, Lunch, Main Course, Starter, Salad). Developer-managed, not user-extensible at runtime.

### Testing Strategy

- **Decision**: Jest + Supertest for API tests, React Testing Library for component tests
- **Rationale**: Jest is the standard Node.js test runner. Supertest integrates directly with Express for HTTP assertion testing. React Testing Library focuses on user-facing behavior testing.
- **Scope**: API integration tests for all CRUD endpoints + search/filter. Component unit tests for RecipeCard, RecipeForm, and SearchBar.

## Visual Design Decisions

### Tuscany Vintage Color Palette

- **Primary colors**:
  - Terracotta: `#C45B28` (buttons, accents, active states)
  - Olive Green: `#5C6B3C` (secondary actions, tags)
  - Warm Cream: `#F5F0E8` (backgrounds)
  - Muted Gold: `#C4A35A` (highlights, borders)
  - Deep Burgundy: `#6B2D3E` (headings, emphasis)
- **Typography**:
  - Headings: Serif font (Playfair Display or similar)
  - Body text: Clean readable font (Lato or Source Sans Pro)
- **Textures**: Subtle paper/parchment texture on backgrounds for vintage feel
