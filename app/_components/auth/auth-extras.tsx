'use client';

import { LanguageSelector } from './language-selector';
import { ThemeBuilder } from './theme-builder';

export function AuthExtras() {
  return (
    <>
      <div className="position-absolute top-0 end-0 p-3">
        <LanguageSelector />
      </div>
      <ThemeBuilder />
    </>
  );
}
