import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '../ui/sidebar';
import {
  ChartNoAxesCombined,
  Archive,
  Package,
  UsersRound,
  Settings,
  ReceiptText,
  Truck,
  ClipboardList,
  NotebookPen,
} from 'lucide-react';
import { SidebarUserMenu } from './sidebar-user-menu';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useThemeStore } from '@/stores/theme.store';

const SidebarItems = [
  { title: 'Ventas', url: '/ventas', icon: ReceiptText },
  { title: 'Stock', url: '/stock', icon: Archive },
  { title: 'Tickets', url: '/tickets', icon: Package },
  { title: 'Reportes', url: '/reportes', icon: ChartNoAxesCombined },
  { title: 'Clientes', url: '/clientes', icon: UsersRound },
  { title: 'Proveedores', url: '/proveedores', icon: Truck },
  { title: 'Ordenes', url: '/ordenes', icon: ClipboardList },
  { title: 'Notas', url: '/notas', icon: NotebookPen },
];

export function AppSidebar() {
  const [showMinLogo, setShowMinLogo] = useState(false);
  const { open } = useSidebar();
  const location = useLocation();
  const { theme } = useThemeStore();

  const currentPath = location.pathname === '/' ? '/ventas' : location.pathname;

  useEffect(() => {
    if (!open) {
      setTimeout(() => setShowMinLogo(true), 180);
    } else {
      setShowMinLogo(false);
    }
  }, [open]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <img
          className="w-full flex"
          src={
            showMinLogo
              ? './assets/logo-min.png'
              : theme === 'dark'
              ? './assets/logo-white.png'
              : './assets/logo.png'
          }
          alt="app-logo"
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {SidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={
                      currentPath === item.url
                        ? 'bg-foreground text-background hover:bg-foreground hover:text-background'
                        : ''
                    }
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="mb-4">
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/configuracion">
                <Settings />
                <span>Configuracion</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarUserMenu />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
