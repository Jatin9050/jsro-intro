import { render, screen } from '@testing-library/react';
import App from './App';

// A smoke test that the app actually boots and the homepage renders its offer.
test('renders the homepage hero', () => {
  render(<App />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Build what/i);
});
