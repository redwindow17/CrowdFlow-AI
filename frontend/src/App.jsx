import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { Map, Activity, Bell } from 'lucide-react';
import React from 'react';
import './App.css';

// Components
import Dashboard from './components/Dashboard';
import Navigation from './components/Navigation';
import AlertFeed from './components/AlertFeed';

function AnimatedRoutes() {
    const location = useLocation();
    return (
        <div key={location.pathname} className="page-enter page-enter-active">
            <Routes location={location}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/navigation" element={<Navigation />} />
                <Route path="/alerts" element={<AlertFeed />} />
            </Routes>
        </div>
    );
}

function App() {
    return (
        <Router>
            <Navbar expand="lg" sticky="top" className="main-navbar">
                <Container>
                    <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
                        <span className="brand-text">CrowdFlow AI</span>
                        <span className="brand-dot"></span>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="main-nav" style={{ borderColor: 'rgba(148,163,184,0.2)' }}>
                        <span style={{ display: 'block', width: 20, height: 2, background: 'var(--text-secondary)', marginBottom: 4 }}></span>
                        <span style={{ display: 'block', width: 20, height: 2, background: 'var(--text-secondary)', marginBottom: 4 }}></span>
                        <span style={{ display: 'block', width: 20, height: 2, background: 'var(--text-secondary)' }}></span>
                    </Navbar.Toggle>
                    <Navbar.Collapse id="main-nav">
                        <Nav className="ms-auto" style={{ gap: 4 }}>
                            <Nav.Link as={Link} to="/" className="nav-link-custom">
                                <Activity size={16} /> Dashboard
                            </Nav.Link>
                            <Nav.Link as={Link} to="/navigation" className="nav-link-custom">
                                <Map size={16} /> Navigation
                            </Nav.Link>
                            <Nav.Link as={Link} to="/alerts" className="nav-link-custom">
                                <Bell size={16} /> Alerts
                            </Nav.Link>
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
