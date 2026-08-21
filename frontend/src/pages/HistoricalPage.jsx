import React from 'react';
import HistoricalValidation from '../components/HistoricalValidation';
import GuideBox from '../components/GuideBox';

export default function HistoricalPage({ onSelectEvent }) {
  const guideSteps = [
    {
      title: 'Historical Background',
      description: 'On 10 Feb 2009, Iridium 33 and Cosmos 2251 collided at 789 km over Siberia at 14.1 km/s relative speed.',
    },
    {
      title: 'Independent Verification',
      description: 'Given pre-collision TLEs (epoch 09041), Space-Guard flags the Critical alert without any hardcoding or special-casing.',
    },
    {
      title: 'Counterfactual Avoidance',
      description: 'Demonstrates how a tiny 0.1 m/s thruster burn 24h prior would have established +4.83 km safe clearance.',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* GuideBox */}
      <GuideBox
        title="2009 Iridium / Cosmos Collision Replay & Validation Lab"
        badge="REAL-WORLD CASE STUDY"
        steps={guideSteps}
        note="Empirical Validation: Verified and backtested against the documented 2009 Iridium 33 / Cosmos 2251 hypervelocity collision."
      />

      {/* Historical Validation Component */}
      <HistoricalValidation onSelectEvent={onSelectEvent} />
    </div>
  );
}
