# Tasks: Recipes App

**Input**: Design documents from `/specs/001-recipes-app/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-contracts.md, quickstart.md

**Tests**: Not explicitly requested in the feature specification. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependency installation, and folder scaffolding

- [x] T001 Initialize server project: run `npm init -y` in `server/` and install dependencies (express, mongoose, cors, multer, dotenv) per `quickstart.md`
- [x] T002 Initialize client project: run `npm create vite@latest client -- --template react` and install dependencies (axios, react-router-dom) per `quickstart.md`
- [x] T003 [P] Create `server/.env` with MONGODB_URI placeholder and PORT=5000
- [x] T004 [P] Create `client/.env` with VITE_API_URL=http://localhost:5000/api
- [x] T005 [P] Configure Vite API proxy for `/api` in `client/vite.config.js` per `quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**Note**: US7 (Tuscany Vintage Visual Style) is a cross-cutting concern. The base styling is established here so all subsequent components are built with the correct visual identity from the start.

- [x] T006 Create MongoDB connection module in `server/config/db.js` using Mongoose with connection string from env, including error handling for unavailable database
- [x] T007 Create Recipe Mongoose schema and model in `server/models/Recipe.js` with all fields from data-model.md: title (String, max 150, required), ingredients ([{text, quantity, unit, name}], min 1), steps ([{stepNumber, description}], min 1), prepTime (Number, positive, required), servings (Number, positive integer, required), difficulty (enum: Easy/Medium/Hard, required), image (Buffer), imageContentType (String), categories ([String], min 1, validated against predefined taxonomy). Enable timestamps. Add text index on title and compound index on categories+difficulty
- [x] T008 Create predefined categories constant in `server/config/categories.js` exporting the array: ["Dessert", "Italian", "Mexican", "Breakfast", "Lunch", "Main Course", "Starter", "Salad"]
- [x] T009 [P] Create Multer upload middleware in `server/middleware/upload.js` with memoryStorage, 5MB file size limit, and image MIME type filter per research.md
- [x] T010 Create Express app entry point in `server/server.js` with CORS, JSON body parser (10mb limit), route mounting at `/api`, MongoDB connection on startup, and global error handler
- [x] T011 Create recipe routes file in `server/routes/recipes.js` with route stubs for all 6 endpoints from api-contracts.md (GET /, GET /:id, POST /, PUT /:id, DELETE /:id) and category route (GET /categories)
- [x] T012 Create recipe controller file in `server/controllers/recipeController.js` with exported handler stubs for: getAllRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe, getCategories
- [x] T013 [P] [US7] Create Tuscany vintage global stylesheet in `client/src/App.css` with CSS custom properties for the color palette (terracotta #C45B28, olive green #5C6B3C, warm cream #F5F0E8, muted gold #C4A35A, deep burgundy #6B2D3E), Google Fonts import for Playfair Display (headings) and Lato (body), subtle parchment background texture, and base typography styles
- [x] T014 [P] [US7] Create shared Layout component in `client/src/components/Layout/Layout.jsx` and `Layout.css` with app header (app name in Tuscany styling), navigation links (Home, Create Recipe), and content wrapper with consistent padding and max-width
- [x] T015 Create React app entry point with router in `client/src/App.jsx` using createBrowserRouter from react-router-dom v7 with routes: / (listing), /recipes/new (create), /recipes/:id (detail), /recipes/:id/edit (edit). Wrap in Layout component. Import App.css
- [x] T016 Create API service module in `client/src/services/recipeService.js` using Axios with base URL from VITE_API_URL env var. Export functions: getAllRecipes(params), getRecipeById(id), createRecipe(formData), updateRecipe(id, formData), deleteRecipe(id), getCategories()

**Checkpoint**: Foundation ready — server runs, client runs, database connects, Tuscany styling applied, routing configured. User story implementation can now begin.

---

## Phase 3: User Story 1 — Create a Recipe (Priority: P1) MVP

**Goal**: User can fill out a recipe form with all required fields and save it to the database

**Independent Test**: Open the creation form, fill in all fields (title, ingredients, steps, prep time, servings, difficulty, categories, optional image), submit, and verify the recipe is saved in MongoDB

### Implementation for User Story 1

- [x] T017 [US1] Implement `createRecipe` handler in `server/controllers/recipeController.js`: parse multipart form data (JSON strings for ingredients/steps/categories), validate all required fields per FR-002, validate categories against predefined taxonomy, validate title max 150 chars (FR-013), validate servings is positive (FR-019), prevent duplicate category tags (FR-014), parse ingredient text into structured fields (quantity/unit/name) best-effort, store image buffer and content type if provided, save to MongoDB, return 201 with created recipe or 400 with validation details
- [x] T018 [US1] Wire POST `/api/recipes` route in `server/routes/recipes.js` with Multer `upload.single('image')` middleware to the createRecipe controller handler
- [x] T019 [US1] Implement `getCategories` handler in `server/controllers/recipeController.js` returning the predefined categories array, and wire GET `/api/categories` route in `server/routes/recipes.js`
- [x] T020 [US1] Create RecipeForm component in `client/src/components/RecipeForm/RecipeForm.jsx` and `RecipeForm.css` with Tuscany-styled form fields: title input (text, max 150), dynamic ingredient list (add/remove text inputs, min 1), dynamic step list (add/remove/reorder text areas, min 1, numbered sequentially), prep time input (number, minutes), servings input (number, positive), difficulty select (Easy/Medium/Hard), category multi-select checkboxes from predefined taxonomy (fetched via getCategories API), image file upload with preview, and form-level validation displaying error messages for missing required fields
- [x] T021 [US1] Create CreateRecipePage in `client/src/pages/CreateRecipePage.jsx` that renders RecipeForm in create mode, calls recipeService.createRecipe on submit with FormData (image as file, ingredients/steps/categories as JSON strings), shows success confirmation, and navigates to the recipe listing on success

**Checkpoint**: User can create recipes with all fields. This is the MVP — the core data entry flow works end-to-end.

---

## Phase 4: User Story 2 — View All Recipes (Priority: P1)

**Goal**: User sees a card grid of all recipes showing image/placeholder, title, categories, and prep time with sort toggle

**Independent Test**: Navigate to the listing page and verify all created recipes appear as cards with correct info, placeholder for missing images, empty state when no recipes exist, and sort toggle works

### Implementation for User Story 2

- [x] T022 [US2] Implement `getAllRecipes` handler in `server/controllers/recipeController.js`: query MongoDB for all recipes, support `sort` query param (newest/alphabetical per FR-020, default newest), convert image Buffer to Base64 string in response, exclude ingredients and steps from listing response for performance, return 200 with array of recipe summaries
- [x] T023 [US2] Wire GET `/api/recipes` route in `server/routes/recipes.js` to the getAllRecipes controller handler
- [x] T024 [US2] Create RecipeCard component in `client/src/components/RecipeCard/RecipeCard.jsx` and `RecipeCard.css` with Tuscany-styled card displaying: recipe image (or vintage-style placeholder if none), title, category tags as styled pills, and prep time. Card is clickable (links to detail page)
- [x] T025 [US2] Create RecipeListPage in `client/src/pages/RecipeListPage.jsx` and `RecipeListPage.css` that fetches recipes via recipeService.getAllRecipes, renders a responsive card grid of RecipeCard components, includes a sort toggle control (newest first / alphabetical A-Z), shows a Tuscany-styled empty state message with link to create first recipe when no recipes exist (FR-012), and a "Create Recipe" action button

**Checkpoint**: User can create recipes (US1) and see them in a browsable card grid (US2). Both stories work independently.

---

## Phase 5: User Story 3 — Search and Filter Recipes (Priority: P2)

**Goal**: User can search recipes by title and filter by category (OR logic) and difficulty level

**Independent Test**: Create several recipes with varied titles/categories/difficulty, use the search bar and filter controls to verify correct filtering, combining search+filters, and clearing filters

### Implementation for User Story 3

- [x] T026 [US3] Extend `getAllRecipes` handler in `server/controllers/recipeController.js` to support query params: `search` (MongoDB text search on title), `categories` (comma-separated, $in operator for OR logic per FR-016), `difficulty` (exact match per FR-017). Build compound query combining all active filters
- [x] T027 [US3] Create SearchBar component in `client/src/components/SearchBar/SearchBar.jsx` and `SearchBar.css` with Tuscany-styled controls: text search input with debounce for live filtering, category filter as multi-select checkboxes/pills from predefined taxonomy, difficulty filter dropdown (All/Easy/Medium/Hard), and a clear-all-filters button
- [x] T028 [US3] Integrate SearchBar into RecipeListPage in `client/src/pages/RecipeListPage.jsx`: add SearchBar above the recipe grid, pass search/filter/sort params to recipeService.getAllRecipes on every change, show "no recipes match" friendly message when filtered results are empty (distinct from empty-state when no recipes exist at all)

**Checkpoint**: User can search and filter their recipe collection. Works with US1+US2 data.

---

## Phase 6: User Story 4 — View Recipe Details (Priority: P2)

**Goal**: User can click a recipe card to see all details on a dedicated page

**Independent Test**: Click a recipe in the listing, verify the detail page shows all fields: title, full-size image, ingredients, numbered steps, prep time, servings, difficulty, categories, and back navigation works

### Implementation for User Story 4

- [x] T029 [US4] Implement `getRecipeById` handler in `server/controllers/recipeController.js`: find recipe by ObjectId, convert image Buffer to Base64, return 200 with full recipe object (including ingredients and steps), or 404 if not found
- [x] T030 [US4] Wire GET `/api/recipes/:id` route in `server/routes/recipes.js` to the getRecipeById controller handler
- [x] T031 [US4] Create RecipeDetailPage in `client/src/pages/RecipeDetailPage.jsx` and `RecipeDetailPage.css` with Tuscany-styled detail view: full-size image (or placeholder), title as large heading, category tags as styled pills, prep time and servings info bar, difficulty badge, numbered step-by-step instructions, ingredient list, back-to-listing navigation link, and edit/delete action buttons (wired in later stories)

**Checkpoint**: Full read flow works: create → browse listing → view details.

---

## Phase 7: User Story 5 — Edit a Recipe (Priority: P2)

**Goal**: User can edit any recipe field and save changes

**Independent Test**: Navigate to a recipe detail, click edit, modify fields, save, verify changes persist. Also test cancel (no changes saved) and validation (required field cleared)

### Implementation for User Story 5

- [x] T032 [US5] Implement `updateRecipe` handler in `server/controllers/recipeController.js`: find recipe by ObjectId, parse multipart form data, apply only provided fields (partial update), support `removeImage` flag to clear image, re-validate all constraints (title max 150, categories from taxonomy, servings positive, min 1 ingredient/step, no duplicate categories), update timestamps, return 200 with updated recipe or 404/400 on error
- [x] T033 [US5] Wire PUT `/api/recipes/:id` route in `server/routes/recipes.js` with Multer `upload.single('image')` middleware to the updateRecipe controller handler
- [x] T034 [US5] Create EditRecipePage in `client/src/pages/EditRecipePage.jsx` that fetches the existing recipe via recipeService.getRecipeById, renders RecipeForm in edit mode (pre-filled with current values including existing image preview), calls recipeService.updateRecipe on submit, and supports cancel (navigate back without saving). Handle 404 gracefully
- [x] T035 [US5] Wire edit button on RecipeDetailPage in `client/src/pages/RecipeDetailPage.jsx` to navigate to `/recipes/:id/edit`

**Checkpoint**: Full CRUD minus delete: create → view → edit. RecipeForm reused for both create and edit.

---

## Phase 8: User Story 6 — Delete a Recipe (Priority: P3)

**Goal**: User can delete a recipe with a confirmation step

**Independent Test**: Navigate to a recipe detail, click delete, confirm in the dialog, verify the recipe is removed from the listing. Also test cancel (recipe remains)

### Implementation for User Story 6

- [x] T036 [US6] Implement `deleteRecipe` handler in `server/controllers/recipeController.js`: find and delete recipe by ObjectId, return 200 with success message or 404 if not found
- [x] T037 [US6] Wire DELETE `/api/recipes/:id` route in `server/routes/recipes.js` to the deleteRecipe controller handler
- [x] T038 [US6] Add delete flow to RecipeDetailPage in `client/src/pages/RecipeDetailPage.jsx`: delete button triggers a Tuscany-styled confirmation dialog/modal ("Are you sure you want to delete this recipe?"), on confirm calls recipeService.deleteRecipe and navigates to listing, on cancel closes the dialog

**Checkpoint**: Complete CRUD. All 6 user stories are functional.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Responsive design, edge case handling, and final UX refinements

- [x] T039 Add responsive CSS to all pages and components for mobile/tablet viewports in `client/src/App.css` and component CSS files
- [x] T040 Add loading states (spinner/skeleton) to RecipeListPage and RecipeDetailPage during API calls in `client/src/pages/RecipeListPage.jsx` and `client/src/pages/RecipeDetailPage.jsx`
- [x] T041 Add global API error handling in `client/src/services/recipeService.js` with Axios interceptor to display user-friendly "service unavailable" message when backend is unreachable
- [x] T042 Add image upload validation feedback on the client side in `client/src/components/RecipeForm/RecipeForm.jsx`: reject files over 5MB and non-image MIME types before upload, show error message
- [x] T043 Run quickstart.md validation: verify server starts on port 5000, client starts on port 5173, API proxy works, all endpoints return expected responses

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 Create (Phase 3)**: Depends on Foundational — first user story, MVP
- **US2 View All (Phase 4)**: Depends on Foundational — can run in parallel with US1 (but US1 provides data to verify)
- **US3 Search/Filter (Phase 5)**: Depends on US2 (extends listing page and getAllRecipes handler)
- **US4 View Detail (Phase 6)**: Depends on Foundational — can run in parallel with US1/US2
- **US5 Edit (Phase 7)**: Depends on US1 (reuses RecipeForm) and US4 (edit button on detail page)
- **US6 Delete (Phase 8)**: Depends on US4 (delete button on detail page)
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

```text
Phase 1: Setup
    ↓
Phase 2: Foundational + Tuscany Styling (US7)
    ↓
    ├── Phase 3: US1 Create Recipe (P1) ← MVP
    ├── Phase 4: US2 View All Recipes (P1) ← can parallel with US1
    │       ↓
    │   Phase 5: US3 Search & Filter (P2) ← extends US2
    │
    ├── Phase 6: US4 View Details (P2) ← can parallel with US1/US2
    │       ↓
    │   Phase 7: US5 Edit Recipe (P2) ← needs US1 form + US4 page
    │       ↓
    │   Phase 8: US6 Delete Recipe (P3) ← needs US4 page
    ↓
Phase 9: Polish
```

### Within Each User Story

- Backend handler before frontend page
- Route wiring immediately after handler
- Frontend components before page integration
- Controller logic before UI consumption

### Parallel Opportunities

**Phase 2 parallel tasks**:
- T009 (Multer middleware) can run in parallel with T013 (Tuscany CSS) and T014 (Layout component)

**Cross-story parallelism** (after Foundational):
- US1 (create) and US2 (listing) and US4 (detail) can start in parallel since they touch different controller handlers, routes, and pages
- US3 (search/filter) must wait for US2 (extends the listing page)
- US5 (edit) must wait for US1 (reuses RecipeForm) and US4 (edit button location)
- US6 (delete) must wait for US4 (delete button location)

---

## Parallel Example: Foundational Phase

```text
# These can run in parallel (different files):
T009: Create Multer upload middleware in server/middleware/upload.js
T013: Create Tuscany vintage stylesheet in client/src/App.css
T014: Create Layout component in client/src/components/Layout/
```

## Parallel Example: After Foundational

```text
# These user stories can start simultaneously:
US1: T017-T021 (Create Recipe — backend + frontend)
US2: T022-T025 (View All Recipes — backend + frontend)
US4: T029-T031 (View Details — backend + frontend)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 — Create a Recipe
4. **STOP and VALIDATE**: Create a recipe via the form and verify it saves to MongoDB
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Create) → Test independently → **MVP!**
3. Add US2 (View All) → Browse created recipes → Demo
4. Add US3 (Search/Filter) → Search and filter recipes → Demo
5. Add US4 (View Detail) → Click into recipe details → Demo
6. Add US5 (Edit) → Modify existing recipes → Demo
7. Add US6 (Delete) → Remove recipes → Demo
8. Polish → Responsive, loading states, error handling → Ship

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US7 (Tuscany styling) is embedded in Foundational phase since it's cross-cutting
- No test tasks generated — tests were not explicitly requested in the spec
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
