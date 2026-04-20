import React, { useState, useEffect } from 'react';
import { Row, Col, Alert } from 'react-bootstrap';
import { UserPlus, ArrowRight, CornerUpRight, AlertTriangle, Navigation2, Shield, MapPin } from 'lucide-react';
import io from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const socket = io(API_BASE_URL);

const getCircleColor = (density) => {
    if (density >= 70) return '#ef4444';
    if (density >= 40) return '#f59e0b';
    return '#10b981';
};

export default function Navigation() {
    const [venueData, setVenueData] = useState({ gates: [], stalls: [], zones: [] });
    const [dangerAlerts, setDangerAlerts] = useState([]);

    useEffect(() => {
        socket.on('venue-update', (data) => {
            setVenueData(data);
        });

        socket.on('alert', (alert) => {
            if (alert.level === 'critical' || alert.level === 'warning') {
                setDangerAlerts(prev => {
                    const exists = prev.find(a => a.id === alert.id);
                    if (exists) return prev;
                    return [alert, ...prev].slice(0, 5);
                });
            }
        });

        return () => {
            socket.off('venue-update');
            socket.off('alert');
        };
    }, []);

    const fastestGate = venueData.gates.length
        ? venueData.gates.reduce((prev, curr) => (prev.waitTime < curr.waitTime ? prev : curr), venueData.gates[0])
        : null;

    const crowdedGates = venueData.gates.filter(g => g.status === 'crowded');
    const freeGates = venueData.gates.filter(g => g.status === 'free');

    // Build route from user location to fastest gate
    const userPos = [51.503, -0.091];
    const routePath = fastestGate
        ? [userPos, [(userPos[0] + fastestGate.lat) / 2, (userPos[1] + fastestGate.lng) / 2 - 0.001], [fastestGate.lat, fastestGate.lng]]
        : [];

    return (
        <main>
            {/* Page Header */}
            <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Navigation2 size={28} aria-hidden="true" /> Smart Navigation
                </h1>
                <span className="live-indicator" aria-live="polite"><span className="live-dot"></span> LIVE</span>
            </header>
            <p className="page-subtitle">AI-computed optimal routes based on real-time crowd density analysis</p>

            <Row className="g-3">
                {/* Left Panel — AI Suggestions */}
                <Col lg={4}>
                    <section className="glass-card" style={{ padding: 20, marginBottom: 16 }} aria-labelledby="ai-suggestions-title">
                        <h2 id="ai-suggestions-title" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Shield size={18} style={{ color: 'var(--accent-blue)' }} aria-hidden="true" />
                            AI Route Suggestions
                        </h2>

                        {/* Best Entry */}
                        {fastestGate ? (
                            <article style={{
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                borderRadius: 'var(--radius-sm)',
                                padding: 14,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                marginBottom: 16,
                            }} aria-label="Fastest route suggestion">
                                <div style={{
                                    width: 40, height: 40, borderRadius: 8,
                                    background: 'rgba(16, 185, 129, 0.2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--accent-green)', flexShrink: 0,
                                }} aria-hidden="true">
                                    <UserPlus size={20} />
                                </div>
                                <div role="status">
                                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--accent-green)' }}>Best Entry Route</div>
                                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                        {fastestGate.name} ({fastestGate.zone}) — <strong>{fastestGate.waitTime} min wait</strong>
                                    </div>
                                </div>
                            </article>
                        ) : (
                            <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: 16 }} aria-busy="true">Loading predictions...</div>
                        )}

                        {/* Turn-by-turn */}
                        <h3 style={{ fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Suggested Path
                        </h3>
                        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {[
                                { text: `Head towards ${fastestGate?.name || 'Gate C'}`, icon: <ArrowRight size={14} /> },
                                { text: 'Pass through Section D corridor', icon: <CornerUpRight size={14} /> },
                                { text: `Arrive at ${fastestGate?.zone || 'South Stand'}`, icon: <MapPin size={14} /> },
                            ].map((step, i) => (
                                <li key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '10px 12px',
                                    borderRadius: 'var(--radius-sm)',
                                    background: i === 0 ? 'rgba(99,102,241,0.08)' : 'transparent',
                                    fontSize: 13,
                                }}>
                                    <span style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} aria-hidden="true">{step.icon}</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>{step.text}</span>
                                </li>
                            ))}
                        </ol>
                    </section>

                    {/* Danger Zones */}
                    <section className="glass-card" style={{ padding: 20 }} aria-labelledby="danger-zones-title">
                        <h2 id="danger-zones-title" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <AlertTriangle size={18} style={{ color: 'var(--accent-red)' }} aria-hidden="true" />
                            Danger Zones
                        </h2>
                        {crowdedGates.length > 0 ? (
                            crowdedGates.map(gate => (
                                <div key={gate.id} className="alert-item critical" style={{ marginBottom: 8 }} role="alert">
                                    <AlertTriangle size={14} style={{ color: 'var(--accent-red)', flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: 13 }}>Avoid {gate.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                            Density: {gate.density}% — {gate.zone}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ color: 'var(--accent-green)', fontSize: 13 }} role="status">
                                ✅ All gates clear — no congestion detected
                            </div>
                        )}

                        {freeGates.length > 0 && (
                            <div style={{ marginTop: 16 }}>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px', marginBottom: 8 }}>
                                    Recommended Alternatives
                                </div>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {freeGates.map(gate => (
                                        <li key={gate.id} style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                                            background: 'rgba(16, 185, 129, 0.06)', marginBottom: 4,
                                            fontSize: 13,
                                        }}>
                                            <span style={{ color: 'var(--accent-green)' }}>✓ {gate.name}</span>
                                            <span style={{ color: 'var(--text-muted)' }}>{gate.waitTime} min</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button className="btn-glow" style={{ width: '100%', justifyContent: 'center', marginTop: 20 }} aria-label="Recalculate route based on latest data">
                            <Navigation2 size={16} aria-hidden="true" /> Recalculate Route
                        </button>
                    </section>
                </Col>

                {/* Right Panel — Map */}
                <Col lg={8}>
                    <section className="glass-card" style={{ overflow: 'hidden' }} aria-labelledby="map-title">
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong id="map-title" style={{ fontSize: 15 }}>📍 Venue GPS Tracker</strong>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }} aria-live="polite">Optimal Route Highlighted</span>
                        </div>
                        <div style={{ height: 620 }} aria-label="Interactive venue map">
                            <MapContainer center={[51.505, -0.09]} zoom={15} style={{ height: '100%', width: '100%' }}>
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                                />

                                {/* Gate circles */}
                                {venueData.gates.map((gate) => (
                                    <CircleMarker
                                        key={gate.id}
                                        center={[gate.lat, gate.lng]}
                                        pathOptions={{
                                            color: getCircleColor(gate.density),
                                            fillColor: getCircleColor(gate.density),
                                            fillOpacity: 0.4,
                                            weight: 2,
                                        }}
                                        radius={10 + (gate.density / 5)}
                                    >
                                        <Tooltip>
                                            <strong>{gate.name}</strong> — {gate.zone}<br />
                                            Density: {gate.density}% | Wait: {gate.waitTime} min
                                        </Tooltip>
                                    </CircleMarker>
                                ))}

                                {/* User location marker via circle */}
                                <CircleMarker
                                    center={userPos}
                                    pathOptions={{ color: '#6366f1', fillColor: '#6366f1', fillOpacity: 0.9, weight: 3 }}
                                    radius={8}
                                >
                                    <Popup><strong>📍 You are here</strong></Popup>
                                </CircleMarker>

                                {/* Optimal route */}
                                {routePath.length > 0 && (
                                    <Polyline
                                        positions={routePath}
                                        pathOptions={{ color: '#22d3ee', weight: 3, dashArray: '8, 8', opacity: 0.8 }}
                                    />
                                )}
                            </MapContainer>
                        </div>
                    </section>
                </Col>
            </Row>
        </main>
    );
}