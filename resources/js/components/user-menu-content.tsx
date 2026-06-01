import { Link, router } from '@inertiajs/react';
import { LogOut, User as UserIcon } from 'lucide-react';
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import type { User } from '@/types';

type Props = {
  user: User;
  onOpenProfile: () => void;
};

export function UserMenuContent({ onOpenProfile }: Props) {
  const cleanup = useMobileNavigation();

  const handleLogout = () => {
    cleanup();
    router.flushAll();
  };

  const handleOpenProfile = () => {
    cleanup();
    onOpenProfile();
  };

  return (
    <>
      <DropdownMenuItem onSelect={handleOpenProfile} className="cursor-pointer">
        <UserIcon className="mr-2" />
        Profile
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link
          className="block w-full cursor-pointer text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
          href={logout()}
          as="button"
          onClick={handleLogout}
          data-test="logout-button"
        >
          <LogOut className="mr-2 text-red-500" />
          Log out
        </Link>
      </DropdownMenuItem>
    </>
  );
}
