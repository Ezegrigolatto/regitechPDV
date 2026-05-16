import { ProfileCard } from '@/components/configuracion/profile-card';
import { PreferencesCard } from '@/components/configuracion/preferences-card';

export default function Configuracion() {
  return (
    <div className="w-full px-8 py-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold">Configuración</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestioná tu perfil y preferencias
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <ProfileCard />
        <PreferencesCard />
      </div>
    </div>
  );
}