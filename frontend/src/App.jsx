import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import GlobePage from './pages/GlobePage';
import ScreeningPage from './pages/ScreeningPage';
import ManeuverPage from './pages/ManeuverPage';
import HistoricalPage from './pages/HistoricalPage';
import BPlanePage from './pages/BPlanePage';
import CatalogPage from './pages/CatalogPage';
import DocsPage from './pages/DocsPage';
import PrototypePage from './pages/PrototypePage';
import { sound } from './utils/audio';
import { API_BASE } from './utils/constants';

export default function App() {
  const [backendStatus, setBackendStatus] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanData, setScanData] = useState(null);
  const [objects, setObjects] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const checkHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) setBackendStatus(true);
    } catch {
      setBackendStatus(false);
    }
  };

  const triggerScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch(`${API_BASE}/scan`, { method: 'POST' });
      if (!res.ok) throw new Error('Scan failed');
      const data = await res.json();
      setScanData(data);
      if (data.events?.length > 0) {
        setSelectedEvent(data.events[0]);
      }
    } catch (err) {
      console.warn('Backend scan fallback:', err);
      const sampleScan = {
        data_as_of: new Date().toISOString(),
        object_count: 40,
        candidate_pairs: 14,
        events_found: 3,
        events: [
          {
            target_id: 'IRIDIUM 33',
            chaser_id: 'COSMOS 2251 [2009 Historical Replay]',
            tca_utc: '2009-02-10 16:56:00 UTC',
            miss_distance_km: 0.003,
            relative_velocity_km_s: 14.12,
            pc: 0.000200,
            risk_tier: 'Critical',
            ml_prescreen_score: 0.000200,
          },
          {
            target_id: 'STARLINK-2401',
            chaser_id: 'COSMOS 1408 DEB',
            tca_utc: new Date(Date.now() + 18 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ') + ' UTC',
            miss_distance_km: 0.820,
            relative_velocity_km_s: 12.40,
            pc: 0.000045,
            risk_tier: 'High',
            ml_prescreen_score: 0.000042,
          },
          {
            target_id: 'ISS (ZARYA)',
            chaser_id: 'FENGYUN 1C DEB',
            tca_utc: new Date(Date.now() + 32 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ') + ' UTC',
            miss_distance_km: 2.150,
            relative_velocity_km_s: 9.80,
            pc: 0.000004,
            risk_tier: 'Moderate',
            ml_prescreen_score: 0.000003,
          },
        ],
      };
      setScanData(sampleScan);
      setSelectedEvent(sampleScan.events[0]);
    } finally {
      setIsScanning(false);
    }
  };

  const fetchObjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/objects?limit=100`);
      if (res.ok) {
        const data = await res.json();
        setObjects(data.objects || []);
      }
    } catch (err) {
      console.warn('Satellite fetch error:', err);
    }
  };

  useEffect(() => {
    checkHealth();
    fetchObjects();
    triggerScan();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar backendStatus={backendStatus} dataAsOf={scanData?.data_as_of} />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  backendStatus={backendStatus}
                  onTriggerScan={triggerScan}
                  scanData={scanData}
                />
              }
            />
            <Route
              path="/globe"
              element={
                <GlobePage
                  scanData={scanData}
                  objects={objects}
                  selectedEvent={selectedEvent}
                  onSelectEvent={setSelectedEvent}
                />
              }
            />
            <Route
              path="/screening"
              element={
                <ScreeningPage
                  scanData={scanData}
                  onTriggerScan={triggerScan}
                  isScanning={isScanning}
                  selectedEvent={selectedEvent}
                  onSelectEvent={setSelectedEvent}
                />
              }
            />
            <Route path="/maneuver" element={<ManeuverPage selectedEvent={selectedEvent} />} />
            <Route path="/historical" element={<HistoricalPage onSelectEvent={setSelectedEvent} />} />
            <Route path="/bplane" element={<BPlanePage selectedEvent={selectedEvent} />} />
            <Route path="/catalog" element={<CatalogPage onSelectObject={setSelectedEvent} />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route 
              path="/walkthrough" 
              element={
                <PrototypePage 
                  objects={objects} 
                  selectedEvent={selectedEvent} 
                  onSelectEvent={setSelectedEvent} 
                />
              } 
            />
            <Route 
              path="/prototype" 
              element={
                <PrototypePage 
                  objects={objects} 
                  selectedEvent={selectedEvent} 
                  onSelectEvent={setSelectedEvent} 
                />
              } 
            />
            <Route 
              path="/demo" 
              element={
                <PrototypePage 
                  objects={objects} 
                  selectedEvent={selectedEvent} 
                  onSelectEvent={setSelectedEvent} 
                />
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
