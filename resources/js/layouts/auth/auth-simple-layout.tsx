import AppLogoIcon from '@/components/app-logo-icon';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
  children,
  title,
  description,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-muted/40 p-4 md:p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-5">
          <Card className="mx-auto w-full max-w-[220px] gap-0 border-border/70 bg-card/90 pt-0 pb-2 shadow-md backdrop-blur">
            <CardContent className="py-0">
              <div className="flex flex-col items-center">
                <div className="flex h-32 w-36 items-center justify-center rounded-md">
                  <AppLogoIcon className="h-32 w-36 fill-current object-contain text-[var(--foreground)] dark:text-white" />
                </div>
                <span className="-mt-7 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground">
                  CV. Anugerah Ajitama
                </span>
                <span className="sr-only">{title}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90 shadow-md backdrop-blur">
            <CardHeader className="items-center text-center">
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription className="text-xs">
                {description}
              </CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
