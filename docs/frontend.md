# CrowdFlow AI - Frontend Documentation

## Technology Stack
- **React 18:** Modern UI framework.
- **Vite:** High-performance local development build tool.
- **React-Bootstrap & Bootstrap:** Rapid styling and responsive component layout.
- **React-Leaflet:** Map integration for visualizing venue heatmaps and GPS positioning.
- **Socket.io-client:** Enabling real-time communication with the backend.

## Workflow & File Structure

### `App.jsx`
The main application entrypoint connecting UI components with routing. Sets up the top navigation bar and maps two core paths:
- `/`: Maps to `Dashboard.jsx`.
- `/navigation`: Maps to `Navigation.jsx`.

### Components

#### 1. `Dashboard.jsx` (Admin / Attendee View)
- **Role:** Displays live updates on the venue structure, queues, and crowd locations.
- **Flow:**
  1. Uses `useEffect` hook to connect to `socket.io` and listen on the `venue-update` event.
  2. Updates its component state `venueData` upon receiving real-time data.
  3. Re-renders UI elements like:
     - **Heatmap (Leaflet Map):** Displays intense/moderate zones using circle markers based on mocked coordinate intensity.
     - **Service Wait Times:** Re-renders progress bars based on stall wait-time percentages.
     - **Gate Statuses:** Renders the queue times and badge colors computed via `getStatusColor()`.

#### 2. `Navigation.jsx` (Smart Routing)
- **Role:** Simulates GPS tracking and route suggestions for attendees to find least-crowded entry points and facilities.
- **Flow:**
  1. Hooks into the same WebSocket connection to get current `venueData`.
  2. Calculates the *fastest* entry gate dynamically using a `reduce` function by sorting `waitTime`.
  3. Displays a dynamic map (Leaflet) simulating a walking path or GPS route.
  4. Provides real-time alerts on which areas to avoid (e.g., congestion areas).
