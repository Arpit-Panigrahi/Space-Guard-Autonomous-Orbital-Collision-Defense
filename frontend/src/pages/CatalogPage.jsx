import React from 'react';
import CatalogExplorer from '../components/CatalogExplorer';
import GuideBox from '../components/GuideBox';
import { useNavigate } from 'react-router-dom';

export default function CatalogPage({ onSelectObject }) {
  const navigate = useNavigate();

  const guideSteps = [
    {
      title: 'Real-Time SGP4 Propagation',
      description: 'Satellites are propagated using Skyfield to the current UTC second in Geocentric Celestial Reference System (GCRS/ECI).',
    },
    {
      title: 'Instant Search & Filter',
      description: 'Search any active satellite by name (ISS, STARLINK, IRIDIUM) or NORAD 5-digit catalog ID.',
    },
    {
      title: 'Track in 3D Orbit Radar',
      description: 'Click "3D View" on any object row to jump to the 3D Radar and track its orbital plane around Earth.',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* GuideBox */}
      <GuideBox
        title="Live Satellite Catalog & Ephemeris · User Guide"
        badge="SGP4 EPHEMERIS"
        steps={guideSteps}
        note="GCRS is an Earth-Centered Inertial (ECI) non-rotating coordinate frame ideal for orbital mechanics calculations."
      />

      {/* Catalog Explorer Component */}
      <CatalogExplorer 
        onSelectObject={(obj) => {
          if (onSelectObject) onSelectObject(obj);
          navigate('/globe');
        }}
      />
    </div>
  );
}
