import React from 'react';
import { BookOpen, Cpu, ShieldAlert, Binary, Rocket } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function MathExplainer() {
  return (
    <Card className="border-border/80 bg-card/60 backdrop-blur-md shadow-sm font-sans">
      <CardHeader className="pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <BookOpen className="size-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
              Orbital Mechanics & Mathematical Foundations
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Foster/Alfano Pc analytic derivation, golden-section TCA search, and Clohessy-Wiltshire dynamics
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Stage 1 & 2 */}
          <div className="p-4 rounded-sm border border-border/70 bg-secondary/20 space-y-2">
            <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
              <Binary className="size-4 text-primary" />
              <span>1. Two-Stage Conjunction Screening</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Direct O(N²) pairwise search of 27,000+ objects is computationally prohibitive. Space-Guard applies a two-stage filter:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li><strong className="text-foreground">Coarse Filter:</strong> Discards pairs without overlapping apogee/perigee altitude bands within ±50 km.</li>
              <li><strong className="text-foreground">Fine TCA Search:</strong> Uses <code className="text-primary font-mono">scipy.optimize.minimize_scalar</code> (Golden section/Brent) on relative distance to pinpoint exact encounter time.</li>
            </ul>
          </div>

          {/* Stage 3 Pc */}
          <div className="p-4 rounded-sm border border-border/70 bg-secondary/20 space-y-2">
            <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
              <Cpu className="size-4 text-emerald-400" />
              <span>2. Foster/Alfano Analytic Pc Formulation</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              In the encounter B-plane normal to relative velocity, collision probability is the 2D Gaussian integral over the hard-body circle:
            </p>
            <div className="p-2.5 rounded-xs bg-background/80 text-emerald-400 font-mono font-semibold text-center border border-border text-xs">
              Pc ≈ (HBR² / 2σ²) · exp(-d_miss² / 2σ²)
            </div>
            <p className="text-muted-foreground">
              Because HBR ≈ 10m ≪ σ ≈ 500m, probability density is near-constant over the disk, yielding exact analytic evaluation in &lt; 10 µs.
            </p>
          </div>

          {/* Stage 4 ML */}
          <div className="p-4 rounded-sm border border-border/70 bg-secondary/20 space-y-2">
            <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
              <ShieldAlert className="size-4 text-amber-400" />
              <span>3. ML Surrogate Acceleration Layer</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Space-Guard uses machine learning strictly as an acceleration surrogate to reduce compute overhead:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Trained on orbital parameters (miss distance, relative velocity, altitude, radial rates).</li>
              <li>Predicts candidate priority instantaneously to filter high-consequence pairs before executing full numerical propagation.</li>
            </ul>
          </div>

          {/* Stage 5 CW */}
          <div className="p-4 rounded-sm border border-border/70 bg-secondary/20 space-y-2">
            <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
              <Rocket className="size-4 text-primary" />
              <span>4. Clohessy-Wiltshire (CW) Maneuver SVD</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Relative motion in circular/near-circular orbit is governed by the CW State Transition Matrix Φ(Δt):
            </p>
            <div className="p-2.5 rounded-xs bg-background/80 text-foreground font-mono text-center border border-border text-xs">
              r(Δt) = Φ_rr(Δt) · r₀ + Φ_rv(Δt) · (v₀ + Δv)
            </div>
            <p className="text-muted-foreground">
              Optimal burn direction is determined via <strong className="text-foreground">SVD</strong> of Φ_rv, aligning Δv with the right singular vector to maximize miss distance shift.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
