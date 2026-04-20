/**
 * @file server.js
 * @description Core backend for CrowdFlow AI. Handles real-time venue simulation, 
 * security middleware, and Firebase Admin synchronization.
 */

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const admin = require('firebase-admin');

dotenv.config();

// Initialize Firebase Admin (Firestore)
try {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'crwflow-ai-6971'
  });
  console.log('🔥 Firebase Admin initialized successfully');
} catch (e) {
  console.error('⚠️ Firebase Admin failed to initialize. Ensure FIREBASE_CONFIG or ADC is set.', e.message);
}

const db = admin.apps.length ? admin.firestore() : null;

const app = express();

// Security Middleware
app.use(helmet()); // Sets various HTTP headers
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? ['https://crwflow-ai-6971.web.app', 'https://crwflow-ai-6971.firebaseapp.com'] : '*',
    methods: ['GET', 'POST']
}));

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
	legacyHeaders: false,
});
app.use('/api/', limiter);

app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { 
        origin: process.env.NODE_ENV === 'production' ? ['https://crwflow-ai-6971.web.app', 'https://crwflow-ai-6971.firebaseapp.com'] : '*',
        methods: ['GET', 'POST'] 
    }
});

// ─── Venue State ────────────────────────────────────────────────────────────
let venueData = {
    totalVisitors: 14820,
    zones: [
        { id: 'zone-north', name: 'North Stand', capacity: 5000, current: 3800 },
        { id: 'zone-south', name: 'South Stand', capacity: 4500, current: 2200 },
        { id: 'zone-food',  name: 'Food Court',  capacity: 2000, current: 1650 },
    ],
    gates: [
        { id: 'gate-a', name: 'Gate A', zone: 'North Stand', status: 'crowded',  waitTime: 18, density: 85, lat: 51.5065, lng: -0.0925 },
        { id: 'gate-b', name: 'Gate B', zone: 'North Stand', status: 'moderate', waitTime: 9,  density: 55, lat: 51.5060, lng: -0.0910 },
        { id: 'gate-c', name: 'Gate C', zone: 'South Stand', status: 'free',     waitTime: 2,  density: 20, lat: 51.5040, lng: -0.0895 },
        { id: 'gate-d', name: 'Gate D', zone: 'South Stand', status: 'moderate', waitTime: 11, density: 60, lat: 51.5035, lng: -0.0880 },
        { id: 'gate-e', name: 'Gate E', zone: 'Food Court',  status: 'free',     waitTime: 4,  density: 30, lat: 51.5050, lng: -0.0870 },
        { id: 'gate-f', name: 'Gate F', zone: 'Food Court',  status: 'crowded',  waitTime: 22, density: 92, lat: 51.5055, lng: -0.0855 },
    ],
    stalls: [
        { id: 'food-a', name: 'Burger Queen',  waitTime: 12, category: 'Fast Food' },
        { id: 'food-b', name: 'Pizza King',    waitTime: 5,  category: 'Fast Food' },
        { id: 'food-c', name: 'Chai Corner',   waitTime: 3,  category: 'Beverages' },
        { id: 'food-d', name: 'Sushi Express', waitTime: 18, category: 'Japanese' },
        { id: 'food-e', name: 'Wrap & Roll',   waitTime: 7,  category: 'Healthy' },
        { id: 'food-f', name: 'Ice Cream Bar', waitTime: 9,  category: 'Desserts' },
    ]
};

let alerts = [];
let alertIdCounter = 1;

// ─── AI Simulation Helpers ──────────────────────────────────────────────────
const isPeakHour = () => {
    const h = new Date().getHours();
    return (h >= 18 && h <= 21); // evening peak
};

/**
 * Classifies crowd status based on density percentage.
 * @param {number} density - The current density percentage (0-100).
 * @returns {'crowded' | 'moderate' | 'free'} The classified status string.
 */
const classifyStatus = (density) => {
    if (density >= 75) return 'crowded';
    if (density >= 45) return 'moderate';
    return 'free';
};

/**
 * Pushes a new safety alert to the feed and broadcasts via Socket.io.
 * @param {'info' | 'warning' | 'critical'} level - Severity level of the alert.
 * @param {string} gateId - Unique identifier of the gate.
 * @param {string} gateName - Display name of the gate.
 * @param {string} message - Human-readable alert message.
 */
const pushAlert = (level, gateId, gateName, message) => {
    const alert = {
        id: alertIdCounter++,
        level,       // 'info' | 'warning' | 'critical'
        gateId,
        gateName,
        message,
        timestamp: new Date().toISOString(),
        dismissed: false
    };
    alerts.unshift(alert);
    if (alerts.length > 50) alerts.pop();      // keep last 50
    io.emit('alert', alert);
};

// ─── AI Simulation Loop (every 5 s) ────────────────────────────────────────
setInterval(() => {
    const peak = isPeakHour();
    const surgeEvent = Math.random() < 0.08; // 8% chance of surge

    venueData.gates.forEach(gate => {
        // Weighted random walk
        const delta = Math.floor(Math.random() * 7) - 3;
        const peakBoost = peak ? 5 : 0;
        const surgeBoost = surgeEvent ? Math.floor(Math.random() * 20) : 0;

        const prevDensity = gate.density;
        gate.density = Math.min(100, Math.max(0, gate.density + delta + peakBoost + surgeBoost));
        gate.waitTime = Math.round((gate.density / 100) * 30);
        const prevStatus = gate.status;
        gate.status = classifyStatus(gate.density);

        // Alert logic
        if (prevStatus !== 'crowded' && gate.status === 'crowded') {
            pushAlert('critical', gate.id, gate.name, `${gate.name} has become CRITICAL — density at ${gate.density}%. Consider redirecting crowd.`);
        } else if (prevStatus === 'crowded' && gate.status !== 'crowded') {
            pushAlert('info', gate.id, gate.name, `${gate.name} congestion has cleared — now ${gate.status}.`);
        } else if (surgeEvent && gate.density > 60) {
            pushAlert('warning', gate.id, gate.name, `Surge detected at ${gate.name}. Density jumped to ${gate.density}%.`);
        }
    });

    venueData.stalls.forEach(stall => {
        const delta = Math.floor(Math.random() * 5) - 2;
        stall.waitTime = Math.max(0, Math.min(30, stall.waitTime + delta));
    });

    // Update zone stats from gate averages
    venueData.totalVisitors += Math.floor(Math.random() * 40) - 10;
    venueData.zones.forEach(zone => {
        zone.current = Math.max(0, Math.min(zone.capacity, zone.current + Math.floor(Math.random() * 80) - 30));
    });

    io.emit('venue-update', venueData);

    // Sync to Google Cloud / Firebase (Firestore) - Google Services requirement
    if (db) {
        db.collection('venue_analytics').doc('current_state').set({
            ...venueData,
            lastChecked: admin.firestore.FieldValue.serverTimestamp()
        }).catch(err => console.debug('Firestore sync failed (expected if local auth missing)', err.message));
    }
}, 5000);

// ─── REST Endpoints ─────────────────────────────────────────────────────────
app.get('/api/venue', (req, res) => res.json(venueData));

app.get('/api/alerts', (req, res) => res.json(alerts));

app.post('/api/alerts/:id/dismiss', (req, res) => {
    const alert = alerts.find(a => a.id === parseInt(req.params.id));
    if (alert) alert.dismissed = true;
    res.json({ ok: true });
});

// ─── WebSocket ───────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
    console.log(`[+] Client connected: ${socket.id}`);
    socket.emit('venue-update', venueData);
    // Send recent undismissed alerts on connect
    alerts.filter(a => !a.dismissed).slice(0, 10).forEach(a => socket.emit('alert', a));

    socket.on('disconnect', () => console.log(`[-] Client gone: ${socket.id}`));
});

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 CrowdFlow AI backend running on :${PORT}`));
