# CrowdFlow AI - AI Simulation

## Current implementation
To properly show what a Smart Physical Event Experience System would look like, the backend includes an AI mathematical simulation simulating live inputs.

### Wait-Time Loop Mechanism
This serves as a mock representing what the prediction model outputs:

`Math.max(0, gate.waitTime + Math.floor(Math.random() * 5) - 2)`
- Calculates realistic shifts of people queuing or leaving faster than people arriving.
- The `Math.max(0)` guarantees wait times do not fall below zero minutes.
- `Math.floor(Math.random() * 5) - 2` means queues can increment by up to 2 minutes, or reduce by up to 2 minutes every update cycle, creating organic movement graphs in the UI.

### Automated Congestion Classifications
Based on the AI estimated wait time, the server logic calculates text statuses:

- `if (waitTime > 10)` -> **"crowded"**
- `if (waitTime > 5)` -> **"moderate"**
- `else` -> **"free"**

The frontend reacts to these strings instantly, highlighting the path as Green, Yellow, or Red.

### Smart Routes & Route Sorting
The frontend logic uses a simple `reduce()` algorithm to comb through all available gates, instantly resolving which path is optimal and suggesting it to the user.

`const fastestGate = venueData.gates.reduce((prev, curr) => (prev.waitTime < curr.waitTime ? prev : curr), venueData.gates[0]);`

### Note on True AI Implementation
For a production environment, the backend would interface with:
- PyTorch or Scikit-learn endpoints
- Utilizing Historical Data (e.g. entry logs per minute)
- Live Video Feeds or Wi-Fi triangulation to calculate exact venue density.
- Sending real AI data payloads through the same WebSocket structure rather than the current interval loop.
