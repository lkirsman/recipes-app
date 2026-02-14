const Recipe = require('../models/Recipe');
const CATEGORIES = require('../config/categories');

// Best-effort parse ingredient text into structured fields
function parseQuantity(str) {
  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 2) {
      const num = parseFloat(parts[0]);
      const den = parseFloat(parts[1]);
      if (!isNaN(num) && !isNaN(den) && den !== 0) return num / den;
    }
    return NaN;
  }
  return parseFloat(str);
}

function parseIngredient(text) {
  const ingredient = { text: text.trim() };
  // Match patterns like "2 cups flour", "1/2 tsp salt", "3.5 oz chicken"
  const match = ingredient.text.match(/^([\d./]+)\s+(\w+)\s+(.+)$/);
  if (match) {
    const qty = parseQuantity(match[1]);
    if (!isNaN(qty)) {
      ingredient.quantity = qty;
      ingredient.unit = match[2];
      ingredient.name = match[3];
    }
  }
  return ingredient;
}

// Convert image Buffer to Base64 for JSON response
function recipeToJSON(recipe) {
  const obj = recipe.toObject();
  if (obj.image) {
    obj.image = obj.image.toString('base64');
  }
  return obj;
}

// Convert for listing (exclude ingredients and steps)
function recipeToSummary(recipe) {
  const obj = recipe.toObject();
  if (obj.image) {
    obj.image = obj.image.toString('base64');
  }
  delete obj.ingredients;
  delete obj.steps;
  return obj;
}

const getAllRecipes = async (req, res) => {
  try {
    const { search, categories, difficulty, sort } = req.query;
    const query = {};

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (categories) {
      const categoryList = categories.split(',').map(c => c.trim());
      query.categories = { $in: categoryList };
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    let sortOption = { updatedAt: -1 }; // default: newest (by last updated)
    if (sort === 'alphabetical') {
      sortOption = { title: 1 };
    }

    const recipes = await Recipe.find(query)
      .select('-ingredients -steps')
      .sort(sortOption);

    const result = recipes.map(r => {
      const obj = r.toObject();
      if (obj.image) {
        obj.image = obj.image.toString('base64');
      }
      return obj;
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(recipeToJSON(recipe));
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    console.error('Error fetching recipe:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createRecipe = async (req, res) => {
  try {
    const { title, prepTime, servings, difficulty } = req.body;

    // Parse JSON string fields from multipart form data
    let ingredients, steps, categories;
    try {
      ingredients = JSON.parse(req.body.ingredients || '[]');
    } catch {
      return res.status(400).json({ error: 'Validation failed', details: { ingredients: 'Invalid ingredients format' } });
    }
    try {
      steps = JSON.parse(req.body.steps || '[]');
    } catch {
      return res.status(400).json({ error: 'Validation failed', details: { steps: 'Invalid steps format' } });
    }
    try {
      categories = JSON.parse(req.body.categories || '[]');
    } catch {
      return res.status(400).json({ error: 'Validation failed', details: { categories: 'Invalid categories format' } });
    }

    // Parse ingredient text strings into structured objects
    const parsedIngredients = ingredients.map(ing => {
      if (typeof ing === 'string') {
        return parseIngredient(ing);
      }
      return ing;
    });

    // Parse step strings into structured objects with step numbers
    const parsedSteps = steps.map((step, index) => {
      if (typeof step === 'string') {
        return { stepNumber: index + 1, description: step };
      }
      return { ...step, stepNumber: step.stepNumber || index + 1 };
    });

    const recipeData = {
      title,
      ingredients: parsedIngredients,
      steps: parsedSteps,
      prepTime: Number(prepTime),
      servings: Number(servings),
      difficulty,
      categories,
    };

    // Attach image if uploaded
    if (req.file) {
      recipeData.image = req.file.buffer;
      recipeData.imageContentType = req.file.mimetype;
    }

    const recipe = new Recipe(recipeData);
    await recipe.save();

    res.status(201).json(recipeToJSON(recipe));
  } catch (error) {
    if (error.name === 'ValidationError') {
      const details = {};
      for (const field in error.errors) {
        details[field] = error.errors[field].message;
      }
      return res.status(400).json({ error: 'Validation failed', details });
    }
    console.error('Error creating recipe:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const { title, prepTime, servings, difficulty, removeImage } = req.body;

    if (title !== undefined) recipe.title = title;
    if (prepTime !== undefined) recipe.prepTime = Number(prepTime);
    if (servings !== undefined) recipe.servings = Number(servings);
    if (difficulty !== undefined) recipe.difficulty = difficulty;

    if (req.body.ingredients) {
      try {
        const ingredients = JSON.parse(req.body.ingredients);
        recipe.ingredients = ingredients.map(ing => {
          if (typeof ing === 'string') return parseIngredient(ing);
          return ing;
        });
      } catch {
        return res.status(400).json({ error: 'Validation failed', details: { ingredients: 'Invalid ingredients format' } });
      }
    }

    if (req.body.steps) {
      try {
        const steps = JSON.parse(req.body.steps);
        recipe.steps = steps.map((step, index) => {
          if (typeof step === 'string') return { stepNumber: index + 1, description: step };
          return { ...step, stepNumber: step.stepNumber || index + 1 };
        });
      } catch {
        return res.status(400).json({ error: 'Validation failed', details: { steps: 'Invalid steps format' } });
      }
    }

    if (req.body.categories) {
      try {
        recipe.categories = JSON.parse(req.body.categories);
      } catch {
        return res.status(400).json({ error: 'Validation failed', details: { categories: 'Invalid categories format' } });
      }
    }

    // Handle image: new upload replaces, removeImage flag clears
    if (req.file) {
      recipe.image = req.file.buffer;
      recipe.imageContentType = req.file.mimetype;
    } else if (removeImage === 'true') {
      recipe.image = undefined;
      recipe.imageContentType = undefined;
    }

    await recipe.save();
    res.json(recipeToJSON(recipe));
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    if (error.name === 'ValidationError') {
      const details = {};
      for (const field in error.errors) {
        details[field] = error.errors[field].message;
      }
      return res.status(400).json({ error: 'Validation failed', details });
    }
    console.error('Error updating recipe:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    console.error('Error deleting recipe:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCategories = (req, res) => {
  res.json(CATEGORIES);
};

module.exports = {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getCategories
};
