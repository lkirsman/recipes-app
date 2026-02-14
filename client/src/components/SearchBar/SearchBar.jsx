import { useState, useEffect, useRef } from 'react';
import { getCategories } from '../../services/recipeService';
import './SearchBar.css';

function SearchBar({ onFilterChange, filters }) {
  const [search, setSearch] = useState(filters?.search || '');
  const [selectedCategories, setSelectedCategories] = useState(filters?.categories || []);
  const [difficulty, setDifficulty] = useState(filters?.difficulty || '');
  const [availableCategories, setAvailableCategories] = useState([]);
  const debounceRef = useRef(null);

  useEffect(() => {
    getCategories().then(setAvailableCategories).catch(() => {});
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      emitChange({ search });
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const emitChange = (overrides = {}) => {
    onFilterChange({
      search,
      categories: selectedCategories,
      difficulty,
      ...overrides,
    });
  };

  const toggleCategory = (cat) => {
    const updated = selectedCategories.includes(cat)
      ? selectedCategories.filter(c => c !== cat)
      : [...selectedCategories, cat];
    setSelectedCategories(updated);
    onFilterChange({ search, categories: updated, difficulty });
  };

  const handleDifficultyChange = (value) => {
    setDifficulty(value);
    onFilterChange({ search, categories: selectedCategories, difficulty: value });
  };

  const clearAll = () => {
    setSearch('');
    setSelectedCategories([]);
    setDifficulty('');
    onFilterChange({ search: '', categories: [], difficulty: '' });
  };

  const hasFilters = search || selectedCategories.length > 0 || difficulty;

  return (
    <div className="search-bar">
      <div className="search-bar-row">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search recipes by title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-select difficulty-select"
          value={difficulty}
          onChange={e => handleDifficultyChange(e.target.value)}
        >
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        {hasFilters && (
          <button type="button" className="btn btn-sm btn-outline" onClick={clearAll}>
            Clear Filters
          </button>
        )}
      </div>
      <div className="search-bar-categories">
        {availableCategories.map(cat => (
          <button
            key={cat}
            type="button"
            className={`category-filter-pill ${selectedCategories.includes(cat) ? 'selected' : ''}`}
            onClick={() => toggleCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SearchBar;
