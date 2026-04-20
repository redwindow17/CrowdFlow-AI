# CrowdFlow AI - Real-time workflows

## Technology Stack
- **Socket.io (Backend & Frontend)**

## Workflow Explaination

The magic of CrowdFlow AI is powered by its real-time simulated AI models feeding the client dashboard instantly. Here is how that communication pipeline functions:

### 1: The Initial Handshake
1. The **Node.js** Backend initializes an `http` server on the specified port.
2. The `Socket.io` instance wraps this `http` server to listen for WebSocket upgrade requests.
3. A **React** Client (like `Dashboard.jsx`) mounts. Its `useEffect()` hook triggers the `io("http://localhost:3001")` connection.
4. An HTTP Upgrade request occurs. The Backend accepts it, logging the `socket.id`.
5. **Immediate Sync:** The backend instantly sends the *current* `venueData` to this newly connected client using `socket.emit('venue-update', venueData)`. The UI displays data immediately.

### 2: The Continuous AI Simulation Loop (Heartbeat)
1. Within the backend (`server.js`), an infinite loop runs every 5 seconds.
2. The logic mutates the `venueData` mimicking natural crowd shifts:
   - Example Equation: `waitTime = Math.max(0, waitTime + Math.floor(Math.random() * 5) - 2)`
   - Status Equation: `gate.status = gate.waitTime > 10 ? 'crowded' : gate.waitTime > 5 ? 'moderate' : 'free';`
3. After these mutations, the backend broadcasts this updated state to *every single connected user* using `io.emit('venue-update', venueData)`.

### 3: The Client Response
1. The React app is continuously listening via `socket.on('venue-update', callback)`.
2. When the event payload arrives, React sets the `venueData` state via `setVenueData(data)`.
3. Because the `state` mutated, React seamlessly triggers a re-render.
4. Progress bars advance, badge colors dynamically turn red/yellow/green, and optimal path suggestions adjust instantly to reflect the live environment.

### 4: Disconnection
1. If the user navigates away or closes the app, the connection breaks.
2. The Backend receives a `disconnect` signal, logs the exit, and gracefully handles it natively.
