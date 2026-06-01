import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-20 items-center justify-center">
                <AppLogoIcon className="h-12 w-18" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    CV. Anugerah Ajitama
                </span>
            </div>
        </>
    );
}
