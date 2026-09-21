import { useEffect } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';

import { legacyRedirects } from '@jsro/shared/events';

import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import EventRegister from './pages/EventRegister';
import ThankYou from './pages/ThankYou';
import NotFound from './pages/NotFound';

import CansatProgram from './pages/events/CansatProgram';
import InnovationChallenge from './pages/events/InnovationChallenge';
import JrcChallenge from './pages/events/JrcChallenge';

import PrivacyPolicy from './pages/policies/PrivacyPolicy';
import TermsAndConditions from './pages/policies/TermsAndConditions';
import RefundPolicy from './pages/policies/RefundPolicy';
import ShippingPolicy from './pages/policies/ShippingPolicy';


// A client-side route change leaves the scroll position where it was, which
// drops people into the middle of the next page. Reset it, unless the URL
// names an anchor — then honour the anchor.
function ScrollBehaviour() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollBehaviour />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/events/cansat-program" element={<CansatProgram />} />
        <Route path="/events/innovation-challenge" element={<InnovationChallenge />} />
        <Route path="/events/jrc-2026" element={<JrcChallenge />} />
        <Route path="/events/:slug/register" element={<EventRegister />} />
        <Route path="/events" element={<Navigate to="/#events" replace />} />

        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/about-us" element={<AboutUs />} />

        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />

        {/* Links already in the wild from the previous site. */}
        {legacyRedirects.map((redirect) => (
          <Route
            key={redirect.from}
            path={redirect.from}
            element={<Navigate to={redirect.to} replace />}
          />
        ))}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
