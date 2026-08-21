import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Globe3D from '@/components/Globe3D';
import GuideBox from '@/components/GuideBox';
import { Target, Zap, Clock, Flame, ShieldAlert, ArrowRight, Radio } from 'lucide-react';
import { sound } from '@/utils/audio';
import { formatDistance, formatScientific, getTierData } from '@/utils/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function GlobePage({ scanData, objects = [], selectedEvent, onSelectEvent }) {
  const events = scanData?.events || [];
  const activeEvent = selectedEvent || (events.length > 0 ? events[0] : null);
  const [activeGlobeMode, setActiveGlobeMode] = useState('live');

  const guideSteps = [
    {
      title: 'Interactive 3D Radar Modes',
      description: 'Switch between Live Catalog Radar, 1. Simulate 2009 Collision (impact shockwave + debris cloud), and 2. Simulate Escape Maneuver (+4.83 km safe passage).',
    },
    {
      title: 'Timeline Scrubbing & Speed',
      description: 'In simulation modes, use the bottom scrub bar or Play/Pause buttons to advance time from T-24h to TCA encounter at 1x, 5x, or 15x speeds.',
    },
    {
      title: 'Physical 3D Satellite Models',
      description: 'Target and Chaser satellites orbit in 3D with metallic solar panel wings, illustrating orbital plane intersections and impulsive maneuvers.',
    },
  ];

  return (
    <div className="flex flex-col gap-6 font-sans text-foreground">
      {/* User Guide */}
      <GuideBox
        title="3D Orbital Radar & Simulation Station · Operational Guide"
        badge="VISUAL TELEMETRY & SIMULATION"
        steps={guideSteps}
        note="Use the top buttons on the 3D globe to switch between Live Telemetry, Historical Collision Reenactment, and Escape Maneuver Planning."
      />

      {/* Main 3D Globe with Interactive Simulations */}
      <Globe3D 
        selectedEvent={activeEvent}
        activeEvents={events}
        objects={objects}
        initialMode={activeGlobeMode}
        onModeChange={setActiveGlobeMode}
      />

      {/* Mode Information & Quick Triggers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-rose-500/20 bg-rose-500/5 shadow-sm">
          <CardContent className="p-5 flex flex-col justify-between gap-4 h-full">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
                <Flame className="size-4" />
                <span>1. 2009 Iridium 33 / Cosmos 2251 Collision Replay</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Reenacts the 10 Feb 2009 hypervelocity impact over Siberia (14.1 km/s relative velocity), demonstrating catastrophic spacecraft breakup and 3D debris cloud dispersion.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                sound.playClick();
                setActiveGlobeMode('collision_2009');
              }}
              className="border-rose-500/30 hover:bg-rose-500/10 text-rose-400 text-xs font-medium self-start"
            >
              <Flame className="size-3.5 mr-1.5" />
              <span>Load 2009 Collision on Globe</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5 shadow-sm">
          <CardContent className="p-5 flex flex-col justify-between gap-4 h-full">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                <Zap className="size-4" />
                <span>2. Space-Guard CW Avoidance Maneuver Simulation</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Simulates an impulsive ΔV = 0.10 m/s thruster burn on Iridium 33 executed 24 hours prior, steering it along a green avoidance track to achieve +4.83 km safe clearance.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                sound.playSuccess();
                setActiveGlobeMode('avoidance_2009');
              }}
              className="border-primary/30 hover:bg-primary/10 text-primary text-xs font-medium self-start"
            >
              <Zap className="size-3.5 mr-1.5" />
              <span>Load Avoidance Maneuver on Globe</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Conjunction Encounter Selector & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Active Conjunctions List (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between p-3 rounded-sm border border-border/80 bg-card/60 backdrop-blur-md">
            <span className="font-semibold text-xs text-foreground uppercase font-mono flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              Active Orbital Conjunctions ({events.length})
            </span>
            <span className="text-[11px] text-muted-foreground">
              Click row to isolate tracks
            </span>
          </div>

          <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto pr-1">
            {events.map((ev, idx) => {
              const isSelected = activeEvent && activeEvent.target_id === ev.target_id && activeEvent.chaser_id === ev.chaser_id;
              const isCrit = (ev.risk_tier || '').toLowerCase().includes('crit') || ev.pc > 1e-4;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    sound.playClick();
                    onSelectEvent(ev);
                    setActiveGlobeMode('live');
                  }}
                  className={`p-3.5 rounded-sm cursor-pointer border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-card border-primary/50 ring-1 ring-primary/30 shadow-md'
                      : isCrit
                      ? 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40'
                      : 'bg-card/40 border-border/70 hover:border-border hover:bg-card/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={isCrit ? 'destructive' : 'secondary'} className="font-mono text-[10px]">
                      {ev.risk_tier || 'CRITICAL'}
                    </Badge>
                    <div>
                      <strong className="text-xs font-semibold text-foreground block">
                        {ev.target_id} × {ev.chaser_id}
                      </strong>
                      <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1 mt-0.5">
                        <Clock className="size-3 text-primary" /> TCA: {ev.tca_utc}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex flex-col font-mono">
                    <span className="text-[10px] text-muted-foreground uppercase">Miss Distance</span>
                    <strong className="text-xs font-semibold text-foreground">
                      {formatDistance(ev.miss_distance_km)}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Quick Target Lock Drawer (5 cols) */}
        <div className="lg:col-span-5">
          {activeEvent ? (
            <Card className="border-border/80 bg-card/60 backdrop-blur-md">
              <CardHeader className="pb-3 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="size-4 text-primary" />
                    <CardTitle className="text-sm font-semibold">Target Telemetry Lock</CardTitle>
                  </div>
                  <Badge variant={activeEvent.pc > 1e-4 ? 'destructive' : 'secondary'} className="font-mono text-[10px]">
                    {activeEvent.risk_tier || 'CRITICAL'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                <div className="space-y-1.5 p-3 rounded-xs bg-secondary/30 border border-border/50 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target:</span>
                    <span className="font-medium text-foreground">{activeEvent.target_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chaser:</span>
                    <span className="font-medium text-foreground">{activeEvent.chaser_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TCA (UTC):</span>
                    <span className="font-mono text-primary font-medium">{activeEvent.tca_utc}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-3 rounded-xs bg-secondary/30 border border-border/50 flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase">Miss Distance</span>
                    <strong className="text-sm text-foreground mt-0.5 font-semibold">
                      {formatDistance(activeEvent.miss_distance_km)}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xs bg-secondary/30 border border-border/50 flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase">Collision Pc</span>
                    <strong className="text-sm text-emerald-400 mt-0.5 font-semibold">
                      {formatScientific(activeEvent.pc)}
                    </strong>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <Button asChild size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs">
                    <Link to="/maneuver" onClick={() => sound.playClick()}>
                      <Zap className="size-3.5 mr-1.5" />
                      <span>Simulate CW Avoidance Burn</span>
                    </Link>
                  </Button>

                  <Button asChild variant="outline" size="sm" className="w-full border-border hover:bg-accent/60 text-xs">
                    <Link to="/bplane" onClick={() => sound.playClick()}>
                      <span>Inspect Encounter B-Plane</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/60 bg-card/40 p-8 text-center text-muted-foreground text-xs">
              Select a conjunction from the list to view encounter telemetry.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
