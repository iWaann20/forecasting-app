import AppLogoIcon from '@/components/app-logo-icon';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
  children,
  title,
  description,
}: AuthLayoutProps) {
  return (
    <div className="flex h-svh flex-col items-center justify-center overflow-hidden bg-background p-4 md:p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col items-center gap-1">
            <div className="flex flex-col items-center font-medium">
              <div className="flex h-32 w-36 items-center justify-center rounded-md">
                <AppLogoIcon className="h-32 w-36 fill-current object-contain text-[var(--foreground)] dark:text-white" />
              </div>
              <span className="sr-only">{title}</span>
            </div>

            <div className="text-center">
              <h1 className="text-base font-semibold">{title}</h1>
              <p className="text-center text-xs text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}