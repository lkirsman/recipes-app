import { useState, useEffect } from 'react';
import { getCategories } from '../../services/recipeService';
import './RecipeForm.css';

function RecipeForm({ initialData, onSubmit, submitLabel = 'Save Recipe' }) {
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  const [steps, setSteps] = useState(['']);
  const [prepTime, setPrepTime] = useState('');
  const [servings, setServings] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCategories().then(setAvailableCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setIngredients(
        initialData.ingredients?.length
          ? initialData.ingredients.map(i => i.text || '')
          : ['']
      );
      setSteps(
        initialData.steps?.length
          ? initialData.steps.map(s => s.description || '')
          : ['']
      );
      setPrepTime(initialData.prepTime?.toString() || '');
      setServings(initialData.servings?.toString() || '');
      setDifficulty(initialData.difficulty || '');
      setSelectedCategories(initialData.categories || []);
      if (initialData.image && initialData.imageContentType) {
        setImagePreview(`data:${initialData.imageContentType};base64,${initialData.image}`);
      }
    }
  }, [initialData]);

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (title.length > 150) errs.title = 'Title cannot exceed 150 characters';
    if (ingredients.every(i => !i.trim())) errs.ingredients = 'At least one ingredient is required';
    if (steps.every(s => !s.trim())) errs.steps = 'At least one step is required';
    if (!prepTime || Number(prepTime) < 1) errs.prepTime = 'Preparation time must be a positive number';
    if (!servings || Number(servings) < 1 || !Number.isInteger(Number(servings))) errs.servings = 'Servings must be a positive whole number';
    if (!difficulty) errs.difficulty = 'Difficulty level is required';
    if (selectedCategories.length === 0) errs.categories = 'At least one category is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('ingredients', JSON.stringify(ingredients.filter(i => i.trim())));
    formData.append('steps', JSON.stringify(steps.filter(s => s.trim())));
    formData.append('prepTime', prepTime);
    formData.append('servings', servings);
    formData.append('difficulty', difficulty);
    formData.append('categories', JSON.stringify(selectedCategories));
    if (imageFile) {
      formData.append('image', imageFile);
    }
    if (removeImage) {
      formData.append('removeImage', 'true');
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      if (error.response?.data?.details) {
        setErrors(error.response.data.details);
      } else {
        setErrors({ form: error.response?.data?.error || 'Something went wrong' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image must be under 5MB' }));
        return;
      }
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Only image files are allowed' }));
        return;
      }
      setImageFile(file);
      setRemoveImage(false);
      setErrors(prev => { const { image, ...rest } = prev; return rest; });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
  };

  const addIngredient = () => setIngredients([...ingredients, '']);
  const removeIngredient = (index) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };
  const updateIngredient = (index, value) => {
    const updated = [...ingredients];
    updated[index] = value;
    setIngredients(updated);
  };

  const addStep = () => setSteps([...steps, '']);
  const removeStep = (index) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };
  const updateStep = (index, value) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };
  const moveStep = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= steps.length) return;
    const updated = [...steps];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setSteps(updated);
  };

  const toggleCategory = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  return (
    <form className="recipe-form" onSubmit={handleSubmit}>
      {errors.form && <div className="form-error form-error-top">{errors.form}</div>}

      {/* Title */}
      <div className="form-group">
        <label className="form-label" htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          className={`form-input ${errors.title ? 'error' : ''}`}
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={150}
          placeholder="Recipe title"
        />
        {errors.title && <div className="form-error">{errors.title}</div>}
        <div className="char-count">{title.length}/150</div>
      </div>

      {/* Ingredients */}
      <div className="form-group">
        <label className="form-label">Ingredients</label>
        {ingredients.map((ing, i) => (
          <div key={i} className="dynamic-field">
            <input
              type="text"
              className={`form-input ${errors.ingredients ? 'error' : ''}`}
              value={ing}
              onChange={e => updateIngredient(i, e.target.value)}
              placeholder={`e.g. 2 cups flour`}
            />
            {ingredients.length > 1 && (
              <button type="button" className="btn-icon btn-remove" onClick={() => removeIngredient(i)} aria-label="Remove ingredient">&times;</button>
            )}
          </div>
        ))}
        <button type="button" className="btn btn-sm btn-outline" onClick={addIngredient}>+ Add Ingredient</button>
        {errors.ingredients && <div className="form-error">{errors.ingredients}</div>}
      </div>

      {/* Steps */}
      <div className="form-group">
        <label className="form-label">Steps</label>
        {steps.map((step, i) => (
          <div key={i} className="dynamic-field step-field">
            <span className="step-number">{i + 1}.</span>
            <textarea
              className={`form-textarea ${errors.steps ? 'error' : ''}`}
              value={step}
              onChange={e => updateStep(i, e.target.value)}
              placeholder={`Describe step ${i + 1}`}
              rows={2}
            />
            <div className="step-actions">
              {i > 0 && (
                <button type="button" className="btn-icon" onClick={() => moveStep(i, -1)} aria-label="Move up">&#8593;</button>
              )}
              {i < steps.length - 1 && (
                <button type="button" className="btn-icon" onClick={() => moveStep(i, 1)} aria-label="Move down">&#8595;</button>
              )}
              {steps.length > 1 && (
                <button type="button" className="btn-icon btn-remove" onClick={() => removeStep(i)} aria-label="Remove step">&times;</button>
              )}
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-sm btn-outline" onClick={addStep}>+ Add Step</button>
        {errors.steps && <div className="form-error">{errors.steps}</div>}
      </div>

      {/* Prep Time & Servings */}
      <div className="form-row">
        <div className="form-group form-group-half">
          <label className="form-label" htmlFor="prepTime">Prep Time (minutes)</label>
          <input
            id="prepTime"
            type="number"
            className={`form-input ${errors.prepTime ? 'error' : ''}`}
            value={prepTime}
            onChange={e => setPrepTime(e.target.value)}
            min="1"
            placeholder="30"
          />
          {errors.prepTime && <div className="form-error">{errors.prepTime}</div>}
        </div>
        <div className="form-group form-group-half">
          <label className="form-label" htmlFor="servings">Servings</label>
          <input
            id="servings"
            type="number"
            className={`form-input ${errors.servings ? 'error' : ''}`}
            value={servings}
            onChange={e => setServings(e.target.value)}
            min="1"
            step="1"
            placeholder="4"
          />
          {errors.servings && <div className="form-error">{errors.servings}</div>}
        </div>
      </div>

      {/* Difficulty */}
      <div className="form-group">
        <label className="form-label" htmlFor="difficulty">Difficulty</label>
        <select
          id="difficulty"
          className={`form-select ${errors.difficulty ? 'error' : ''}`}
          value={difficulty}
          onChange={e => setDifficulty(e.target.value)}
        >
          <option value="">Select difficulty</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        {errors.difficulty && <div className="form-error">{errors.difficulty}</div>}
      </div>

      {/* Categories */}
      <div className="form-group">
        <label className="form-label">Categories</label>
        <div className="category-checkboxes">
          {availableCategories.map(cat => (
            <label key={cat} className={`category-checkbox ${selectedCategories.includes(cat) ? 'selected' : ''}`}>
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
              />
              <span>{cat}</span>
            </label>
          ))}
        </div>
        {errors.categories && <div className="form-error">{errors.categories}</div>}
      </div>

      {/* Image */}
      <div className="form-group">
        <label className="form-label">Image (optional)</label>
        {imagePreview && (
          <div className="image-preview-container">
            <img src={imagePreview} alt="Preview" className="image-preview" />
            <button type="button" className="btn btn-sm btn-danger" onClick={handleRemoveImage}>Remove Image</button>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="form-input-file"
        />
        {errors.image && <div className="form-error">{errors.image}</div>}
      </div>

      <button type="submit" className="btn btn-primary btn-submit" disabled={submitting}>
        {submitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}

export default RecipeForm;
