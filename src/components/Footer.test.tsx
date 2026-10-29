import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Footer } from './Footer';

describe('Footer', () => {
  it('renders version and environment label', () => {
    render(<Footer />);
    const footer = screen.getByTestId('app-footer');
    expect(footer).toHaveTextContent(/^v/);
    expect(footer.textContent).toMatch(/DEV|PROD/);
  });
});
