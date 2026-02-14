import { useNavigate } from 'react-router-dom';
import RecipeForm from '../components/RecipeForm/RecipeForm';
import { createRecipe } from '../services/recipeService';
import './CreateRecipePage.css';

function CreateRecipePage() {
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    await createRecipe(formData);
    navigate('/');
  };

  return (
    <div className="create-recipe-page">
      <h2>Create New Recipe</h2>
      <RecipeForm onSubmit={handleSubmit} submitLabel="Create Recipe" />
    </div>
  );
}

export default CreateRecipePage;
