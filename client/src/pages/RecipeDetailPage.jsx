import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getRecipeById, deleteRecipe } from '../services/recipeService';
import './RecipeDetailPage.css';

function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      try {
        const data = await getRecipeById(id);
        setRecipe(data);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Recipe not found.');
        } else {
          setError('Failed to load recipe.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteRecipe(id);
      navigate('/');
    } catch {
      setError('Failed to delete recipe.');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <h3>{error}</h3>
        <Link to="/" className="btn btn-primary">Back to Recipes</Link>
      </div>
    );
  }

  if (!recipe) return null;

  const imageUrl = recipe.image && recipe.imageContentType
    ? `data:${recipe.imageContentType};base64,${recipe.image}`
    : null;

  return (
    <div className="recipe-detail">
      <Link to="/" className="back-link">&larr; Back to Recipes</Link>

      <div className="recipe-detail-header">
        {imageUrl ? (
          <img src={imageUrl} alt={recipe.title} className="recipe-detail-image" />
        ) : (
          <div className="recipe-detail-placeholder image-placeholder">&#127860;</div>
        )}
        <div className="recipe-detail-info">
          <h1>{recipe.title}</h1>
          <div className="recipe-detail-categories">
            {recipe.categories?.map(cat => (
              <span key={cat} className="category-pill">{cat}</span>
            ))}
          </div>
          <div className="recipe-detail-meta">
            <div className="meta-item">
              <span className="meta-label">Prep Time</span>
              <span className="meta-value">{recipe.prepTime} min</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Servings</span>
              <span className="meta-value">{recipe.servings}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Difficulty</span>
              <span className={`difficulty-badge ${recipe.difficulty?.toLowerCase()}`}>
                {recipe.difficulty}
              </span>
            </div>
          </div>
          <div className="recipe-detail-actions">
            <Link to={`/recipes/${recipe._id}/edit`} className="btn btn-primary">Edit Recipe</Link>
            <button
              className="btn btn-danger"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="recipe-detail-body">
        <div className="recipe-section">
          <h2>Ingredients</h2>
          <ul className="ingredient-list">
            {recipe.ingredients?.map((ing, i) => (
              <li key={i}>{ing.text}</li>
            ))}
          </ul>
        </div>

        <div className="recipe-section">
          <h2>Instructions</h2>
          <ol className="step-list">
            {recipe.steps
              ?.sort((a, b) => a.stepNumber - b.stepNumber)
              .map((step, i) => (
                <li key={i}>{step.description}</li>
              ))}
          </ol>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Delete Recipe</h3>
            <p>Are you sure you want to delete "{recipe.title}"? This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecipeDetailPage;
