import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src="/images/cv-anugerah-ajitama.png"
            alt="CV. Anugerah Ajitama"
        />
    );
}
