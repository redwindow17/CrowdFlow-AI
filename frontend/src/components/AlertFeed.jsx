import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { AlertTriangle, Info, AlertCircle, X, Bell } from 'lucide-react';

const socket = io('http://localhost:3001');

const iconMap = {
    critical: <AlertTriangle size={18} />,
    warning: <AlertCircle size={18} />,
    info: <Info size={18} />,
};

const colorMap = {
    critical: 'var(--accent-red)',
    warning: 'var(--accent-amber)',
    info: 'var(--accent-cyan)',
};

function timeAgo(ts) {
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
}

export default function AlertFeed() {
    const [alerts, setAlerts] = useState([]);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        // Fetch existing alerts on mount
        fetch('http://localhost:3001/api/alerts')
            .then(r => r.json())
            .then(data => setAlerts(data.filter(a => !a.dismissed)))
            .catch(() => {});

        socket.on('alert', (alert) => {
            setAlerts(prev => {
                const exists = prev.find(a => a.id === alert.id);
                if (exists) return prev;
                return [alert, ...prev].slice(0, 30);
            });
        });

        return () => socket.off('alert');
    }, []);

    const dismiss = async (id) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
        try {
            await fetch(`http://localhost:3001/api/alerts/${id}/dismiss`, { method: 'POST' });
        } catch {}
    };

    const filtered = filter === 'all' ? alerts : alerts.filter(a => a.level === filter);

    const counts = {
        all: alerts.length,
        critical: alerts.filter(a => a.level === 'critical').length,
        warning: alerts.filter(a => a.level === 'warning').length,
        info: alerts.filter(a => a.level === 'info').length,
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Bell size={28} /> Alert Feed
                </h1>
                <span className="live-indicator"><span className="live-dot"></span> LIVE</span>
            </div>
            <p className="page-subtitle">Real-time AI-generated crowd safety alerts and notifications</p>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {['all', 'critical', 'warning', 'info'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '6px 16px',
                            borderRadius: 20,
                            border: filter === f ? '1px solid var(--accent-blue)' : '1px solid var(--border-subtle)',
                            background: filter === f ? 'rgba(99,102,241,0.15)' : 'transparent',
                            color: filter === f ? 'var(--accent-blue)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: 13,
                            fontWeight: 600,
                            fontFamily: 'var(--font-sans)',
                            textTransform: 'capitalize',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {f} ({counts[f]})
                    </button>
                ))}
            </div>

            {/* Alert List */}
            <div className="glass-card" style={{ padding: 16 }}>
                {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                        <AlertCircle size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                        <p>No alerts to display</p>
                    </div>
                ) : (
                    filtered.map(alert => (
                        <div key={alert.id} className={`alert-item ${alert.level}`}>
                            <div style={{ color: colorMap[alert.level], flexShrink: 0, marginTop: 2 }}>
                                {iconMap[alert.level]}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                    <span style={{
                                        fontWeight: 600,
                                        fontSize: 13,
                                        color: colorMap[alert.level],
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {alert.level} — {alert.gateName}
                                    </span>
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                        {timeAgo(alert.timestamp)}
                                    </span>
                                </div>
                                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    {alert.message}
                                </p>
                            </div>
                            <button
                                onClick={() => dismiss(alert.id)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    padding: 4,
                                    flexShrink: 0,
                                    borderRadius: 4,
                                    transition: 'color 0.2s',
                                }}
                                onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
                                onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
                                title="Dismiss"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
