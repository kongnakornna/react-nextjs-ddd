'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { useI18n } from '@/src/core/services/i18n.service';
import { tf } from '@/src/core/ui/tf';

/**
 * Port of webiot `template/footer_vertical4m.php` (copyright line only).
 * Uses the same `layout.footer.*` keys as TablerFooter; year in B.E. for Thai.
 */
export function IotDashboardFooter() {
  const { t, lang } = useI18n();
  // Year is computed after mount so server and client render the same HTML.
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => setYear(new Date().getFullYear()), []);
  const displayYear = year === null ? '' : lang === 'th' ? year + 543 : year;

  return (
    <footer className="footer footer-transparent d-print-none py-2">
      <div className="container-fluid">
        <div className="row text-center align-items-center flex-row-reverse">
          <div className="col-12 col-lg-auto mt-3 mt-lg-0">
            <ul className="list-inline list-inline-dots mb-0">
              <li className="list-inline-item">
                {tf(t, 'layout.footer.copyright', 'Copyright ©')} {displayYear}{' '}
                <Link href="/" className="link-secondary">
                  {tf(t, 'app.name', 'iCmon')}
                </Link>{' '}
                {tf(t, 'layout.footer.allRightsReserved', 'All rights reserved.')}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
