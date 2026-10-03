import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RouteErrorBoundary } from '../RouteErrorBoundary';

describe('RouteErrorBoundary', () => {
  let root: ReturnType<typeof createRoot> | undefined;

  afterEach(() => {
    if (root) {
      act(() => root?.unmount());
      root = undefined;
    }
    vi.restoreAllMocks();
  });

  it('shows a recovery screen and logs render errors', () => {
    const container = document.createElement('div');
    const logError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    function BrokenPage(): never {
      throw new Error('render failure');
    }

    root = createRoot(container);
    act(() => {
      root?.render(createElement(RouteErrorBoundary, null, createElement(BrokenPage)));
    });

    expect(container.textContent).toContain('This page ran into a problem');
    expect(container.textContent).toContain('Reload page');
    expect(logError).toHaveBeenCalledWith(
      '[CertArc] Route rendering failed:',
      expect.objectContaining({ message: 'render failure' }),
      expect.any(String),
    );
  });
});
