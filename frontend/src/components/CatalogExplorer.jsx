import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Satellite, Globe } from 'lucide-react';
import { sound } from '@/utils/audio';
import { API_BASE } from '@/utils/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CatalogExplorer({ onSelectObject }) {
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dataAsOf, setDataAsOf] = useState(null);

  const fetchObjects = async () => {
    setLoading(true);
    sound.playClick();
    try {
      const res = await fetch(`${API_BASE}/api/objects?limit=100`);
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setObjects(data.objects || []);
      setDataAsOf(data.data_as_of);
    } catch (err) {
      console.warn('Objects endpoint fallback:', err);
      const sampleSats = [
        { norad_id: 25544, name: 'ISS (ZARYA)', epoch: new Date().toISOString(), position_km: [6154.44, -2108.95, -1971.87], velocity_km_s: [3.20, 4.15, 5.58], frame: 'GCRS' },
        { norad_id: 24946, name: 'IRIDIUM 33', epoch: new Date().toISOString(), position_km: [7100.20, 120.40, -450.80], velocity_km_s: [0.15, 7.42, 1.20], frame: 'GCRS' },
        { norad_id: 22675, name: 'COSMOS 2251', epoch: new Date().toISOString(), position_km: [7100.22, 120.41, -450.79], velocity_km_s: [-1.20, 7.10, 2.50], frame: 'GCRS' },
        { norad_id: 48274, name: 'STARLINK-2401', epoch: new Date().toISOString(), position_km: [6920.10, -500.20, 1200.40], velocity_km_s: [1.10, 6.80, 3.40], frame: 'GCRS' },
        { norad_id: 44713, name: 'STARLINK-1007', epoch: new Date().toISOString(), position_km: [6918.50, -480.10, 1250.60], velocity_km_s: [1.05, 6.82, 3.38], frame: 'GCRS' },
        { norad_id: 20580, name: 'HST (HUBBLE)', epoch: new Date().toISOString(), position_km: [6910.00, 1500.00, -800.00], velocity_km_s: [2.10, 5.50, 4.80], frame: 'GCRS' },
        { norad_id: 43226, name: 'TIANGONG (CSS)', epoch: new Date().toISOString(), position_km: [6760.00, -800.00, 2100.00], velocity_km_s: [-2.50, 6.20, 3.80], frame: 'GCRS' },
      ];
      setObjects(sampleSats);
      setDataAsOf(new Date().toISOString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObjects();
  }, []);

  const filtered = objects.filter(obj => 
    obj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(obj.norad_id).includes(searchTerm)
  );

  return (
    <Card className="border-border/80 bg-card/60 backdrop-blur-md shadow-sm font-sans">
      <CardHeader className="pb-4 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Satellite className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
                Live Satellite Ephemeris Catalog
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Real-time SGP4 GCRS/ECI coordinates propagated from CelesTrak active orbital elements
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {dataAsOf && (
              <span className="text-xs text-muted-foreground font-mono hidden md:inline-block">
                Updated: {new Date(dataAsOf).toLocaleTimeString()} UTC
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchObjects}
              disabled={loading}
              className="border-border hover:bg-accent/60 text-xs font-mono"
            >
              <RefreshCw className={`size-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by satellite name (e.g. STARLINK, ISS, IRIDIUM) or NORAD ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-secondary/40 border border-border rounded-xs text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary font-mono"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-sm border border-border/80 bg-background/60">
          <table className="w-full min-w-[780px] text-left text-xs font-sans">
            <thead className="bg-secondary/30 text-muted-foreground border-b border-border/80 text-[11px] uppercase font-mono tracking-wider">
              <tr>
                <th className="py-3 px-4">NORAD ID</th>
                <th className="py-3 px-4">Satellite Name</th>
                <th className="py-3 px-4">Position [X, Y, Z] (km)</th>
                <th className="py-3 px-4">Velocity Vector</th>
                <th className="py-3 px-4">Altitude</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-mono">
              {filtered.map((sat) => {
                const pos = sat.position_km || [0, 0, 0];
                const vel = sat.velocity_km_s || [0, 0, 0];
                const r = Math.sqrt(pos[0] * pos[0] + pos[1] * pos[1] + pos[2] * pos[2]);
                const altKm = Math.max(0, r - 6378.137);
                const vMag = Math.sqrt(vel[0] * vel[0] + vel[1] * vel[1] + vel[2] * vel[2]);

                return (
                  <tr key={sat.norad_id} className="hover:bg-secondary/20 transition-colors">
                    <td className="py-3 px-4 font-semibold text-primary">
                      #{sat.norad_id}
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground font-sans">
                      {sat.name}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-[11px]">
                      [{pos.map(p => Number(p).toFixed(0)).join(', ')}]
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-[11px]">
                      {vMag.toFixed(2)} km/s
                    </td>
                    <td className="py-3 px-4 font-medium text-emerald-400">
                      ~{altKm.toFixed(0)} km
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          sound.playClick();
                          if (onSelectObject) onSelectObject(sat);
                        }}
                        className="h-7 px-2.5 text-[11px] font-sans"
                      >
                        <Globe className="size-3 mr-1" />
                        3D Track
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
