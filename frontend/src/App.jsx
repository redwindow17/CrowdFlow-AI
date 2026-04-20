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
