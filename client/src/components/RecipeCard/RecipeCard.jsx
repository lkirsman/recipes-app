import { Link } from 'react-router-dom';
import './RecipeCard.css';

function RecipeCard({ recipe }) {
  const imageUrl = recipe.image && recipe.imageContentType
    ? `data:${recipe.imageContentType};base64,${recipe.image}`
    : null;

  const updatedDate = recipe.updatedAt
    ? new Date(recipe.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : null;

  return (
    <Link to={`/recipes/${recipe._id}`} className="recipe-card">
      <div className="recipe-card-image">
        {imageUrl ? (
          <img src={imageUrl} alt={recipe.title} />
        ) : (
          <div className="image-placeholder">&#127860;</div>
        )}
      </div>
      <div className="recipe-card-content">
        <h3 className="recipe-card-title">{recipe.title}</h3>
        <div className="recipe-card-categories">
          {recipe.categories?.map(cat => (
            <span key={cat} className="category-pill">{cat}</span>
          ))}
        </div>
        <div className="recipe-card-meta">
          <span className="recipe-card-time">{recipe.prepTime} min</span>
          <span className={`difficulty-badge ${recipe.difficulty?.toLowerCase()}`}>
            {recipe.difficulty}
          </span>
        </div>
        {updatedDate && (
          <div className="recipe-card-date">Updated {updatedDate}</div>
        )}
      </div>
    </Link>
  );
}

export default RecipeCard;
