import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navigation from '../frontend/src/components/Navigation';

// Mock dependencies
jest.mock('socket.io-client', () => {
    return () => ({
        on: jest.fn(),
        off: jest.fn()
    });
});

// React-Leaflet requires mocking because mapping libraries do not render cleanly in JSDOM (Jest)
jest.mock('react-leaflet', () => ({
    MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
    TileLayer: () => <div data-testid="tile-layer"></div>,
    Marker: ({ children, position }) => <div data-testid="marker">{children}</div>,
    Popup: ({ children }) => <div>{children}</div>,
    Polyline: () => <div data-testid="polyline"></div>
}));

describe('Frontend: Smart Navigation Module (Navigation.jsx)', () => {
    
    it('Should render the Smart Navigation structure cleanly', () => {
        render(<Navigation />);

        expect(screen.getByText('Smart Navigation & Assistant')).toBeInTheDocument();
        expect(screen.getByText('AI Route Suggestions')).toBeInTheDocument();
        expect(screen.getByText('Venue GPS Tracker')).toBeInTheDocument();
    });

    it('Should render alerts simulating congestion warnings', () => {
        render(<Navigation />);

        // Warning alerts standard to the UI mockup
        expect(screen.getByText('Avoid Restroom C')).toBeInTheDocument();
        expect(screen.getByText('Congestion detected. Nearest available path is via Section D.')).toBeInTheDocument();
    });

    it('Should render simulated GPS tracking map', () => {
        render(<Navigation />);

        expect(screen.getByTestId('map-container')).toBeInTheDocument();
        expect(screen.getByTestId('tile-layer')).toBeInTheDocument();
        expect(screen.getByTestId('marker')).toBeInTheDocument();
        expect(screen.getByTestId('polyline')).toBeInTheDocument();
    });
});
