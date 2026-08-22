import React, { useState } from 'react';
import { 
  Radar, 
  Search, 
  Filter, 
  Download, 
  Activity, 
  ExternalLink, 
  Flame, 
  CheckCircle2, 
  Radio, 
  AlertTriangle,
  ArrowRight,
  Shield,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CountUp from '@/components/react-bits/CountUp';
import { sound } from '@/utils/audio';
import { formatScientific, formatDistance, formatVelocity } from '@/utils/constants';

export default function ScanDashboard({
  scanData,
  onTriggerScan,
  isScanning,
  selectedEvent,
  onSelectEvent,
  onOpenManeuver,
  onOpenBPlane
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  const events = scanData?.events || [];

  const filteredEvents = events.filter((ev) => {
    const tier = (ev.risk_tier || '').toUpperCase();
    const pc = Number(ev.pc || 0);

    let matchesFilter = true;
    if (activeFilter === 'CRITICAL') {
      matchesFilter = tier.includes('CRIT') || pc > 1e-4;
    } else if (activeFilter === 'HIGH') {
      matchesFilter = tier.includes('HIGH') || (pc > 1e-5 && pc <= 1e-4);
    } else if (activeFilter === 'MODERATE') {
      matchesFilter = tier.includes('MOD') || (pc > 1e-6 && pc <= 1e-5);
    } else if (activeFilter === 'LOW') {
      matchesFilter = tier.includes('LOW') || pc <= 1e-6;
    }

    const matchesSearch =
      searchTerm === '' ||
      (ev.target_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ev.chaser_id || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const criticalCount = events.filter(e => (e.risk_tier || '').toLowerCase().includes('crit') || e.pc > 1e-4).length;
  const highCount = events.filter(e => (e.risk_tier || '').toLowerCase().includes('high')).length;

  const handleExportReport = () => {
    sound.playClick();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scanData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `space-guard-conjunction-report-${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getBadgeVariant = (tierStr, pc) => {
    const tier = (tierStr || '').toUpperCase();
    if (tier.includes('CRIT') || pc > 1e-4) return 'destructive';
    if (tier.includes('HIGH')) return 'secondary';
    if (tier.includes('MOD')) return 'outline';
    return 'default';
  };

  return (
    <div className="flex flex-col gap-6 font-sans text-foreground">
      {/* Top Banner / Initiate Scan Bar */}
      <div className="p-4 sm:p-8 rounded-sm border border-border/80 bg-card/60 backdrop-blur-md flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
          <div className="size-12 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Radar className={`size-6 ${isScanning ? 'animate-spin' : ''}`} />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
                Conjunction Screening & Triage Center
              </h1>
              <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">
                SGP4 + Foster/Alfano Pc
              </Badge>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              Two-stage filter: Altitude band overlap (±50km) → Golden-section TCA search → 2D Gaussian integral
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
          <Button
            onClick={() => {
              sound.playRadarPing();
              onTriggerScan();
            }}
            disabled={isScanning}
            size="lg"
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md transition-all h-11 px-5 text-sm cursor-pointer"
          >
            <Activity className={`size-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning 24h Window...' : 'Run Conjunction Scan'}</span>
          </Button>

          {events.length > 0 && (
            <Button
              variant="outline"
              size="lg"
              onClick={handleExportReport}
              className="w-full sm:w-auto border-border hover:bg-accent/60 text-sm h-11 px-4"
            >
              <Download className="size-4 mr-2 text-primary" />
              <span>Export JSON</span>
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card className="bg-card/50 backdrop-blur-md border-border/80 rounded-sm">
          <CardContent className="p-5 flex flex-col justify-between">
            <span className="text-xs uppercase font-mono text-muted-foreground font-semibold">Catalog Satellites</span>
            <div className="text-3xl font-bold tracking-tight text-foreground font-mono mt-2">
              <CountUp to={scanData?.object_count ?? 40} duration={1.2} />
            </div>
            <span className="text-xs text-muted-foreground/80 mt-1">Active LEO Objects</span>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-md border-border/80 rounded-sm">
          <CardContent className="p-5 flex flex-col justify-between">
            <span className="text-xs uppercase font-mono text-muted-foreground font-semibold">Candidate Pairs (Stage 1)</span>
            <div className="text-3xl font-bold tracking-tight text-primary font-mono mt-2">
              <CountUp to={scanData?.candidate_pairs ?? 12} duration={1.2} />
            </div>
            <span className="text-xs text-muted-foreground/80 mt-1">±50km Altitude Overlap</span>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-md border-border/80 rounded-sm">
          <CardContent className="p-5 flex flex-col justify-between">
            <span className="text-xs uppercase font-mono text-muted-foreground font-semibold">Conjunctions Surfaced</span>
            <div className="text-3xl font-bold tracking-tight text-foreground font-mono mt-2">
              <CountUp to={events.length} duration={1.2} />
            </div>
            <span className="text-xs text-muted-foreground/80 mt-1">TCA within 24 Hours</span>
          </CardContent>
        </Card>

        <Card className={`backdrop-blur-md transition-colors rounded-sm ${
          criticalCount > 0 
            ? 'bg-destructive/10 border-destructive/30' 
            : 'bg-card/50 border-border/80'
        }`}>
          <CardContent className="p-5 flex flex-col justify-between">
            <span className={`text-xs uppercase font-mono font-semibold ${criticalCount > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
              Critical Threats
            </span>
            <div className={`text-3xl font-bold tracking-tight font-mono mt-2 ${criticalCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {criticalCount > 0 ? `${criticalCount} Threat${criticalCount > 1 ? 's' : ''}` : 'All Clear'}
            </div>
            <span className="text-xs text-muted-foreground/80 mt-1">Pc &gt; 1.0 × 10⁻⁴ Threshold</span>
          </CardContent>
        </Card>
      </div>

      {/* Main Conjunctions List & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Filterable Event List (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3.5">
          {/* Search and Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-sm border border-border/80 bg-card/40 backdrop-blur-md">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-muted-foreground text-xs uppercase font-mono font-semibold mr-1 flex items-center gap-1.5">
                <Filter className="size-3.5" /> Filter:
              </span>
              {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map((tier) => (
                <button
                  key={tier}
                  onClick={() => {
                    sound.playClick();
                    setActiveFilter(tier);
                  }}
                  className={`h-9 px-3.5 rounded-xs text-xs font-mono font-semibold transition-all cursor-pointer ${
                    activeFilter === tier
                      ? 'bg-primary/20 text-primary border border-primary/40 shadow-xs font-bold'
                      : 'bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground border border-border/60'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-auto sm:min-w-[224px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search satellite name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 w-full sm:w-56 pl-9 pr-3 bg-secondary/50 border border-border rounded-xs text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>
          </div>

          {/* Event Cards List */}
          <div className="flex flex-col gap-3">
            {filteredEvents.length === 0 ? (
              <div className="p-10 text-center rounded-sm border border-dashed border-border text-muted-foreground text-sm">
                No conjunction events match the current filter.
              </div>
            ) : (
              filteredEvents.map((ev, idx) => {
                const isSelected = selectedEvent && selectedEvent.target_id === ev.target_id && selectedEvent.chaser_id === ev.chaser_id;
                const isCrit = (ev.risk_tier || '').toLowerCase().includes('crit') || ev.pc > 1e-4;

                return (
                  <div
                    key={`${ev.target_id}-${ev.chaser_id}-${idx}`}
                    onClick={() => {
                      sound.playClick();
                      onSelectEvent(ev);
                    }}
                    className={`p-5 rounded-sm cursor-pointer border transition-all ${
                      isSelected
                        ? 'bg-card border-primary/60 shadow-md ring-1 ring-primary/40'
                        : isCrit
                        ? 'bg-rose-500/5 border-rose-500/30 hover:border-rose-500/50'
                        : 'bg-card/40 border-border/70 hover:border-border hover:bg-card/80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Satellite Pair */}
                      <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                        <div className={`size-10 rounded-xs flex items-center justify-center shrink-0 ${
                          isCrit ? 'bg-destructive/15 text-destructive border border-destructive/30' : 'bg-primary/10 text-primary border border-primary/20'
                        }`}>
                          {isCrit ? <Flame className="size-5" /> : <Radar className="size-5" />}
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm sm:text-base text-foreground tracking-tight break-words">
                              {ev.target_id}
                            </span>
                            <span className="text-muted-foreground font-mono text-xs">×</span>
                            <span className="font-semibold text-xs sm:text-sm text-muted-foreground tracking-tight break-words">
                              {ev.chaser_id}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 text-[11px] sm:text-xs text-muted-foreground font-mono">
                            <span>TCA: <strong className="text-foreground font-normal">{ev.tca_utc}</strong></span>
                            <span>·</span>
                            <span>Miss: <strong className="text-foreground font-bold">{formatDistance(ev.miss_distance_km)}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Right Telemetry & Badges */}
                      <div className="flex items-center gap-3 sm:gap-4 self-start sm:self-auto">
                        {ev.relative_velocity_km_s && (
                          <div className="flex flex-col hidden md:flex text-right">
                            <span className="text-[10px] text-muted-foreground uppercase font-mono font-semibold">Rel Speed</span>
                            <span className="font-bold text-foreground text-sm font-mono">
                              {Number(ev.relative_velocity_km_s).toFixed(1)} km/s
                            </span>
                          </div>
                        )}

                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-muted-foreground uppercase font-mono font-semibold mb-1">Collision Pc</span>
                          <Badge variant={getBadgeVariant(ev.risk_tier, ev.pc)} className="font-mono text-xs px-3 py-1">
                            {formatScientific(ev.pc)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Conjunction Inspector Drawer (4 cols) */}
        <div className="lg:col-span-4">
          {selectedEvent ? (
            <Card className="border-border/80 bg-card/60 backdrop-blur-md sticky top-20 rounded-sm">
              <CardHeader className="pb-4 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Radio className="size-5 text-primary" />
                    <CardTitle className="text-base font-bold">Encounter Inspector</CardTitle>
                  </div>
                  <Badge variant={getBadgeVariant(selectedEvent.risk_tier, selectedEvent.pc)} className="font-mono text-xs px-2.5 py-0.5">
                    {selectedEvent.risk_tier || 'CRITICAL'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                {/* Pair Details */}
                <div className="space-y-2 p-3.5 rounded-xs bg-secondary/30 border border-border/50 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target:</span>
                    <span className="font-semibold text-foreground">{selectedEvent.target_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chaser:</span>
                    <span className="font-semibold text-foreground">{selectedEvent.chaser_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TCA (UTC):</span>
                    <span className="font-mono text-primary font-semibold">{selectedEvent.tca_utc}</span>
                  </div>
                </div>

                {/* Physics Values */}
                <div className="grid grid-cols-2 gap-2.5 font-mono">
                  <div className="p-3.5 rounded-xs bg-secondary/30 border border-border/50 flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">Miss Distance</span>
                    <strong className="text-base text-foreground mt-1 font-bold">
                      {formatDistance(selectedEvent.miss_distance_km)}
                    </strong>
                  </div>
                  <div className="p-3.5 rounded-xs bg-secondary/30 border border-border/50 flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">Rel Velocity</span>
                    <strong className="text-base text-foreground mt-1 font-bold">
                      {selectedEvent.relative_velocity_km_s ? `${Number(selectedEvent.relative_velocity_km_s).toFixed(2)} km/s` : '14.12 km/s'}
                    </strong>
                  </div>
                  <div className="p-3.5 rounded-xs bg-secondary/30 border border-border/50 flex flex-col col-span-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">Analytic Pc (Foster/Alfano)</span>
                      <strong className="text-emerald-400 text-base font-bold">
                        {formatScientific(selectedEvent.pc)}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2.5 pt-2">
                  <Button
                    onClick={() => {
                      sound.playClick();
                      onOpenManeuver(selectedEvent);
                    }}
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-md h-11"
                  >
                    <Zap className="size-4 mr-2" />
                    <span>Simulate CW Avoidance Burn</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      sound.playClick();
                      onOpenBPlane(selectedEvent);
                    }}
                    className="w-full border-border hover:bg-accent/60 text-sm h-11"
                  >
                    <span>View Encounter B-Plane</span>
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed text-center pt-1">
                  Assumes isotropic uncertainty σ = 500m & HBR = 10m combined cross-section.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/60 bg-card/40 p-10 text-center text-muted-foreground text-sm rounded-sm">
              Select any conjunction from the list to inspect encounter telemetry.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
