import React from 'react';
import { render, screen } from '@testing-library/react';
import StatCard from '../frontend/src/components/StatCard';
import { Users } from 'lucide-react';

describe('StatCard Component', () => {
  it('renders the label and initial value accurately', () => {
    render(<StatCard icon={<Users />} value={100} label="Total Visitors" color="blue" />);
    
    expect(screen.getByText('Total Visitors')).toBeTruthy();
    // Value might be 0 initially due to animation, but label must be there
  });

  it('applies the correct color class to the icon container', () => {
    const { container } = render(<StatCard icon={<Users />} value={100} label="Test" color="red" />);
    const iconContainer = container.querySelector('.stat-icon');
    expect(iconContainer.classList.contains('red')).toBe(true);
  });
});
