const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getCategories
} = require('../controllers/recipeController');

router.get('/recipes', getAllRecipes);
router.get('/recipes/:id', getRecipeById);
router.post('/recipes', upload.single('image'), createRecipe);
router.put('/recipes/:id', upload.single('image'), updateRecipe);
router.delete('/recipes/:id', deleteRecipe);
router.get('/categories', getCategories);

module.exports = router;
