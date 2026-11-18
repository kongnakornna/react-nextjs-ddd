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
    <div className="page page-center">
      <AuthExtras />
      <div className="container container-tight py-4">
        <div className="text-center mb-4">
          <a href="/" aria-label="Home">
            <img src="/img/logo/logo-light.png" height="28" alt="Logo" className="dark:hidden" />
            <img src="/img/logo/logo-dark.png" height="28" alt="Logo" className="hidden dark:block" />
          </a>
        </div>
        {children}
      </div>
    </div>
  );
}
