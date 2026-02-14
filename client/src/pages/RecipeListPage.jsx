import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard/RecipeCard';
import SearchBar from '../components/SearchBar/SearchBar';
import { getAllRecipes } from '../services/recipeService';
import './RecipeListPage.css';

function RecipeListPage() {
  const [recipes, setRecipes] = useState([]);
  const [sort, setSort] = useState('newest');
  const [filters, setFilters] = useState({ search: '', categories: [], difficulty: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasAnyRecipes, setHasAnyRecipes] = useState(true);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { sort };
      if (filters.search) params.search = filters.search;
      if (filters.categories.length > 0) params.categories = filters.categories.join(',');
      if (filters.difficulty) params.difficulty = filters.difficulty;

      const data = await getAllRecipes(params);
      setRecipes(data);

      // Track if there are any recipes at all (for empty state vs no-match message)
      if (!filters.search && !filters.categories.length && !filters.difficulty) {
        setHasAnyRecipes(data.length > 0);
      }
    } catch {
      setError('Failed to load recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [sort, filters]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const hasActiveFilters = filters.search || filters.categories.length > 0 || filters.difficulty;

  if (error) {
    return (
      <div className="empty-state">
        <h3>Oops!</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchRecipes}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="recipe-list-page">
      <div className="recipe-list-header">
        <h2>My Recipes</h2>
        <div className="recipe-list-actions">
          <div className="sort-toggle">
            <label htmlFor="sort">Sort by:</label>
            <select
              id="sort"
              className="form-select sort-select"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="alphabetical">A-Z</option>
            </select>
          </div>
          <Link to="/recipes/new" className="btn btn-primary">+ Create Recipe</Link>
        </div>
      </div>

      <SearchBar onFilterChange={handleFilterChange} filters={filters} />

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : recipes.length === 0 ? (
        hasActiveFilters ? (
          <div className="empty-state">
            <h3>No recipes match your filters</h3>
            <p>Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        ) : (
          <div className="empty-state">
            <h3>No recipes yet</h3>
            <p>Start building your recipe collection by creating your first recipe!</p>
            <Link to="/recipes/new" className="btn btn-primary">Create Your First Recipe</Link>
          </div>
        )
      ) : (
        <div className="recipe-grid">
          {recipes.map(recipe => (
            <RecipeCard key={recipe._id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}

export default RecipeListPage;
