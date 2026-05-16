import { LogOutIcon, MoreVerticalIcon, UserCircleIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useThemeStore } from '@/stores/theme.store';
import { useCajaStore } from '@/stores/caja.store';
import { toast } from 'sonner';

import supabase from '../../../supabase-config';
import { useAuthStore } from '@/stores/auth.store';
import { Link } from 'react-router-dom';

export function SidebarUserMenu() {
  const { isMobile } = useSidebar();
  const { profile, clear } = useAuthStore();
  const { currentSession } = useCajaStore();
  const { setTheme } = useThemeStore();

  const handleLogout = async () => {
    if (currentSession?.status === 'open') {
      toast.error('No podés cerrar sesión con la caja abierta', {
        description: 'Cerrá la caja antes de salir.',
      });
      return;
    }
    await supabase.auth.signOut();
    setTheme('light');
    clear();
  };

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="cursor-pointer">
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage
                  src={profile?.avatar_url ?? ''}
                  alt={profile?.full_name ?? ''}
                />
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {profile?.full_name ?? 'Usuario'}
                </span>
                <span className="truncate text-xs text-muted-foreground capitalize">
                  {profile?.role ?? ''}
                </span>
              </div>
              <MoreVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={profile?.avatar_url ?? ''}
                    alt={profile?.full_name ?? ''}
                  />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {profile?.full_name ?? 'Usuario'}
                  </span>
                  <span className="truncate text-xs text-muted-foreground capitalize">
                    {profile?.role ?? ''}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link to="/configuracion" className="w-full">
                <DropdownMenuItem className="cursor-pointer">
                  <UserCircleIcon />
                  Perfil
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                <LogOutIcon />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
