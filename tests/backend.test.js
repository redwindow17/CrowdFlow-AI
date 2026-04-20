const request = require('supertest');
const { io } = require('socket.io-client');
const http = require('http');

describe('Backend Server Tests (server.js)', () => {
  let socket;
  
  beforeAll((done) => {
    // Attempting a connection to the running server
    socket = io('http://localhost:3001');
    socket.on('connect', done);
  });

  afterAll(() => {
    if (socket && socket.connected) {
      socket.disconnect();
    }
  });

  describe('REST API endpoints', () => {
    it('GET /api/venue should return a 200 and a venue object', async () => {
      const response = await request('http://localhost:3001').get('/api/venue');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('gates');
      expect(response.body).toHaveProperty('stalls');
      expect(Array.isArray(response.body.gates)).toBeTruthy();
      expect(Array.isArray(response.body.stalls)).toBeTruthy();
    });
  });

  describe('Socket.io Connections & AI Heartbeat Simulation', () => {
    it('Should receive initial venue-update upon connection', (done) => {
      // Create a fresh client connection
      const client = io('http://localhost:3001');
      client.on('venue-update', (data) => {
        expect(data).toHaveProperty('gates');
        client.disconnect();
        done();
      });
    });

    it('Should never let gate waitTimes fall below 0 during simulation', (done) => {
      socket.on('venue-update', (data) => {
        data.gates.forEach(gate => {
          expect(gate.waitTime).toBeGreaterThanOrEqual(0);
        });
        socket.off('venue-update'); // Stop listening so done() is not called twice
        done();
      });
    });
  });
});
