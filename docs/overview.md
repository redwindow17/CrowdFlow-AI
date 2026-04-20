# CrowdFlow AI - System Overview

## Purpose
CrowdFlow AI is designed to improve physical event experiences in large-scale venues. It aggregates crowd data and wait-times (currently simulated via an AI prediction loop) to provide real-time updates to attendees.

## High-Level Architecture
1. **Backend Server (Node.js/Express & Socket.io)**
   - Responsible for maintaining the "State of the Venue" (queues, wait times, gate congestions).
   - Simulates real-time AI predictions loop that adjusts values every 5 seconds.
   - Emits these changes to connected clients.

2. **Frontend App (React + Vite)**
   - Acts as the main UI for attendees and admins.
   - Connects to the backend via WebSocket to receive live updates.
   - Sub-modules:
     - **Dashboard:** Visualizes heatmaps, live queue tracking, and gate congestion.
     - **Smart Navigation:** Suggests optimal routes avoiding congested areas.

## Core Flow
1. Server initializes and starts the AI Simulation loop.
2. React app initializes and opens WebSocket connection.
3. Upon connection, the server sends the current venue state.
4. Every 5 seconds, the AI simulation calculates new wait times and emits `venue-update` events.
5. The frontend React components re-render automatically to reflect fresh data to users.
