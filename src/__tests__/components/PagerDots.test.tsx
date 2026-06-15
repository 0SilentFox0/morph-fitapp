// src/__tests__/components/PagerDots.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { PagerDots } from '../../components/ui/PagerDots';

describe('PagerDots', () => {
  it('renders one dot per page', async () => {
    await render(<PagerDots count={3} activeIndex={1} />);
    expect(screen.getAllByTestId('pager-dot')).toHaveLength(3);
  });

  it('renders nothing for a single page', async () => {
    await render(<PagerDots count={1} activeIndex={0} />);
    expect(screen.queryByTestId('pager-dot')).toBeNull();
  });
});
