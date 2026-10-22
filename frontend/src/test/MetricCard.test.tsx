import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricCard } from '../components/MetricCard';
import { Star } from 'lucide-react';
import React from 'react';

describe('MetricCard Component', () => {
  it('renders title, value, and subtitle correctly', () => {
    render(
      <MetricCard
        title="Total Stars Earned"
        value={15420}
        subtitle="Across public repositories"
        icon={Star}
        badge="Top 1%"
        badgeType="highlight"
      />
    );

    expect(screen.getByText('Total Stars Earned')).toBeInTheDocument();
    expect(screen.getByText('15,420')).toBeInTheDocument();
    expect(screen.getByText('Across public repositories')).toBeInTheDocument();
    expect(screen.getByText('Top 1%')).toBeInTheDocument();
  });
});
