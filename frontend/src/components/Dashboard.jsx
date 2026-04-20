import React, { useState, useEffect } from 'react';
import { Row, Col, Card, ProgressBar } from 'react-bootstrap';
import io from 'socket.io-client';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import { Users, Clock, AlertTriangle, Activity, Utensils, TrendingUp } from 'lucide-react';
import StatCard from './StatCard';
import 'leaflet/dist/leaflet.css';
import { logEvent } from 'firebase/analytics';
import { doc, getDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { analytics, db, storage } from '../firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const socket = io(API_BASE_URL);

const getStatusColor = (status) => {
    switch (status) {
        case 'free': return 'success';
        case 'moderate': return 'warning';
        case 'crowded': return 'danger';
        default: return 'secondary';
    }
};

const getDensityClass = (density) => {
    if (density >= 70) return 'high';
    if (density >= 40) return 'mid';
    return 'low';
};

const getCircleColor = (density) => {
    if (density >= 70) return '#ef4444';
    if (density >= 40) return '#f59e0b';
    return '#10b981';
};

export default function Dashboard() {
    const [venueData, setVenueData] = useState({ gates: [], stalls: [], zones: [], totalVisitors: 0 });
    const [alertCount, setAlertCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(true);

    useEffect(() => {
        if (analytics) {
            logEvent(analytics, 'dashboard_init', {
                timestamp: new Date().toISOString(),
                pwa_mode: window.matchMedia('(display-mode: standalone)').matches
            });
        }

        socket.on('connect', () => setIsSyncing(false));
        socket.on('disconnect', () => setIsSyncing(true));

        socket.on('venue-update', (data) => {
            setVenueData(data);
            if (analytics && Math.random() < 0.05) { // Log 5% of pulses to avoid spamming
                logEvent(analytics, 'venue_data_pulse', { visitors: data.totalVisitors });
            }
        });

        socket.on('alert', () => {
            setAlertCount(prev => prev + 1);
        });

        // Fetch initial alert count
        fetch(`${API_BASE_URL}/api/alerts`)
            .then(r => r.json())
            .then(data => setAlertCount(data.filter(a => !a.dismissed).length))
            .catch(() => {});

        return () => {
            socket.off('venue-update');
            socket.off('alert');
        };
    }, []);

    const avgWait = venueData.gates.length
        ? Math.round(venueData.gates.reduce((s, g) => s + g.waitTime, 0) / venueData.gates.length)
        : 0;

    const avgDensity = venueData.gates.length
        ? Math.round(venueData.gates.reduce((s, g) => s + g.density, 0) / venueData.gates.length)
        : 0;

    return (
        <main>
            {/* Page Header */}
            <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Activity size={28} aria-hidden="true" /> Live Crowd Dashboard
                </h1>
                <span className="live-indicator" aria-live="polite"><span className="live-dot"></span> LIVE</span>
            </header>
            <p className="page-subtitle">AI-powered real-time crowd monitoring • Updates every 5 seconds</p>

            {/* Stat Cards Row */}
            <Row className="g-3 mb-4" role="region" aria-label="Quick Statistics">
                <Col xs={6} lg={3}>
                    <StatCard icon={<Users size={22} aria-hidden="true" />} value={venueData.totalVisitors} label="Total Visitors" color="blue" />
                </Col>
                <Col xs={6} lg={3}>
                    <StatCard icon={<Clock size={22} aria-hidden="true" />} value={avgWait} label="Avg Wait Time" color="cyan" suffix=" min" />
                </Col>
                <Col xs={6} lg={3}>
                    <StatCard icon={<AlertTriangle size={22} aria-hidden="true" />} value={alertCount} label="Active Alerts" color="red" />
                </Col>
                <Col xs={6} lg={3}>
                    <StatCard icon={<TrendingUp size={22} aria-hidden="true" />} value={avgDensity} label="Avg Density" color="purple" suffix="%" />
                </Col>
            </Row>

            {/* Heatmap + Stalls */}
            <Row className="g-3 mb-4">
                <Col lg={8}>
                    <div className="glass-card" style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: 15 }}>🗺️ Live Crowd Heatmap</strong>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Dynamic • AI-Driven</span>
                        </div>
                        <div style={{ height: 400 }}>
                            <MapContainer center={[51.505, -0.09]} zoom={15} style={{ height: '100%', width: '100%' }}>
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                    attribution='&copy; <a href="https://carto.carto.com/">CARTO</a>'
                                />
                                {venueData.gates.map((gate) => (
                                    <CircleMarker
                                        key={gate.id}
                                        center={[gate.lat, gate.lng]}
                                        pathOptions={{
                                            color: getCircleColor(gate.density),
                                            fillColor: getCircleColor(gate.density),
                                            fillOpacity: 0.35 + (gate.density / 200),
                                            weight: 2,
                                        }}
                                        radius={12 + (gate.density / 4)}
                                    >
                                        <Tooltip permanent={false}>
                                            <strong>{gate.name}</strong><br />
                                            Density: {gate.density}%<br />
                                            Wait: {gate.waitTime} min
                                        </Tooltip>
                                    </CircleMarker>
                                ))}
                            </MapContainer>
                        </div>
                    </div>
                </Col>

                <Col lg={4}>
                    <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Utensils size={16} style={{ color: 'var(--accent-amber)' }} aria-hidden="true" />
                            <strong style={{ fontSize: 15 }}>Service Wait Times</strong>
                        </div>
                        <div style={{ padding: '16px 20px', flex: 1, overflowY: 'auto' }}>
                            {venueData.stalls.map(stall => (
                                <div key={stall.id} style={{ marginBottom: 18 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                                        <div>
                                            <span style={{ fontSize: 14, fontWeight: 500 }}>{stall.name}</span>
                                            <span style={{
                                                fontSize: 11,
                                                marginLeft: 8,
                                                color: 'var(--text-muted)',
                                                background: 'rgba(148,163,184,0.1)',
                                                padding: '2px 8px',
                                                borderRadius: 10,
                                            }}>{stall.category}</span>
                                        </div>
                                        <strong style={{
                                            color: stall.waitTime > 15 ? 'var(--accent-red)' : stall.waitTime > 5 ? 'var(--accent-amber)' : 'var(--accent-green)',
                                            fontSize: 14,
                                        }}>~{stall.waitTime} min</strong>
                                    </div>
                                    <div className="density-bar-bg" role="progressbar" aria-valuenow={stall.waitTime} aria-valuemin="0" aria-valuemax="30" aria-label={`Wait time for ${stall.name}`}>
                                        <div
                                            className={`density-bar-fill ${stall.waitTime > 15 ? 'high' : stall.waitTime > 5 ? 'mid' : 'low'}`}
                                            style={{ width: `${Math.min(100, (stall.waitTime / 30) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Gate Status Table */}
            <section className="section-header">
                <h2>Gate Status</h2>
                <div role="presentation" className="line"></div>
            </section>

            <div className="glass-card" style={{ overflow: 'hidden' }}>
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>Gate</th>
                            <th>Zone</th>
                            <th>Status</th>
                            <th>Density</th>
                            <th>Wait Time</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {venueData.gates.map((gate) => (
                            <tr key={gate.id}>
                                <td style={{ fontWeight: 600 }}>{gate.name}</td>
                                <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{gate.zone}</td>
                                <td>
                                    <span className={`status-badge ${gate.status}`}>
                                        <span className={`status-dot ${gate.status}`}></span>
                                        {gate.status.charAt(0).toUpperCase() + gate.status.slice(1)}
                                    </span>
                                </td>
                                <td style={{ width: 180 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div className="density-bar-bg" style={{ flex: 1 }} role="progressbar" aria-valuenow={gate.density} aria-valuemin="0" aria-valuemax="100" aria-label={`Density at ${gate.name}`}>
                                            <div
                                                className={`density-bar-fill ${getDensityClass(gate.density)}`}
                                                style={{ width: `${gate.density}%` }}
                                            />
                                        </div>
                                        <span style={{
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: gate.density >= 70 ? 'var(--accent-red)' : gate.density >= 40 ? 'var(--accent-amber)' : 'var(--accent-green)',
                                            minWidth: 36,
                                            textAlign: 'right'
                                        }} aria-hidden="true">{gate.density}%</span>
                                    </div>
                                </td>
                                <td>{gate.waitTime} min</td>
                                <td>
                                    <button className="btn-outline-glass" aria-label={`View details for ${gate.name}`}>View Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Zone Overview */}
            <section className="section-header" style={{ marginTop: 32 }}>
                <h2>Zone Overview</h2>
                <div role="presentation" className="line"></div>
            </section>

            <Row className="g-3 mb-4">
                {venueData.zones.map(zone => {
                    const pct = Math.round((zone.current / zone.capacity) * 100);
                    return (
                        <Col md={4} key={zone.id}>
                            <div className="glass-card" style={{ padding: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <strong style={{ fontSize: 15 }}>{zone.name}</strong>
                                    <span className={`status-badge ${pct >= 80 ? 'crowded' : pct >= 50 ? 'moderate' : 'free'}`} style={{ fontSize: 11 }}>
                                        {pct}%
                                    </span>
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 10 }}>
                                    {zone.current.toLocaleString()} / {zone.capacity.toLocaleString()} capacity
                                </div>
                                <div className="density-bar-bg" style={{ height: 8 }} role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100" aria-label={`Load for ${zone.name}`}>
                                    <div
                                        className={`density-bar-fill ${pct >= 80 ? 'high' : pct >= 50 ? 'mid' : 'low'}`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>
                        </Col>
                    );
                })}
            </Row>
            {/* Google Services Integration: Storage & Firestore */}
            <section className="section-header" style={{ marginTop: 32 }}>
                <h2>System Resources</h2>
                <div role="presentation" className="line"></div>
            </section>

            <div className="glass-card mb-5" style={{ padding: 20 }}>
                <Row className="align-items-center">
                    <Col md={8}>
                        <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>📋 Official Crowd Control Guidelines</h4>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                            Fetch security protocols and architectural documentation directly from our secure Google Cloud Storage.
                        </p>
                    </Col>
                    <Col md={4} className="text-md-end mt-3 mt-md-0">
                        <button 
                            className="btn-glow" 
                            onClick={async () => {
                                try {
                                    const fileRef = ref(storage, 'docs/protocol.pdf');
                                    const url = await getDownloadURL(fileRef);
                                    window.open(url, '_blank');
                                } catch (e) {
                                    alert("In a real environment, this would download protocol.pdf from Firebase Storage. (Currently Bucket is empty)");
                                }
                            }}
                            aria-label="Download Security Protocol"
                        >
                            Download Protocols
                        </button>
                    </Col>
                </Row>
            </div>
        </main>
    );
}