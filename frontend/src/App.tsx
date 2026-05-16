import './App.css';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import AuthGuard from './components/auth-guard';
import Layout from './components/layout';
import Login from './pages/login';
import Ventas from './pages/ventas';
import Notas from './pages/notas';
import Stock from './pages/stock';
import Ordenes from './pages/ordenes';
import Clientes from './pages/clientes';
import ClienteDetalle from './pages/cliente-detalle';
import Caja from './pages/caja';
import Configuracion from './pages/configuracion';
import Proveedores from './pages/proveedores';
import ProveedorDetalle from './pages/proveedor-detalle';
import NotFound from './pages/not-found';
import Reportes from './pages/reportes';

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <AuthGuard />,
      children: [
        {
          path: '/',
          element: <Layout />,
          children: [
            {
              index: true,
              element: <Navigate to="/ventas" replace />,
            },
            { path: 'ventas', element: <Ventas /> },
            { path: 'notas', element: <Notas /> },
            { path: 'stock', element: <Stock /> },
            { path: 'ordenes', element: <Ordenes /> },
            { path: 'clientes', element: <Clientes /> },
            { path: 'clientes/:id', element: <ClienteDetalle /> },
            { path: 'caja', element: <Caja /> },
            { path: 'configuracion', element: <Configuracion /> },
            { path: 'proveedores', element: <Proveedores /> },
            { path: 'proveedores/:id', element: <ProveedorDetalle /> },
            { path: 'reportes', element: <Reportes /> },
            { path: '*', element: <NotFound /> },
          ],
        },
        {
          path: 'login',
          element: <Login />,
        },
        { path: '*', element: <NotFound /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
