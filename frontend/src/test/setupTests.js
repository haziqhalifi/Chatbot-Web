import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';

// Reset mocks between tests
afterEach(() => {
  vi.restoreAllMocks();
});
