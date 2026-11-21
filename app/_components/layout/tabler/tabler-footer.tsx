'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { useI18n } from '@/src/core/services/i18n.service';

/** Port of icmonangular `layouts/footer`. Year shows in B.E. (+543) for Thai. */
export function TablerFooter() {
  const { t, lang } = useI18n();
  // Year is computed after mount so server and client render the same HTML.
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => setYear(new Date().getFullYear()), []);
  const displayYear = year === null ? '' : lang === 'th' ? year + 543 : year;

  return (
    <footer className="footer footer-transparent d-print-none">
      <div className="container-xl">
        <div className="row text-center align-items-center flex-row-reverse">
          <div className="col-lg-auto ms-lg-auto">
            <nav aria-label="Footer">
              <ul className="list-inline list-inline-dots mb-0">
                <li className="list-inline-item"><Link href="/" className="link-secondary">{t('layout.footer.about')}</Link></li>
                <li className="list-inline-item"><Link href="/" className="link-secondary">{t('layout.footer.help')}</Link></li>
                <li className="list-inline-item"><Link href="/" className="link-secondary">{t('layout.footer.privacy')}</Link></li>
              </ul>
            </nav>
          </div>
          <div className="col-12 col-lg-auto mt-3 mt-lg-0">
            <ul className="list-inline list-inline-dots mb-0">
              <li className="list-inline-item">
                {t('layout.footer.copyright')} {displayYear}{' '}
                <Link href="/" className="link-secondary">{t('app.name')}</Link>{' '}
                {t('layout.footer.allRightsReserved')}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
