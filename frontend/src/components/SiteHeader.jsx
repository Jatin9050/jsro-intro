import { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { site } from '@jsro/shared/site';
import './SiteChrome.css';

const SECTIONS = [
  { label: 'Events', hash: '#events' },
  { label: 'About', hash: '#about' },
  { label: 'Focus areas', hash: '#programs' },
  { label: 'Workshops', hash: '#workshops' },
  { label: 'Contact', hash: '#contact' },
];

export default function SiteHeader() {
  const { pathname } = useLocation();
  const onHome = pathname === '/';
  const [open, setOpen] = useState(false);
  const menuButton = useRef(null);

  // In-page anchors on the homepage; anchors back to the homepage everywhere else.
  const href = (hash) => (onHome ? hash : `/${hash}`);

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="site-header">
      <Link className="brand-lockup" to="/" aria-label={`${site.name} home`}>
        <img src={site.logoPath} alt={site.name} width="475" height="411" fetchPriority="high" />
        <span>{site.name}</span>
      </Link>

      <nav
        id="site-navigation"
        className="site-navigation"
        data-open={String(open)}
        aria-label="Main navigation"
      >
        {SECTIONS.map((section) => (
          <a key={section.label} href={href(section.hash)} onClick={() => setOpen(false)}>
            {section.label}
          </a>
        ))}
      </nav>

      <a className="header-cta" href={href('#contact')}>
        Talk to {site.name} <ArrowUpRight size={17} strokeWidth={1.8} aria-hidden="true" />
      </a>

      <button
        className="menu-toggle"
        type="button"
        ref={menuButton}
        onClick={() => setOpen((value) => !value)}
        aria-label="Toggle navigation"
        aria-controls="site-navigation"
        aria-expanded={open}
      >
        {open ? (
          <X size={23} aria-hidden="true" />
        ) : (
          <Menu size={23} aria-hidden="true" />
        )}
        </button>
      </header>
    </>
  );
}
