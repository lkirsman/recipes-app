const mongoose = require('mongoose');
const CATEGORIES = require('../config/categories');

const ingredientSchema = new mongoose.Schema({
  text: { type: String, required: true },
  quantity: { type: Number },
  unit: { type: String },
  name: { type: String }
}, { _id: false });

const stepSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true },
  description: { type: String, required: true }
}, { _id: false });

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    maxlength: [150, 'Title cannot exceed 150 characters'],
    trim: true
  },
  ingredients: {
    type: [ingredientSchema],
    validate: {
      validator: (v) => Array.isArray(v) && v.length > 0,
      message: 'At least one ingredient is required'
    }
  },
  steps: {
    type: [stepSchema],
    validate: {
      validator: (v) => Array.isArray(v) && v.length > 0,
      message: 'At least one step is required'
    }
  },
  prepTime: {
    type: Number,
    required: [true, 'Preparation time is required'],
    min: [1, 'Preparation time must be a positive number']
  },
  servings: {
    type: Number,
    required: [true, 'Servings is required'],
    min: [1, 'Servings must be a positive number'],
    validate: {
      validator: Number.isInteger,
      message: 'Servings must be a whole number'
    }
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty level is required'],
    enum: {
      values: ['Easy', 'Medium', 'Hard'],
      message: 'Difficulty must be Easy, Medium, or Hard'
    }
  },
  image: { type: Buffer },
  imageContentType: { type: String },
  categories: {
    type: [String],
    validate: [
      {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'At least one category is required'
      },
      {
        validator: (v) => v.every(cat => CATEGORIES.includes(cat)),
        message: 'All categories must be from the predefined taxonomy'
      },
      {
        validator: (v) => new Set(v).size === v.length,
        message: 'Duplicate categories are not allowed'
      }
    ]
  }
}, { timestamps: true });

recipeSchema.index({ title: 'text' });
recipeSchema.index({ categories: 1, difficulty: 1 });

module.exports = mongoose.model('Recipe', recipeSchema);
