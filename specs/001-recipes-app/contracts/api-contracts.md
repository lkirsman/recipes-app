# API Contracts: Recipes App

**Feature**: 001-recipes-app | **Date**: 2026-02-14
**Base URL**: `/api`

## Endpoints Overview

| Method | Endpoint | Description | Spec Ref |
|--------|----------|-------------|----------|
| GET | `/api/recipes` | List all recipes (with search, filter, sort) | FR-003, FR-015, FR-016, FR-017, FR-020 |
| GET | `/api/recipes/:id` | Get single recipe details | FR-004 |
| POST | `/api/recipes` | Create a new recipe | FR-001, FR-002 |
| PUT | `/api/recipes/:id` | Update an existing recipe | FR-005 |
| DELETE | `/api/recipes/:id` | Delete a recipe | FR-006 |
| GET | `/api/categories` | Get predefined category list | FR-010 |

---

## GET /api/recipes

List all recipes with optional search, filter, and sort.

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | string | No | Search term to match against recipe title (text search) |
| `categories` | string | No | Comma-separated category names to filter by (OR logic). E.g., `Italian,Dessert` |
| `difficulty` | string | No | Filter by difficulty level: `Easy`, `Medium`, or `Hard` |
| `sort` | string | No | Sort order: `newest` (default) or `alphabetical` |

**Response** `200 OK`:

```json
[
  {
    "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
    "title": "Margherita Pizza",
    "categories": ["Italian", "Main Course"],
    "prepTime": 45,
    "servings": 4,
    "difficulty": "Medium",
    "image": "<base64-encoded-string or null>",
    "imageContentType": "image/jpeg",
    "createdAt": "2026-02-14T10:30:00.000Z"
  }
]
```

**Note**: The listing response includes Base64 image data for card thumbnails. Steps and ingredients are excluded to reduce payload size.

---

## GET /api/recipes/:id

Get complete details for a single recipe.

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId of the recipe |

**Response** `200 OK`:

```json
{
  "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
  "title": "Margherita Pizza",
  "ingredients": [
    {
      "text": "2 cups flour",
      "quantity": 2,
      "unit": "cups",
      "name": "flour"
    },
    {
      "text": "1 cup mozzarella",
      "quantity": 1,
      "unit": "cup",
      "name": "mozzarella"
    }
  ],
  "steps": [
    { "stepNumber": 1, "description": "Preheat oven to 450°F" },
    { "stepNumber": 2, "description": "Roll out the dough" },
    { "stepNumber": 3, "description": "Add sauce and toppings" }
  ],
  "prepTime": 45,
  "servings": 4,
  "difficulty": "Medium",
  "categories": ["Italian", "Main Course"],
  "image": "<base64-encoded-string or null>",
  "imageContentType": "image/jpeg",
  "createdAt": "2026-02-14T10:30:00.000Z",
  "updatedAt": "2026-02-14T10:30:00.000Z"
}
```

**Error** `404 Not Found`:

```json
{ "error": "Recipe not found" }
```

---

## POST /api/recipes

Create a new recipe. Uses `multipart/form-data` for image upload.

**Request** (`multipart/form-data`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Recipe title (max 150 chars) |
| `ingredients` | string (JSON) | Yes | JSON array of ingredient text strings. E.g., `["2 cups flour", "1 cup water"]` |
| `steps` | string (JSON) | Yes | JSON array of step description strings. E.g., `["Mix flour", "Add water"]` |
| `prepTime` | number | Yes | Preparation time in minutes |
| `servings` | number | Yes | Number of servings (positive integer) |
| `difficulty` | string | Yes | One of: `Easy`, `Medium`, `Hard` |
| `categories` | string (JSON) | Yes | JSON array of category strings. E.g., `["Italian", "Main Course"]` |
| `image` | file | No | Image file (max 5MB, image/* MIME types) |

**Response** `201 Created`:

```json
{
  "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
  "title": "Margherita Pizza",
  "ingredients": [...],
  "steps": [...],
  "prepTime": 45,
  "servings": 4,
  "difficulty": "Medium",
  "categories": ["Italian", "Main Course"],
  "createdAt": "2026-02-14T10:30:00.000Z"
}
```

**Error** `400 Bad Request`:

```json
{
  "error": "Validation failed",
  "details": {
    "title": "Title is required",
    "ingredients": "At least one ingredient is required"
  }
}
```

---

## PUT /api/recipes/:id

Update an existing recipe. Uses `multipart/form-data` for optional image replacement.

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId of the recipe |

**Request** (`multipart/form-data`): Same fields as POST. All fields are optional — only provided fields are updated. To remove an image, send `removeImage=true`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `removeImage` | string | No | Set to `"true"` to remove the existing image |
| *(other fields)* | — | No | Same as POST — only include fields to update |

**Response** `200 OK`: Returns the full updated recipe object (same shape as GET /:id).

**Error** `404 Not Found`:

```json
{ "error": "Recipe not found" }
```

**Error** `400 Bad Request`: Same shape as POST validation errors.

---

## DELETE /api/recipes/:id

Permanently delete a recipe.

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId of the recipe |

**Response** `200 OK`:

```json
{ "message": "Recipe deleted successfully" }
```

**Error** `404 Not Found`:

```json
{ "error": "Recipe not found" }
```

---

## GET /api/categories

Get the predefined list of available category tags.

**Response** `200 OK`:

```json
["Dessert", "Italian", "Mexican", "Breakfast", "Lunch", "Main Course", "Starter", "Salad"]
```

---

## Common Error Responses

**500 Internal Server Error** (all endpoints):

```json
{ "error": "Internal server error" }
```

Returned when database connection fails or an unexpected error occurs. The frontend should display a user-friendly "service unavailable" message.

## Request/Response Conventions

- **Content-Type**: `multipart/form-data` for POST/PUT (due to image upload), `application/json` for all responses
- **JSON arrays in form data**: Ingredients, steps, and categories are sent as JSON strings within form fields and parsed server-side
- **Image encoding**: Images are returned as Base64-encoded strings in JSON responses with their MIME type
- **Timestamps**: ISO 8601 format, managed by Mongoose `timestamps: true`
- **IDs**: MongoDB ObjectId strings
