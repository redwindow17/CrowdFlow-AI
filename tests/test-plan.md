# CrowdFlow AI - System Test Plan & Cases

This document outlines the testing scenarios and module test cases for the entire **CrowdFlow AI** system. Test scripts for execution (using Jest / React Testing Library) are provided within this folder.

## 1. Backend Module (`server.js`)
**Scope:** Express REST API, Socket.io Broadcasts, AI Simulation Interval.

| Test ID | Module | Scenario / Description | Expected Result | Status |
|---------|--------|------------------------|-----------------|--------|
| **B-01** | API | Test `GET /api/venue` | Status 200. Body returns a JSON object with `gates` and `stalls` lists. | Pending |
| **B-02** | Socket | Client establishes connection on root namespace | Server triggers `connection` event, registers `socket.id`. | Pending |
| **B-03** | Socket | New connection sync mechanism | Immediately upon connection, server emits `venue-update` payload to the specific client. | Pending |
| **B-04** | AI Loop | Test waiting time simulation mutation | After 5 seconds, checking `venueData` properties must show different `waitTime` values (never < 0). | Pending |
| **B-05** | AI Loop | Gate status string computation | `gate.status` must equal 'crowded' if waitTime > 10, 'moderate' if > 5, 'free' otherwise. | Pending |

## 2. Frontend: Dashboard Module (`Dashboard.jsx`)
**Scope:** Admin visualizations, queue times mapping, heatmap rendering.

| Test ID | Module | Scenario / Description | Expected Result | Status |
|---------|--------|------------------------|-----------------|--------|
| **F-01** | Dashboard | Component Mounts (Initial Render) | "Live Crowd Dashboard" header appears, socket.io client invokes `connect()`. | Pending |
| **F-02** | Dashboard | Leaflet Map Instantiation | `MapContainer` loads properly matching coordinate array `[51.505, -0.09]`. | Pending |
| **F-03** | Dashboard | Heatmap Intensity Colors | Markers render dynamically mapping intensity > 0.6 as 'red', > 0.3 as 'orange'. | Pending |
| **F-04** | Dashboard | Queue Wait times parsing | When `venueData` state changes via `venue-update` event, Bootstrap Progress Bars re-scale width. | Pending |
| **F-05** | Dashboard | Gate Table formatting | Badge background color maps exactly down to `success`, `warning`, or `danger` via helper function `getStatusColor`. | Pending |


## 3. Frontend: Smart Navigation Module (`Navigation.jsx`)
**Scope:** User route finding, real-time optimal queueing detection.

| Test ID | Module | Scenario / Description | Expected Result | Status |
|---------|--------|------------------------|-----------------|--------|
| **F-06** | Navigation | Component Mounts (Initial Render) | "Smart Navigation & Assistant" header appears, initiates socket listener. | Pending |
| **F-07** | Navigation | Fastest Gate Algorithm | `reduce()` array search correctly identifies gate object with lowest integer `.waitTime`. | Pending |
| **F-08** | Navigation | Optimal Path UI Display | Banner says "Best Entry Route", displaying fastest gate name & wait time properly. | Pending |
| **F-09** | Navigation | GPS Tracker Map Loading | `TileLayer` and `Polyline` trace paths are successfully drawn into the DOM container. | Pending |
| **F-10** | Service Worker | Check `registerSW.js` in production build | Verify service worker is registered and active in the browser Application tab. | Pending |
| **F-11** | Manifest | Check `manifest.webmanifest` links | Verify icons and theme_color are correctly parsed by the browser. | Pending |

## 4. Challenge Evaluation Coverage Matrix
**Scope:** Explicitly track scoring areas from challenge guidelines.

| Test ID | Focus Area | Scenario / Description | Expected Result | Status |
|---------|------------|------------------------|-----------------|--------|
| **Q-01** | Code Quality | Static review for component modularity and naming consistency across backend/frontend | No duplicate logic hotspots; files remain readable and single-responsibility focused | Pending |
| **Q-02** | Security | Verify no secrets/tokens are committed and runtime config uses environment variables | No credentials in tracked files; `.env` usage is documented | Pending |
| **Q-03** | Efficiency | Verify backend emits updates on controlled interval and does not flood clients | Updates occur on expected cadence; no excessive event burst | Pending |
| **Q-04** | Testing | Ensure backend/frontend test cases are executable and mapped to documented scenarios | Test cases are up-to-date with actual behavior and can be run reproducibly | Pending |
| **Q-05** | Accessibility | Validate textual status cues and keyboard focus visibility in key screens | Critical UI states are understandable without color-only dependence; 96%+ score achieved | Pending |
| **Q-06** | Google Services | Confirm Auth, Firestore Sync, and Storage retrieval in runtime | Logic verifies session sync to `/users` collection and manual document fetch from Storage | Pending |
| **Q-07** | Performance | Verify manual chunking and React.lazy efficiency | No single chunk exceeds 500KB; initial load is minimized | Pending |

## 5. Submission Gate Checklist
**Scope:** Final checks before each challenge submission.

| Check ID | Rule | Validation Command / Method | Expected Result | Status |
|----------|------|-----------------------------|-----------------|--------|
| **S-01** | Single branch only | `git branch --format="%(refname:short)"` | Only `main` is present | Pending |
| **S-02** | Repo size < 1 MB | Sum of `git ls-files` byte sizes | Total is less than 1048576 bytes | Pending |
| **S-03** | Public repository | Verify visibility in GitHub settings | Repository is public | Pending |
| **S-04** | README completeness | Manual review against required sections | Vertical, logic, working, assumptions all present | Pending |
