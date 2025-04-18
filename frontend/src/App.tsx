import './App.css';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import AuthGuard from './components/auth-guard';
import Layout from './components/layout';
import Login from './pages/login';
import Ventas from './pages/ventas';
import Notas from './pages/notas';

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <AuthGuard />,
      children: [
        {
          path: '/',
          element: (
            <>
              <Layout />
              <Navigate to="/ventas" replace />,
            </>
          ),
          children: [
            {
              path: '/ventas',
              element: <Ventas />,
            },
            {
              path: '/notas',
              element: <Notas />,
            },
          ],
        },
        {
          path: '/login',
          element: <Login />,
        },
        // {
        //   errorElement: <ErrorPage />,
        // },
        // {
        //   path: "*",
        //   element: <ErrorPage />,
        // },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
