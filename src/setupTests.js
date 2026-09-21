import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

// jsdom, as shipped with react-scripts 5, is missing several browser globals the
// app legitimately uses. Provide them here so tests exercise real components
// rather than failing on the environment.

// react-router 7 expects these; Node has them.
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// jsdom has no layout, so it refuses to scroll.
window.scrollTo = () => {};

// Reduced-motion checks gate every animation in the app.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}

// Scroll reveals observe elements that jsdom will never intersect.
if (!window.IntersectionObserver) {
  class IntersectionObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
  }
  window.IntersectionObserver = IntersectionObserverStub;
  global.IntersectionObserver = IntersectionObserverStub;
}

// anime.js onScroll measures elements with one of these.
if (!window.ResizeObserver) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.ResizeObserver = ResizeObserverStub;
  global.ResizeObserver = ResizeObserverStub;
}
