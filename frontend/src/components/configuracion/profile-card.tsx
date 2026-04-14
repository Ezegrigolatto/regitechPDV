import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Camera, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import supabase from '../../../supabase-config';
import { toast } from 'sonner';
import { authListenerControl } from '@/components/auth-guard';

export function ProfileCard() {
  const { profile, user, setProfile } = useAuthStore();

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const handleSaveName = async () => {
    if (!fullName.trim() || !profile) return;
    setSavingName(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim() })
        .eq('id', profile.id);

      if (error) throw error;
      setProfile({ ...profile, full_name: fullName.trim() });
      toast.success('Nombre actualizado correctamente');
    } catch (err: any) {
      toast.error('Error al actualizar nombre', { description: err?.message });
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast.error('Ingresá tu contraseña actual');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }
    if (currentPassword === newPassword) {
      toast.error('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    setSavingPassword(true);
    try {
      authListenerControl.paused = true;

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email ?? '',
        password: currentPassword,
      });

      if (signInError) {
        toast.error('Contraseña actual incorrecta');
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
      toast.success('Contraseña actualizada correctamente');
    } catch (err: any) {
      toast.error('Error al cambiar contraseña', { description: err?.message });
    } finally {
      authListenerControl.paused = false;
      setSavingPassword(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploadingAvatar(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `avatars/${profile.id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: avatarUrl });
      toast.success('Foto de perfil actualizada');
    } catch (err: any) {
      toast.error('Error al subir imagen', { description: err?.message });
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="bg-card border rounded-2xl p-8 space-y-8">
      <div>
        <h2 className="text-lg font-extrabold">Mi perfil</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Actualizá tu información personal
        </p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile?.avatar_url ?? ''} />
            <AvatarFallback className="text-xl font-bold">{initials}</AvatarFallback>
          </Avatar>
          <button
            className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full shadow-md hover:opacity-90 transition-opacity"
            onClick={() => fileRef.current?.click()}
            disabled={uploadingAvatar}
          >
            {uploadingAvatar ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Camera className="h-3 w-3" />
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>
        <div>
          <p className="font-bold">{profile?.full_name ?? 'Usuario'}</p>
          <p className="text-sm text-muted-foreground capitalize">{profile?.role}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
        </div>
      </div>

      <Separator />

      {/* Nombre */}
      <div className="space-y-3">
        <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
          Nombre completo
        </Label>
        <div className="flex gap-2">
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Tu nombre completo"
            disabled={savingName}
          />
          <Button
            onClick={handleSaveName}
            disabled={savingName || fullName.trim() === profile?.full_name}
          >
            {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}
          </Button>
        </div>
      </div>

      {/* Email — solo lectura */}
      <div className="space-y-3">
        <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
          Email
        </Label>
        <Input value={user?.email ?? ''} disabled className="bg-muted/50" />
        <p className="text-xs text-muted-foreground">
          El email no se puede modificar desde aquí.
        </p>
      </div>

      <Separator />

      {/* Cambiar contraseña */}
      <div className="space-y-4">
        <div>
          <h3 className="font-bold">Cambiar contraseña</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Ingresá tu contraseña actual para confirmar el cambio
          </p>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            {/* Honeypot para evitar autocompletado de Chrome */}
            <input type="text" className="hidden" aria-hidden="true" />
            <input type="password" className="hidden" aria-hidden="true" />
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              Contraseña actual
            </Label>
            <Input
              type="password"
              autoComplete="off"
              readOnly
              onFocus={(e) => e.target.removeAttribute('readonly')}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              disabled={savingPassword}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              Nueva contraseña
            </Label>
            <Input
              type="password"
              autoComplete="off"
              readOnly
              onFocus={(e) => e.target.removeAttribute('readonly')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              disabled={savingPassword}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              Confirmar nueva contraseña
            </Label>
            <Input
              type="password"
              autoComplete="off"
              readOnly
              onFocus={(e) => e.target.removeAttribute('readonly')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={savingPassword}
            />
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handleChangePassword}
          disabled={
            savingPassword || !currentPassword || !newPassword || !confirmPassword
          }
        >
          {savingPassword ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Verificando...
            </span>
          ) : passwordSuccess ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              ¡Contraseña actualizada!
            </span>
          ) : (
            'Cambiar contraseña'
          )}
        </Button>
      </div>
    </div>
  );
}
