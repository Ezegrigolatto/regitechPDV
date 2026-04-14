import { useThemeStore } from '@/stores/theme.store';
import { useAuthStore } from '@/stores/auth.store';
import { Moon, Sun } from 'lucide-react';
import supabase from '../../../supabase-config';
import { toast } from 'sonner';

export function PreferencesCard() {
  const { theme, setTheme } = useThemeStore();
  const { profile, setProfile } = useAuthStore();

  const handleSetTheme = async (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    if (!profile) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ theme: newTheme })
        .eq('id', profile.id);

      if (error) throw error;
      setProfile({ ...profile, theme: newTheme });
    } catch (err: any) {
      toast.error('Error al guardar tema', { description: err?.message });
    }
  };

  return (
    <div className="bg-card border rounded-2xl p-8 space-y-8">
      <div>
        <h2 className="text-lg font-extrabold">Preferencias</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Personalizá tu experiencia en la app
        </p>
      </div>

      {/* Tema */}
      <div className="space-y-3">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
          Tema
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              theme === 'light'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:bg-muted/50'
            }`}
            onClick={() => handleSetTheme('light')}
          >
            <div className="p-3 bg-white border rounded-xl shadow-sm">
              <Sun className="h-5 w-5 text-yellow-500" />
            </div>
            <span className="text-sm font-semibold">Claro</span>
          </button>

          <button
            className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
              theme === 'dark'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:bg-muted/50'
            }`}
            onClick={() => handleSetTheme('dark')}
          >
            <div className="p-3 bg-slate-900 border rounded-xl shadow-sm">
              <Moon className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-sm font-semibold">Oscuro</span>
          </button>
        </div>
      </div>

      {/* Idioma */}
      <div className="space-y-3">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
          Idioma
        </p>
        <div className="flex items-center justify-between px-4 py-3 bg-muted/50 rounded-xl border">
          <div className="flex items-center gap-3">
            <span className="text-xl">🇦🇷</span>
            <div>
              <p className="text-sm font-semibold">Español (Argentina)</p>
              <p className="text-xs text-muted-foreground">Único idioma disponible por ahora</p>
            </div>
          </div>
          <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-full uppercase">
            Activo
          </span>
        </div>
      </div>

      {/* Info de sesión */}
      <div className="space-y-3">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
          Sesión
        </p>
        <div className="px-4 py-3 bg-muted/50 rounded-xl border space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Versión</span>
            <span className="font-semibold">1.0.0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Entorno</span>
            <span className="font-semibold capitalize">
              {import.meta.env.MODE}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}