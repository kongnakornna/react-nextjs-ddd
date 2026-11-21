'use client';

/** Tabler pagination — port of the Angular list pages' pageNumbers() logic. */
export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const total = Math.max(1, totalPages);
  const go = (p: number) => {
    if (p >= 1 && p <= total && p !== page) onChange(p);
  };

  return (
    <ul className="pagination m-0 ms-auto">
      <li className={`page-item${page <= 1 ? ' disabled' : ''}`}>
        <button type="button" className="page-link" onClick={() => go(page - 1)} aria-label="Previous">
          &#8249;
        </button>
      </li>
      {pageNumbers(page, total).map((p, i) =>
        p === '...' ? (
          <li key={`e${i}`} className="page-item disabled">
            <span className="page-link">…</span>
          </li>
        ) : (
          <li key={p} className={`page-item${p === page ? ' active' : ''}`}>
            <button type="button" className="page-link" onClick={() => go(p)}>
              {p}
            </button>
          </li>
        ),
      )}
      <li className={`page-item${page >= total ? ' disabled' : ''}`}>
        <button type="button" className="page-link" onClick={() => go(page + 1)} aria-label="Next">
          &#8250;
        </button>
      </li>
    </ul>
  );
}

export function pageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('...');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('...');
  pages.push(total);
  return pages;
}
