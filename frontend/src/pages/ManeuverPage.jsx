import React from 'react';
import ManeuverPlanner from '../components/ManeuverPlanner';
import GuideBox from '../components/GuideBox';

export default function ManeuverPage({ selectedEvent }) {
  const guideSteps = [
    {
      title: 'Select Burn Lead Time (Δt)',
      description: 'Adjust the hours before TCA slider. Earlier burns leverage secular along-track acceleration 6(sin(nΔt) - nΔt).',
    },
    {
      title: 'Tune Impulsive ΔV Thruster Budget',
      description: 'Set allowable thruster budget (0.05 to 3.0 m/s) to ensure collision avoidance while minimizing fuel depletion.',
    },
    {
      title: 'Inspect RTN Vector & Clearance',
      description: 'Review the Radial (R), Along-track (T), and Cross-track (N) unit vectors computed via SVD of Φ_rv.',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* How to Plan Maneuvers Guide */}
      <GuideBox
        title="Clohessy-Wiltshire Avoidance Burn Planner · User Guide"
        badge="SVD OPTIMIZER"
        steps={guideSteps}
        note="Astrodynamics Insight: A 1 m/s burn applied 24h prior creates ~14× more separation than the same burn 1h prior due to secular along-track drift accumulation."
      />

      {/* Maneuver Planner Component */}
      <ManeuverPlanner selectedEvent={selectedEvent} />
    </div>
  );
}
