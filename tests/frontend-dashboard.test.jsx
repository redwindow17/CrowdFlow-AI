import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../frontend/src/components/Dashboard';

// Mock dependencies
jest.mock('socket.io-client', () => {
  const on = jest.fn();
  const off = jest.fn();
  return () => ({ on, off });
});

// React-Leaflet requires mocking because mapping libraries do not render cleanly in JSDOM (Jest)
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer"></div>,
  CircleMarker: ({ children, center }) => <div data-testid="circle-marker">{children}</div>,
  Tooltip: ({ children }) => <div>{children}</div>
}));

describe('Frontend: Dashboard Module (Dashboard.jsx)', () => {
    
  it('Should mount appropriately and render its headers', () => {
    render(<Dashboard />);
    
    // Verifying primary headers
    expect(screen.getByText('Live Crowd Dashboard')).toBeInTheDocument();
    expect(screen.getByText(/Live Crowd Heatmap/i)).toBeInTheDocument();
    expect(screen.getByText('Service Wait Times')).toBeInTheDocument();
  });

  it('Should render the mapping layer correctly', () => {
    render(<Dashboard />);
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
    expect(screen.getByTestId('tile-layer')).toBeInTheDocument();
  });

  it('Should render the basic gate structure in the table format', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Gate')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Wait Time')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

});
