import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Scroll to top on every route change.
// Special cases that intentionally keep scroll position: none currently.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
