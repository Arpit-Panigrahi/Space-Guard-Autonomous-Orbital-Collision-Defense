import React from 'react';
import ScanDashboard from '../components/ScanDashboard';
import GuideBox from '../components/GuideBox';
import { useNavigate } from 'react-router-dom';

export default function ScreeningPage({ scanData, onTriggerScan, isScanning, selectedEvent, onSelectEvent }) {
  const navigate = useNavigate();

  const guideSteps = [
    {
      title: 'Initiate 24h Scan',
      description: 'Click "Run Conjunction Scan" to ingest current CelesTrak TLEs and run the coarse filter & Scipy golden-section minimization.',
    },
    {
      title: 'Filter by Risk Tiers',
      description: 'Filter flagged events by Foster/Alfano Pc threshold (Critical > 10⁻⁴, High > 10⁻⁵, Moderate > 10⁻⁶, Low ≤ 10⁻⁶).',
    },
    {
      title: 'Simulate Maneuver & Export',
      description: 'Inspect any flagged satellite pair, simulate an impulsive thruster burn, or download the full conjunction JSON report.',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* How It Works Guide */}
      <GuideBox
        title="Two-Stage Conjunction Screening & Triage · User Guide"
        badge="SCREENING ENGINE"
        steps={guideSteps}
        note="Stage 1 coarse filter discards non-overlapping apogee/perigee altitude pairs (±50km), keeping runtime under 5 seconds."
      />

      {/* Main Scan Dashboard Component */}
      <ScanDashboard
        scanData={scanData}
        onTriggerScan={onTriggerScan}
        isScanning={isScanning}
        selectedEvent={selectedEvent}
        onSelectEvent={onSelectEvent}
        onOpenManeuver={(ev) => {
          onSelectEvent(ev);
          navigate('/maneuver');
        }}
        onOpenBPlane={(ev) => {
          onSelectEvent(ev);
          navigate('/bplane');
        }}
      />
    </div>
  );
}
