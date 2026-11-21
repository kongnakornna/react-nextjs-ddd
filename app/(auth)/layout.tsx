import type { Metadata } from 'next';
import '../globals.scss';
import { AuthExtras } from '@/app/_components/auth/auth-extras';

export const metadata: Metadata = {
  title: 'iCmon IoT - Authentication',
  description: 'IoT Monitoring Dashboard Login',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // min-h-screen: give .page full height so page-center can center vertically
    // Avoid `container`: Tailwind's .container overrides Tabler's .container-tight max-width
    <div className="page page-center min-h-screen">
      <AuthExtras />
      <div className="mx-auto w-full md:w-1/2 max-w-[720px] px-3 py-4">
        <div className="text-center mb-4">
          <a href="/" aria-label="Home">
            <img src="/img/logo/1-logo-light.png" height="24" alt="Logo" className="dark:hidden" />
            <img src="/img/logo/2-logo-dark.png" height="24" alt="Logo" className="hidden dark:block" />
          </a>
        </div>
        {children}
      </div>
    </div>
  );
}
