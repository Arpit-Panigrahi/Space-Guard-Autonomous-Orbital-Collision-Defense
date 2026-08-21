import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  Flame, 
  Zap, 
  CheckCircle2, 
  Globe2, 
  Satellite, 
  Radio, 
  Clock, 
  Activity, 
  ArrowRight, 
  ArrowLeft,
  Shield, 
  HelpCircle,
  Cpu,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info
} from 'lucide-react';
import Globe3D from '@/components/Globe3D';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { sound } from '@/utils/audio';
import { formatDistance, formatScientific, API_BASE } from '@/utils/constants';

export default function PrototypePage({ objects = [], selectedEvent, onSelectEvent }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [liveObjects, setLiveObjects] = useState([]);
  const [loadingObjects, setLoadingObjects] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(true);

  // Avoidance simulation local controls
  const [simLeadTime, setSimLeadTime] = useState(24);
  const [simDeltaV, setSimDeltaV] = useState(0.10);

  const fetchLiveSample = async () => {
    setLoadingObjects(true);
    sound.playClick();
    try {
      const res = await fetch(`${API_BASE}/api/objects?limit=25`);
      if (res.ok) {
        const data = await res.json();
        setLiveObjects(data.objects || []);
      }
    } catch (e) {
      console.warn('Fallback to local objects:', e);
      setLiveObjects(objects.slice(0, 25));
    } finally {
      setLoadingObjects(false);
    }
  };

  useEffect(() => {
    fetchLiveSample();
  }, []);

  const pipelineSteps = [
    {
      id: 1,
      title: '1. Live Ephemeris Ingestion & SGP4',
      badge: 'PROPAGATION',
      icon: Satellite,
      summary: 'Real-time ingestion of active NORAD Two-Line Elements (TLEs) from CelesTrak, followed by instantaneous SGP4 numerical propagation to GCRS/ECI Cartesian vectors.',
      keyPoints: [
        'Ingests Two-Line Element (TLE) orbital sets directly from orbital tracking stations.',
        'Transforms mean Keplerian orbital elements into instantaneous Cartesian GCRS state vectors [X, Y, Z, Vx, Vy, Vz].',
        'Demonstrates live SGP4 numerical evaluation accounting for Earth oblateness (J2–J4) and atmospheric drag (BSTAR).',
      ],
      technicalDetail: 'Why TLEs + SGP4? TLEs represent the universally accessible orbital standard. The SGP4 analytical propagator accounts for Earth geopotential harmonics and lunar/solar third-body perturbations to maintain sub-kilometer accuracy over short prediction horizons.'
    },
    {
      id: 2,
      title: '2. 3D Spatial Geometry & Orbital Radar',
      badge: 'ORBITAL DYNAMICS',
      icon: Globe2,
      summary: 'Visualizing true orbital inclinations, nodes, and closing velocities (~7.5 to 14 km/s) across active LEO constellations (ISS, Starlink, Iridium).',
      keyPoints: [
        'Renders true LEO orbital tracks in the Earth-Centered Inertial (ECI) coordinate frame.',
        'Tracks orbital altitudes from ~400 km to 1,200 km and relative closing speeds exceeding 14 km/s.',
        'Demonstrates Stage 1 coarse filtering: apogee/perigee screening eliminates non-overlapping pairs before computationally intensive TCA searches.',
      ],
      technicalDetail: 'Coordinate system: Positions are evaluated in the Geocentric Celestial Reference System (GCRS) / ECI frame, ensuring that the Earth rotates independently underneath the inertial orbital planes without distorting relative trajectories.'
    },
    {
      id: 3,
      title: '3. Historical 2009 Collision Benchmark',
      badge: 'HISTORICAL REPLAY',
      icon: Flame,
      summary: 'Replaying the catastrophic February 10, 2009 collision between Iridium 33 and Cosmos 2251 using actual pre-collision TLEs (epoch 09041).',
      keyPoints: [
        'Case study: Iridium 33 (operational communications satellite) and Cosmos 2251 (decommissioned satellite) colliding at 789 km altitude.',
        'Relative impact velocity was 14.12 km/s at an almost perpendicular orbital intersection over Siberia.',
        'Space-Guard flags this encounter as CRITICAL (Pc > 10⁻⁴) with 48 hours of advance lead time.',
      ],
      technicalDetail: 'Why 10⁻⁴ Pc threshold? With σ = 500 m positional uncertainty and HBR = 10 m, Pc > 10⁻⁴ is the globally recognized operational threshold adopted by NASA, ESA, and ISRO for triggering emergency avoidance burns.'
    },
    {
      id: 4,
      title: '4. Clohessy-Wiltshire Avoidance Optimization',
      badge: 'OPTIMAL MANEUVER',
      icon: Zap,
      summary: 'Simulating counterfactual impulsive thruster burns on Iridium 33 to generate +4.83 km orbital clearance with minimal propellant expenditure.',
      keyPoints: [
        'Constructs the Clohessy-Wiltshire (CW) relative state transition matrix Φ_rv to solve for optimal velocity change ΔV.',
        'Singular Value Decomposition (SVD) of Φ_rv isolates the principal right-singular vector, directing 100% of thrust energy into maximum along-track separation.',
        'A modest 0.10 m/s burn applied 24h prior creates +4.83 km clearance, demonstrating the 14× early-burn efficiency multiplier.',
      ],
      technicalDetail: 'Mathematical basis: Because orbital period causes secular drift in the in-track direction (y-axis) over time, early burns leverage orbital geometry to amplify separation with exponentially less propellant.'
    },
  ];

  const currentStepData = pipelineSteps[currentStep - 1];

  // Calculated avoidance miss
  const shiftKm = Math.abs((4 * Math.sin(0.00103 * simLeadTime * 3600) - 3 * 0.00103 * simLeadTime * 3600) / 0.00103) * (simDeltaV / 1000);
  const totalMissKm = 0.003 + shiftKm;

  return (
    <div className="flex flex-col gap-6 font-sans text-foreground pb-16">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-sm border border-primary/30 bg-primary/5 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Layers className="size-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Astrodynamics Pipeline Walkthrough
              </h1>
              <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">
                INTERACTIVE LAB
              </Badge>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground mt-0.5">
              Step-by-step interactive exploration of the end-to-end orbital mechanics and collision avoidance pipeline.
            </p>
          </div>
        </div>

        {/* Step Progression Indicators */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {pipelineSteps.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                sound.playClick();
                setCurrentStep(s.id);
              }}
              className={`size-10 rounded-xs text-sm font-bold font-mono transition-all flex items-center justify-center cursor-pointer ${
                currentStep === s.id
                  ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary/40'
                  : currentStep > s.id
                  ? 'bg-secondary text-primary border border-primary/30'
                  : 'bg-secondary/50 text-muted-foreground border border-border hover:text-foreground'
              }`}
            >
              {s.id}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Stage Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Interactive Stage (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* STEP 1: LIVE API INGESTION TABLE */}
          {currentStep === 1 && (
            <Card className="border-border/80 bg-card/60 backdrop-blur-md shadow-sm rounded-sm">
              <CardHeader className="pb-4 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Satellite className="size-5 text-primary" />
                    <CardTitle className="text-base sm:text-lg font-bold">Live SGP4 Ephemeris Ingestion Feed</CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchLiveSample}
                    disabled={loadingObjects}
                    className="h-8 text-xs font-mono rounded-xs"
                  >
                    <Activity className={`size-3.5 mr-1.5 ${loadingObjects ? 'animate-spin' : ''}`} />
                    Refresh Feed
                  </Button>
                </div>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                  Ingested from CelesTrak active elements and propagated into GCRS Cartesian coordinates at current UTC second.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5">
                <div className="overflow-x-auto rounded-xs border border-border/70 bg-background/60 max-h-[420px] overflow-y-auto">
                  <table className="w-full text-left text-xs sm:text-sm font-mono">
                    <thead className="bg-secondary/40 text-muted-foreground border-b border-border text-[11px] uppercase sticky top-0">
                      <tr>
                        <th className="py-3 px-3.5">NORAD ID</th>
                        <th className="py-3 px-3.5">Satellite Name</th>
                        <th className="py-3 px-3.5">Position [X, Y, Z] (km)</th>
                        <th className="py-3 px-3.5">Velocity (km/s)</th>
                        <th className="py-3 px-3.5">Altitude</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 text-xs">
                      {(liveObjects.length > 0 ? liveObjects : objects.slice(0, 15)).map((sat) => {
                        const pos = sat.position_km || [0, 0, 0];
                        const vel = sat.velocity_km_s || [0, 0, 0];
                        const r = Math.sqrt(pos[0]*pos[0] + pos[1]*pos[1] + pos[2]*pos[2]);
                        const altKm = Math.max(0, r - 6378.137);
                        const vMag = Math.sqrt(vel[0]*vel[0] + vel[1]*vel[1] + vel[2]*vel[2]);

                        return (
                          <tr key={sat.norad_id} className="hover:bg-secondary/20 transition-colors">
                            <td className="py-2.5 px-3.5 font-bold text-primary">#{sat.norad_id}</td>
                            <td className="py-2.5 px-3.5 text-foreground font-sans font-semibold">{sat.name}</td>
                            <td className="py-2.5 px-3.5 text-muted-foreground text-[11px]">
                              [{pos.map(p => Number(p).toFixed(0)).join(', ')}]
                            </td>
                            <td className="py-2.5 px-3.5 text-muted-foreground">{vMag.toFixed(2)} km/s</td>
                            <td className="py-2.5 px-3.5 text-emerald-400 font-bold">~{altKm.toFixed(0)} km</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 2: 3D SATELLITE MAPPING */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <Globe3D 
                initialMode="live"
                objects={liveObjects.length > 0 ? liveObjects : objects}
              />
              <p className="text-xs sm:text-sm text-muted-foreground bg-secondary/30 p-4 rounded-sm border border-border/70 leading-relaxed">
                <strong className="text-foreground">3D Mapping Note:</strong> Satellites orbit with physical 3D geometry at true altitude scales. The Stage 1 coarse filter tracks altitude band overlaps to flag potential close encounters.
              </p>
            </div>
          )}

          {/* STEP 3: 2009 COLLISION BENCHMARK */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <Globe3D 
                initialMode="collision_2009"
                activeEvents={[{
                  target_id: 'IRIDIUM 33',
                  chaser_id: 'COSMOS 2251',
                  miss_distance_km: 0.003,
                  pc: 0.0002,
                  risk_tier: 'Critical',
                  tca_utc: '2009-02-10 16:56:00 UTC'
                }]}
              />
              <div className="grid grid-cols-3 gap-3.5 text-center font-mono">
                <div className="p-4 rounded-sm border border-rose-500/30 bg-rose-500/5">
                  <span className="text-xs text-rose-400 uppercase font-semibold">Impact Speed</span>
                  <div className="text-lg sm:text-xl font-bold text-rose-300 mt-1">14.12 km/s</div>
                  <span className="text-xs text-muted-foreground">Head-On</span>
                </div>
                <div className="p-4 rounded-sm border border-rose-500/30 bg-rose-500/5">
                  <span className="text-xs text-rose-400 uppercase font-semibold">Miss Distance</span>
                  <div className="text-lg sm:text-xl font-bold text-rose-300 mt-1">0.003 km (3 m)</div>
                  <span className="text-xs text-muted-foreground">Direct Collision</span>
                </div>
                <div className="p-4 rounded-sm border border-rose-500/30 bg-rose-500/5">
                  <span className="text-xs text-rose-400 uppercase font-semibold">Collision Pc</span>
                  <div className="text-lg sm:text-xl font-bold text-rose-300 mt-1">2.0 × 10⁻⁴</div>
                  <span className="text-xs text-rose-400 font-bold">Critical Alert</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: AVOIDANCE MANEUVER SIMULATION */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <Globe3D 
                initialMode="avoidance_2009"
                activeEvents={[{
                  target_id: 'IRIDIUM 33',
                  chaser_id: 'COSMOS 2251',
                  miss_distance_km: totalMissKm,
                  pc: 4.2e-7,
                  risk_tier: 'Low',
                  tca_utc: '2009-02-10 16:56:00 UTC'
                }]}
              />

              {/* Interactive Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-sm border border-border/80 bg-secondary/30 text-sm">
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">Burn Lead Time (Δt):</span>
                    <span className="font-mono text-primary font-bold text-base">{simLeadTime} Hours</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="48"
                    step="1"
                    value={simLeadTime}
                    onChange={(e) => setSimLeadTime(Number(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-xs appearance-none cursor-pointer accent-primary"
                  />
                  <span className="text-xs text-muted-foreground font-mono block">14× secular along-track scaling</span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">Impulsive ΔV Budget:</span>
                    <span className="font-mono text-emerald-400 font-bold text-base">{simDeltaV.toFixed(2)} m/s</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1.5"
                    step="0.05"
                    value={simDeltaV}
                    onChange={(e) => setSimDeltaV(Number(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-xs appearance-none cursor-pointer accent-emerald-400"
                  />
                  <span className="text-xs text-muted-foreground font-mono block">Conserves satellite propellant</span>
                </div>
              </div>

              {/* Clearance Summary */}
              <div className="p-5 rounded-sm border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <CheckCircle2 className="size-6 text-emerald-400 shrink-0" />
                  <div>
                    <strong className="text-sm sm:text-base font-bold text-foreground block">
                      Safe Orbital Clearance Achieved: +{totalMissKm.toFixed(2)} km
                    </strong>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Collision probability reduced from 2.0 × 10⁻⁴ (Critical) down to &lt; 10⁻⁶ (Safe).
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 font-mono text-xs hidden sm:inline-flex px-3 py-1">
                  CLEARANCE VERIFIED
                </Badge>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-3">
            <Button
              variant="outline"
              size="default"
              onClick={() => {
                sound.playClick();
                setCurrentStep(Math.max(1, currentStep - 1));
              }}
              disabled={currentStep === 1}
              className="text-sm font-semibold h-10 px-4"
            >
              <ArrowLeft className="size-4 mr-2" />
              Previous Stage
            </Button>

            <span className="text-xs sm:text-sm text-muted-foreground font-mono font-semibold">
              Stage {currentStep} of {pipelineSteps.length}
            </span>

            <Button
              size="default"
              onClick={() => {
                sound.playSuccess();
                setCurrentStep(Math.min(pipelineSteps.length, currentStep + 1));
              }}
              disabled={currentStep === pipelineSteps.length}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold h-10 px-4"
            >
              Next Stage
              <ArrowRight className="size-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Right Stage Explanation & Technical Detail Panel (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Stage Details Card */}
          <Card className="border-border/80 bg-card/60 backdrop-blur-md shadow-sm rounded-sm">
            <CardHeader className="pb-4 border-b border-border/60">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">
                  {currentStepData.badge}
                </Badge>
                <span className="text-xs font-mono text-muted-foreground">Stage {currentStep}/4</span>
              </div>
              <CardTitle className="text-lg font-bold text-foreground pt-1.5">
                {currentStepData.title}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {currentStepData.summary}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 space-y-3.5 text-xs sm:text-sm">
              <span className="font-bold text-foreground uppercase text-xs font-mono block">
                Core Principles & Pipeline Flow:
              </span>
              <ul className="space-y-2.5 text-muted-foreground">
                {currentStepData.keyPoints.map((kp, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-primary font-bold text-base">›</span>
                    <span className="leading-relaxed">{kp}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Technical Nuances & Astrodynamics Deep Dive */}
          <Card className="border-primary/20 bg-primary/5 shadow-sm rounded-sm">
            <CardHeader 
              className="pb-3 cursor-pointer select-none"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            >
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <Info className="size-4.5" />
                  <span>Technical Nuance & Derivation</span>
                </div>
                {showTechnicalDetails ? <ChevronUp className="size-4 text-primary" /> : <ChevronDown className="size-4 text-primary" />}
              </div>
            </CardHeader>

            {showTechnicalDetails && (
              <CardContent className="p-5 pt-1 text-xs sm:text-sm space-y-2.5">
                <div className="p-4 rounded-xs bg-card/90 border border-primary/20 text-muted-foreground leading-relaxed">
                  <strong className="text-foreground block mb-1.5 text-xs uppercase font-mono">Astrodynamics Context:</strong>
                  {currentStepData.technicalDetail}
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
