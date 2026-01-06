import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../components/ui/Button';

describe('Button component', () => {
  it('renders children and handles click', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);

    const btn = screen.getByRole('button', { name: 'Click me' });
    fireEvent.click(btn);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant and size classes', () => {
    render(
      <Button variant="secondary" size="large">
        Secondary
      </Button>
    );

    const btn = screen.getByRole('button', { name: 'Secondary' });
    expect(btn.className).toMatch(/bg-gray-200/);
    expect(btn.className).toMatch(/px-6 py-3/);
  });
});
