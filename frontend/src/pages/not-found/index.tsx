import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p className="text-8xl font-extrabold text-muted-foreground/20">404</p>
      <h1 className="text-2xl font-extrabold">Página no encontrada</h1>
      <p className="text-muted-foreground text-sm">La ruta que buscás no existe.</p>
      <Button onClick={() => navigate('/ventas')}>
        <Home className="h-4 w-4 mr-2" />
        Volver al inicio
      </Button>
    </div>
  );
}
