# CrowdFlow AI - Backend Documentation

## Technology Stack
- **Node.js:** JavaScript runtime.
- **Express.js:** Minimalist web framework for APIs.
- **Socket.io:** Enables real-time, bi-directional communication between web clients and servers.
- **CORS:** Middleware to enable Cross-Origin Resource Sharing.
- **dotenv:** Environment variable loader.

## File Structure & Dependencies

### `server.js`
The core backend application responsible for initializing the server.

1. **Setup & Initialization:**
   - Loads `.env` file.
   - Sets up Express App and `http` server.
   - Sets up `Server` (Socket.io) with CORS configuration accepting connections from any origin.

2. **Data Structure:**
   A mock `venueData` object represents the status of large-scale venue entrances and food/service stalls.
   - `gates` array containing objects with `id`, `name`, `status`, and `waitTime`.
   - `stalls` array containing objects with `id`, `name`, and `waitTime`.

3. **REST API Endpoint:**
   - **`GET /api/venue`**: Serves as a fallback for obtaining the current state of the venue if WebSockets are unavailable.

4. **WebSocket & Simulation Loop:**
   - On a 5-second interval heartbeat, the server mathematically adjusts the `waitTime` using a mock AI logic based on randomized traffic spikes and dips.
   - Re-evaluates statuses (`crowded`, `moderate`, `free`) based on threshold wait times.
   - Emits a broadcasted event `venue-update` with the mutated `venueData` payload back out to **all** connected clients.

5. **Client Connection Flow:**
   - Detects incoming `connection` events.
   - Immediately pushes the current `venueData` instance directly to the new client (for zero-latency UI loading).
   - Monitors for `disconnect` events for clean teardown.
