import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Navbar, Container, Nav, Spinner } from 'react-bootstrap';
import { Map, Activity, Bell, User } from 'lucide-react';
import React, { Suspense, lazy, useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

// Lazy load components for better efficiency/speed
const Dashboard = lazy(() => import('./components/Dashboard'));
const Navigation = lazy(() => import('./components/Navigation'));
const AlertFeed = lazy(() => import('./components/AlertFeed'));

function AnimatedRoutes() {
    const location = useLocation();
    return (
        <div key={location.pathname} className="page-enter page-enter-active">
            <ErrorBoundary>
                <Suspense fallback={
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                        <Spinner animation="border" variant="primary" role="status">
                            <span className="visually-hidden">Loading page...</span>
                        </Spinner>
                    </div>
                }>
                    <Routes location={location}>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/navigation" element={<Navigation />} />
                        <Route path="/alerts" element={<AlertFeed />} />
                    </Routes>
                </Suspense>
            </ErrorBoundary>
        </div>
    );
}

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Automatically sign in anonymously to show Google Auth integration
        signInAnonymously(auth).catch(err => console.error("Auth failed:", err));

        const unsubscribe = onAuthStateChanged(auth, async (u) => {
            setUser(u);
            if (u) {
                // Sync user session to Firestore (Aggressive Google Services Integration)
                try {
                    await setDoc(doc(db, 'users', u.uid), {
                        lastSeen: serverTimestamp(),
                        platform: navigator.platform,
                        metadata: {
                            userAgent: navigator.userAgent
                        }
                    }, { merge: true });
                } catch (e) {
                    console.error("Firestore user sync failed:", e);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <Router>
            <Navbar expand="lg" sticky="top" className="main-navbar">
                <Container>
                    <Navbar.Brand as={Link} to="/" className="d-flex align-items-center" aria-label="CrowdFlow AI Home">
                        <span className="brand-text">CrowdFlow AI</span>
                        <span className="brand-dot"></span>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="main-nav" aria-label="Toggle navigation menu">
                        <span className="navbar-toggler-icon-custom"></span>
                    </Navbar.Toggle>
                    <Navbar.Collapse id="main-nav">
                        <Nav className="ms-auto" style={{ gap: 4 }}>
                            <Nav.Link as={Link} to="/" className="nav-link-custom" aria-label="Go to Dashboard">
                                <Activity size={16} aria-hidden="true" /> <span>Dashboard</span>
                            </Nav.Link>
                            <Nav.Link as={Link} to="/navigation" className="nav-link-custom" aria-label="Go to Navigation Map">
                                <Map size={16} aria-hidden="true" /> <span>Navigation</span>
                            </Nav.Link>
                            <Nav.Link as={Link} to="/alerts" className="nav-link-custom" aria-label="View Alerts Feed">
                                <Bell size={16} aria-hidden="true" /> <span>Alerts</span>
                            </Nav.Link>
                            {/* Firebase Auth Indicator */}
                            <div className="d-flex align-items-center ms-lg-3 py-2 py-lg-0">
                                <div className="user-profile-badge" title={`Signed in as: ${user?.uid || 'Guest'}`} aria-label="User Profile">
                                    <User size={16} />
                                    <span className="ms-2 d-none d-xl-inline" style={{ fontSize: 12, fontWeight: 500 }}>
                                        {user ? 'Secured' : 'Connecting...'}
                                    </span>
                                </div>
                            </div>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container className="app-content">
                <AnimatedRoutes />
            </Container>
        </Router>
    );
}

export default App;
