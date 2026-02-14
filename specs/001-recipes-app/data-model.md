# Data Model: Recipes App

**Feature**: 001-recipes-app | **Date**: 2026-02-14

## Entities

### Recipe

The core entity. Stored as a single MongoDB document with embedded sub-documents for ingredients and steps.

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `_id` | ObjectId | Auto | MongoDB auto-generated | Unique identifier |
| `title` | String | Yes | Max 150 characters, non-empty | Recipe name |
| `ingredients` | [Ingredient] | Yes | At least 1 item | List of ingredients (embedded) |
| `steps` | [ProcessStep] | Yes | At least 1 item | Ordered cooking instructions (embedded) |
| `prepTime` | Number | Yes | Positive integer | Preparation time in minutes |
| `servings` | Number | Yes | Positive integer | Number of servings |
| `difficulty` | String | Yes | Enum: "Easy", "Medium", "Hard" | Difficulty level |
| `image` | Buffer | No | Max 5MB, image MIME types only | Recipe photo stored as binary |
| `imageContentType` | String | No | Valid MIME type (image/*) | MIME type of the uploaded image |
| `categories` | [String] | Yes | At least 1, from predefined taxonomy, no duplicates | Category tags |
| `createdAt` | Date | Auto | Auto-set on creation | Creation timestamp |
| `updatedAt` | Date | Auto | Auto-set on update | Last update timestamp |

**Indexes**:
- Text index on `title` (for search)
- Compound index on `categories` + `difficulty` (for filter queries)

### Ingredient (embedded sub-document)

Entered by the user as simple text, stored with structured fields for future flexibility.

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `text` | String | Yes | Non-empty | Original text as entered by user (e.g., "2 cups flour") |
| `quantity` | Number | No | Positive number if present | Parsed quantity (e.g., 2) |
| `unit` | String | No | — | Parsed unit (e.g., "cups") |
| `name` | String | No | — | Parsed ingredient name (e.g., "flour") |

**Note**: The `text` field is always populated (user input). The `quantity`, `unit`, and `name` fields are best-effort parsed for future use (shopping lists, unit conversion). If parsing fails, only `text` is stored.

### ProcessStep (embedded sub-document)

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `stepNumber` | Number | Yes | Positive integer, sequential | Order of the step |
| `description` | String | Yes | Non-empty | Instruction text for this step |

### Category Tag (predefined constant)

Not a separate collection. Stored as a constant array in application config.

**Initial taxonomy**: `["Dessert", "Italian", "Mexican", "Breakfast", "Lunch", "Main Course", "Starter", "Salad"]`

Each recipe's `categories` field contains an array of strings selected from this taxonomy. Validated against the predefined list on create/update.

## Relationships

```text
Recipe
  ├── has many → Ingredient (embedded, 1:N)
  ├── has many → ProcessStep (embedded, 1:N, ordered)
  └── has many → Category Tag (string array from predefined set, M:N)
```

All relationships are embedded within the Recipe document. No separate collections or foreign key references needed.

## State Transitions

Recipes have no formal state machine. They are simply created, updated, or deleted:

```text
[Not Exists] → CREATE → [Exists] → UPDATE → [Exists (modified)]
                                  → DELETE → [Not Exists]
```

## Data Volume Assumptions

- Expected: ~100 recipes maximum
- Average recipe document size: ~10KB without image, ~1-5MB with image
- Total database size estimate: ~500MB maximum (100 recipes with images)
- Single collection (`recipes`) with embedded documents
