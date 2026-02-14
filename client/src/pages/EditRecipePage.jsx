import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import RecipeForm from '../components/RecipeForm/RecipeForm';
import { getRecipeById, updateRecipe } from '../services/recipeService';
import './EditRecipePage.css';

function EditRecipePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
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

  const handleSubmit = async (formData) => {
    await updateRecipe(id, formData);
    navigate(`/recipes/${id}`);
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

  return (
    <div className="edit-recipe-page">
      <Link to={`/recipes/${id}`} className="back-link">&larr; Cancel</Link>
      <h2>Edit Recipe</h2>
      <RecipeForm
        initialData={recipe}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
      />
    </div>
  );
}

export default EditRecipePage;
