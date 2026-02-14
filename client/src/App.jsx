import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import CreateRecipePage from './pages/CreateRecipePage';
import RecipeListPage from './pages/RecipeListPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import EditRecipePage from './pages/EditRecipePage';
import './App.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <RecipeListPage /> },
      { path: 'recipes/new', element: <CreateRecipePage /> },
      { path: 'recipes/:id', element: <RecipeDetailPage /> },
      { path: 'recipes/:id/edit', element: <EditRecipePage /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
