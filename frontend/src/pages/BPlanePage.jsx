import React from 'react';
import BPlaneVisualizer from '../components/BPlaneVisualizer';
import GuideBox from '../components/GuideBox';

export default function BPlanePage({ selectedEvent }) {
  const guideSteps = [
    {
      title: 'Encounter Plane Coordinate System',
      description: 'The B-plane is normal to the relative velocity vector at TCA, with the Target satellite placed at origin (0,0).',
    },
    {
      title: 'Gaussian Positional Uncertainty',
      description: 'The 1σ (500m), 2σ (1000m), and 3σ (1500m) contours represent isotropic TLE covariance density.',
    },
    {
      title: 'Hard-Body Radius (HBR)',
      description: 'The combined physical collision sphere (10m combined diameter for large satellites) forms the collision area.',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* GuideBox */}
      <GuideBox
        title="B-Plane (Encounter Cross-Section) Geometry · User Guide"
        badge="2D GAUSSIAN INTEGRAL"
        steps={guideSteps}
        note="Foster/Alfano formulation computes Pc in under 10µs by integrating Gaussian probability density over the HBR disk."
      />

      {/* B-Plane Visualizer Component */}
      <BPlaneVisualizer selectedEvent={selectedEvent} />
    </div>
  );
}
