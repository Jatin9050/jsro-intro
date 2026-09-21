import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

export default function NotFound() {
  return (
    <div className="jsro-page">
      <SiteHeader />

      <main id="main-content" className="jsro-main jsro-measure">
        <p className="jsro-effective">404</p>
        <h1 className="jsro-page-title">There is nothing at this address.</h1>
        <p className="jsro-page-intro">
          The link may be out of date, or the page may have moved. Everything JSRO runs
          is reachable from the homepage.
        </p>

        <p style={{ marginTop: 44 }}>
          <Link className="jsro-action" to="/">
            Go to the homepage <ArrowUpRight size={19} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
