import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContributionHeatmap } from '../components/ContributionHeatmap';
import React from 'react';

describe('ContributionHeatmap Component', () => {
  it('renders heatmap headers, streaks, and disclaimer', () => {
    const mockData = {
      total_contributions: 420,
      active_days: 180,
      current_streak: 12,
      longest_streak: 34,
      year: 2026,
      measurement_period: 'Trailing 365 Days',
      disclaimer: 'Aggregated from public push events.',
      days: [
        { date: '2026-10-20', count: 5, level: 2, day_of_week: 2 },
        { date: '2026-10-21', count: 0, level: 0, day_of_week: 3 },
      ]
    };

    render(<ContributionHeatmap data={mockData} />);

    expect(screen.getByText('Activity Calendar')).toBeInTheDocument();
    expect(screen.getByText('Trailing 365 Days')).toBeInTheDocument();
    expect(screen.getByText('420')).toBeInTheDocument();
    expect(screen.getByText('12 days')).toBeInTheDocument();
    expect(screen.getByText('34 days')).toBeInTheDocument();
    expect(screen.getByText('Aggregated from public push events.')).toBeInTheDocument();
  });
});
