import { Link } from 'react-router-dom';
import { addressOneLine, legalLinks, site } from '@jsro/shared/site';
import './SiteChrome.css';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link className="brand-lockup" to="/" aria-label={`${site.name} home`}>
        <img src={site.logoPath} alt={site.name} width="475" height="411" loading="lazy" />
        <span>{site.name}</span>
      </Link>

      <p>{addressOneLine}</p>

      <div className="footer-links">
        {legalLinks.map((link) => (
          <Link key={link.to} to={link.to}>
            {link.label}
          </Link>
        ))}
      </div>

      <p>
        © {site.name} {site.tagline} {new Date().getFullYear()}
      </p>
    </footer>
  );
}
