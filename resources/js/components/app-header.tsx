import { Link, usePage } from '@inertiajs/react';
import {
  Archive,
  ChartLine,
  ChartNetwork,
  LayoutGrid,
  Menu,
  Moon,
  Package,
  Sun,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import { UserProfileModal } from '@/components/user-profile-modal';
import { useAppearance } from '@/hooks/use-appearance';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { dashboard, datapenjualan, dataperamalan, dataproduk, datastok } from '@/routes';
import type { BreadcrumbItem, NavItem, SharedData } from '@/types';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';
import { NotificationDropdown } from './notification-dropdown';

type Props = {
  breadcrumbs?: BreadcrumbItem[];
};

const activeItemStyles =
  'text-sky-900 bg-sky-50/70 dark:bg-sky-900/30 dark:text-sky-100';
const inactiveItemStyles =
  'bg-transparent text-slate-600/80 hover:bg-transparent focus:bg-transparent dark:text-slate-200/60';

export function AppHeader({ breadcrumbs = [] }: Props) {
  const page = usePage<SharedData>();
  const { auth } = page.props;
  const isPemilik = auth?.user?.role === 'Pemilik Usaha';
  const isAdmin = auth?.user?.role === 'Admin';

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: dashboard().url,
      icon: LayoutGrid,
    },
    ...(isAdmin
      ? [
          {
            title: 'Data Pengguna',
            href: '/datapengguna',
            icon: Users,
          },
        ]
      : []),
    {
      title: 'Data Produk',
      href: dataproduk().url,
      icon: Package,
    },
    {
      title: 'Data Stok',
      href: datastok().url,
      icon: Archive,
    },
    {
      title: 'Data Penjualan',
      href: datapenjualan().url,
      icon: ChartLine,
    },
    ...(isPemilik || isAdmin
      ? [
          {
            title: 'Data Peramalan',
            href: dataperamalan().url,
            icon: ChartNetwork,
          },
        ]
      : []),
  ];

  const getInitials = useInitials();
  const { isCurrentUrl } = useCurrentUrl();
  const [profileOpen, setProfileOpen] = useState(false);
  const { resolvedAppearance, updateAppearance } = useAppearance();
  const isDarkMode = resolvedAppearance === 'dark';
  return (
    <>
      <div className="border-b border-sidebar-border/80 bg-gradient-to-r from-amber-100 via-sky-100 to-white shadow-sm dark:from-[#0a0d12] dark:via-[#122a45] dark:to-[#0a0d12]">
        <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-2 h-[34px] w-[34px]"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="flex h-full w-64 flex-col items-stretch justify-between bg-sidebar"
              >
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetHeader className="flex justify-start text-left">
                  <AppLogoIcon className="h-6 w-6 fill-current text-black dark:text-white" />
                </SheetHeader>
                <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                  <div className="flex h-full flex-col justify-between text-sm">
                    <div className="flex flex-col space-y-4">
                      {navItems.map((item) => (
                        <Link
                          key={item.title}
                          href={item.href}
                          className="flex items-center space-x-2 font-medium"
                        >
                          {item.icon && <item.icon className="h-5 w-5" />}
                          <span>{item.title}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center space-x-2">
            <AppLogo />
          </div>

          {/* Desktop Navigation */}
          <div className="ml-6 hidden h-full items-center space-x-6 lg:flex">
            <NavigationMenu className="flex h-full items-stretch">
              <NavigationMenuList className="flex h-full items-stretch space-x-2">
                {navItems.map((item, index) => (
                  <NavigationMenuItem
                    key={index}
                    className="relative flex h-full items-center"
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        navigationMenuTriggerStyle(),
                        isCurrentUrl(item.href)
                          ? activeItemStyles
                          : inactiveItemStyles,
                        'h-9 cursor-pointer px-3',
                      )}
                    >
                      {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                      {item.title}
                    </Link>
                    {isCurrentUrl(item.href) && (
                      <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-sky-600 dark:bg-amber-400"></div>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="ml-auto flex items-center space-x-2">
            <NotificationDropdown />
            <Button
              variant="ghost"
              size="icon"
              aria-label={
                isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
              }
              onClick={() => updateAppearance(isDarkMode ? 'light' : 'dark')}
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="size-10 rounded-full p-1">
                  <Avatar className="size-8 overflow-hidden rounded-full">
                    <AvatarImage
                      src={auth.user.avatar ?? auth.user.foto_profil_url}
                      alt={auth.user.username as string}
                    />
                    <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                      {getInitials(auth.user.username as string)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40" align="end" forceMount>
                <UserMenuContent
                  user={auth.user}
                  onOpenProfile={() => setProfileOpen(true)}
                />
              </DropdownMenuContent>
            </DropdownMenu>
            <UserProfileModal
              isOpen={profileOpen}
              onClose={() => setProfileOpen(false)}
              user={auth.user}
            />
          </div>
        </div>
      </div>
      {breadcrumbs.length > 1 && (
        <div className="flex w-full border-b border-sidebar-border/70">
          <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
            <Breadcrumbs breadcrumbs={breadcrumbs} />
          </div>
        </div>
      )}
    </>
  );
}
