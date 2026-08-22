import React from 'react';
import { Link } from 'react-router-dom';
import {
  Globe2,
  Radar,
  Rocket,
  History,
  Target,
  Satellite,
  ArrowRight,
  Activity,
  Cpu,
  ChevronRight,
  AlertTriangle,
  Zap,
  BookOpen,
  TrendingDown,
  Layers,
  Sparkles
} from 'lucide-react';
import FadeIn from '@/components/FadeIn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BlurText from '@/components/react-bits/BlurText';
import CountUp from '@/components/react-bits/CountUp';
import SpotlightCard from '@/components/react-bits/SpotlightCard';
import DotGrid from '@/components/react-bits/DotGrid';
import { sound } from '@/utils/audio';

export default function HomePage({ backendStatus, scanData }) {

  // ── Section 1: Core theory explanation cards
  const theoryCards = [
    {
      icon: AlertTriangle,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/30',
      title: 'The Problem — Orbital Saturation',
      body: 'Over 27,000 tracked objects circle Earth in Low Earth Orbit. At orbital altitudes, objects pass at closing speeds up to 14 km/s (50,800 km/h) — meaning any collision is instant annihilation, generating thousands of hypervelocity shrapnel pieces.',
    },
    {
      icon: Zap,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
      title: 'The Challenge — Orbital Counter-Intuition',
      body: 'Unlike terrestrial traffic, you cannot brake in orbit. Firing thrusters backwards drops your altitude, shrinking your orbital circumference and speeding up your angular rate. Evasion requires solving relative motion under gravity.',
    },
    {
      icon: Cpu,
      color: 'text-primary',
      bg: 'bg-primary/10 border-primary/30',
      title: 'The Solution — Exact Deterministic Physics',
      body: 'Space-Guard integrates the Foster/Alfano 2D Gaussian equation over the encounter B-Plane to calculate collision risk in microseconds, then computes the fuel-optimal avoidance burn via Clohessy-Wiltshire singular value decomposition (SVD).',
    },
  ];

  // ── Section 2: How Pc is calculated (theory detail)
  const physicsDetail = [
    {
      step: 'Ⅰ',
      label: 'B-Plane Projection',
      detail: 'At the instant of closest approach (TCA), relative motion freezes into a 2D plane perpendicular to incoming velocity. The 3D miss vector maps directly to a 2D coordinate b on this target disk.',
    },
    {
      step: 'Ⅱ',
      label: 'Gaussian Uncertainty Cloud',
      detail: 'Tracking radars carry measurement uncertainty (σ = 500 m). We model this as a 2D Gaussian probability density centered around the predicted position.',
    },
    {
      step: 'Ⅲ',
      label: 'Foster/Alfano Risk Integral',
      detail: 'The collision probability (Pc) is the exact volume of that Gaussian bell curve enclosed by the combined physical cross-section of both satellites (Hard-Body Radius = 10 m).',
    },
    {
      step: 'Ⅳ',
      label: 'Optimal CW Avoidance Thrust',
      detail: 'When Pc exceeds 10⁻⁴, the Clohessy-Wiltshire state transition matrix determines the singular vector direction that yields the maximum kilometers of clearance per unit of fuel spent.',
    },
  ];

  // ── Section 3: Module cards
  const modules = [
    {
      to: '/walkthrough',
      title: 'Astrodynamics Walkthrough',
      icon: Layers,
      tag: 'STEP-BY-STEP LAB',
      desc: 'Interactive 4-stage pipeline walkthrough: live SGP4 ingestion, 3D orbital radar, 2009 collision benchmark, and avoidance simulation.',
    },
    {
      to: '/screening',
      title: 'Conjunction Screening',
      icon: Radar,
      tag: 'TWO-STAGE FILTER',
      desc: 'Stage 1 altitude filter eliminates non-overlapping pairs. Stage 2 executes golden-section TCA search and Foster/Alfano analytic Pc.',
    },
    {
      to: '/maneuver',
      title: 'Maneuver Planner',
      icon: Rocket,
      tag: 'SVD OPTIMIZER',
      desc: 'Calculate optimal impulsive ΔV burns via Clohessy-Wiltshire STM singular value decomposition, demonstrating 14× early fuel scaling.',
    },
    {
      to: '/historical',
      title: '2009 Collision Replay',
      icon: History,
      tag: 'CASE STUDY',
      desc: 'Replay the 2009 Iridium 33 / Cosmos 2251 collision from pre-event TLEs and simulate the counterfactual avoidance maneuver.',
    },
    {
      to: '/bplane',
      title: 'B-Plane Geometry',
      icon: Target,
      tag: '2D GAUSSIAN',
      desc: 'Visualise the encounter cross-section with 1σ, 2σ, 3σ Gaussian uncertainty contours and a 10m hard-body radius circle.',
    },
    {
      to: '/globe',
      title: '3D Orbital Radar',
      icon: Globe2,
      tag: '3D TELEMETRY',
      desc: 'Live satellites propagated in real-time on an interactive 3D WebGL Earth globe with altitude band markers and conjunction nodes.',
    },
  ];

  // ── Section 4: Pipeline steps
  const pipeline = [
    { step: '01', title: 'TLE Ingestion & SGP4', desc: 'Catalog TLEs fetched from CelesTrak and propagated to GCRS/ECI coordinates at the current UTC second.', badge: 'PROPAGATION' },
    { step: '02', title: 'Coarse Altitude Filter', desc: 'Non-overlapping apogee/perigee altitude pairs outside ±50 km are discarded instantly without complex floating-point math.', badge: 'STAGE 1' },
    { step: '03', title: 'TCA Search & Analytic Pc', desc: 'Golden-section scalar minimisation pinpoints exact TCA; Foster/Alfano formula returns Pc in under 10 µs.', badge: 'STAGE 2' },
    { step: '04', title: 'CW Maneuver Optimization', desc: 'For pairs with Pc > 10⁻⁴, Clohessy-Wiltshire STM + SVD calculates the minimum-fuel impulsive ΔV burn heading.', badge: 'AVOIDANCE' },
  ];

  return (
    <div className="relative flex flex-col gap-0 pb-16 font-sans">
      <DotGrid className="opacity-30" />

      {/* ═══════════════════════════════════════════════════════
          HERO — Full-screen landing section
      ═══════════════════════════════════════════════════════ */}
      <FadeIn>
        <section className="relative min-h-[75vh] sm:min-h-[85vh] flex flex-col justify-center gap-8 sm:gap-10 pt-6 sm:pt-8 pb-14 sm:pb-16 border-b border-border/60">

          {/* Top label row */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge variant="outline" className="font-mono text-xs border-primary/40 text-primary bg-primary/10 px-3.5 py-1">
              ORBITAL MECHANICS
            </Badge>
            <Badge variant="outline" className="font-mono text-xs border-border/80 text-muted-foreground px-3.5 py-1">
              Foster/Alfano · Clohessy-Wiltshire STM · SGP4
            </Badge>
          </div>

          {/* Hero headline */}
          <div className="space-y-5 sm:space-y-6 max-w-5xl">
            <h1 className="text-3xl min-[420px]:text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] text-foreground">
              <BlurText
                text="Autonomous Orbital Collision"
                delay={30}
                className="block"
              />
              <BlurText
                text="Assessment & Avoidance"
                delay={30}
                className="block text-primary"
              />
            </h1>
            <p className="text-muted-foreground text-base sm:text-2xl leading-relaxed max-w-3xl">
              A rigorous, physics-first system for detecting and preventing satellite collisions in Low Earth Orbit —
              built from orbital mechanics fundamentals, not heuristics.
            </p>
          </div>

          {/* CTA buttons */}
          <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 pt-1">
            <Button asChild size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg rounded-sm h-11 sm:h-12 px-5 sm:px-7 text-sm sm:text-base">
              <Link to="/screening" onClick={() => sound.playClick()}>
                <Activity className="size-5 mr-2.5" />
                Launch Screening
                <ArrowRight className="size-5 ml-2.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-border/80 hover:bg-accent/60 font-semibold rounded-sm h-11 sm:h-12 px-5 sm:px-7 text-sm sm:text-base">
              <Link to="/docs" onClick={() => sound.playClick()}>
                <BookOpen className="size-5 mr-2.5 text-primary" />
                Read the Theory
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="w-full sm:w-auto text-muted-foreground hover:text-foreground font-semibold rounded-sm h-11 sm:h-12 px-5 sm:px-7 text-sm sm:text-base">
              <Link to="/historical" onClick={() => sound.playClick()}>
                <History className="size-5 mr-2.5 text-rose-400" />
                2009 Replay Lab
              </Link>
            </Button>
          </div>

          {/* Telemetry stat strip */}
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            {[
              { label: 'Tracked objects', value: <CountUp to={27000} separator="," suffix="+" duration={1.5} />, sub: 'Active LEO debris', color: 'text-foreground' },
              { label: 'Closing velocity', value: <CountUp to={14.1} decimals={1} suffix=" km/s" duration={1.8} />, sub: 'Head-on scenario', color: 'text-foreground' },
              { label: 'Pc latency', value: '< 10 µs', sub: 'Per candidate pair', color: 'text-emerald-400' },
              { label: 'Fuel efficiency', value: <CountUp to={14} suffix="×" duration={1.4} />, sub: 'At 24h prior burn', color: 'text-primary' },
            ].map((stat, i) => (
              <div key={i} className="border border-border/80 bg-card/60 backdrop-blur-md p-4 sm:p-5 flex flex-col justify-between rounded-sm">
                <span className="text-xs text-muted-foreground font-semibold font-mono uppercase tracking-wider">{stat.label}</span>
                <div className={`text-3xl sm:text-4xl font-bold tracking-tight font-mono mt-2 ${stat.color}`}>
                  {stat.value}
                </div>
                <span className="text-xs text-muted-foreground/70 mt-1">{stat.sub}</span>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* ═══════════════════════════════════════════════════════
          THEORY — Why this exists (lucid first, then detailed)
      ═══════════════════════════════════════════════════════ */}
      <section className="py-20 space-y-12">
        <FadeIn>
          <div className="space-y-3 max-w-3xl">
            <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">Understanding the Problem</span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Why orbital collision avoidance is a hard, urgent problem
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Start here. Three fundamental realities explain why hypervelocity collision avoidance requires deterministic physics.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {theoryCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <FadeIn key={i}>
                <div className="h-full border border-border/80 bg-card/50 p-7 space-y-4 flex flex-col rounded-sm">
                  <div className={`size-12 rounded-xs border flex items-center justify-center shrink-0 ${card.bg}`}>
                    <Icon className={`size-6 ${card.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground leading-snug">{card.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{card.body}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PHYSICS DETAIL — Step-by-step math walkthrough
      ═══════════════════════════════════════════════════════ */}
      <section className="py-6 space-y-10 border-t border-border/60 pt-20">
        <FadeIn>
          <div className="space-y-3 max-w-3xl">
            <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">Physics Deep Dive</span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              How the math actually works
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Four sequential steps — from encounter geometry to fuel-optimal avoidance burn.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border/60 border border-border/60 rounded-sm overflow-hidden">
          {physicsDetail.map((item, i) => (
            <FadeIn key={i}>
              <div className="bg-background/95 p-7 space-y-3">
                <div className="flex items-center gap-3.5">
                  <span className="text-3xl font-light font-mono text-primary/70 font-bold">{item.step}</span>
                  <h4 className="text-base sm:text-lg font-bold text-foreground">{item.label}</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.detail}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PIPELINE — 4-stage architecture
      ═══════════════════════════════════════════════════════ */}
      <section className="py-20 space-y-10 border-t border-border/60">
        <FadeIn>
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-sm border border-border/80 bg-secondary flex items-center justify-center text-primary shrink-0">
              <Cpu className="size-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Four-Stage Physics Pipeline
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                From raw TLE catalog to impulsive ΔV avoidance burn — fully deterministic, no black boxes.
              </p>
            </div>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pipeline.map((s, i) => (
            <FadeIn key={s.step}>
              <div className="border border-border/80 bg-card/40 p-6 space-y-3.5 h-full flex flex-col rounded-sm relative">
                {/* Connector line on right (except last) */}
                {i < pipeline.length - 1 && (
                  <div className="hidden lg:block absolute top-8 right-0 translate-x-full w-5 h-px bg-border/80 z-10" />
                )}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold font-mono text-primary">{s.step}</span>
                  <Badge variant="outline" className="text-[10px] font-mono border-border/80 text-muted-foreground">
                    {s.badge}
                  </Badge>
                </div>
                <h4 className="text-base font-bold text-foreground">{s.title}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed flex-1">{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          MODULES GRID — Interactive workstations
      ═══════════════════════════════════════════════════════ */}
      <section className="py-6 space-y-10 border-t border-border/60 pt-20">
        <FadeIn>
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">Interactive Modules</span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Explore the system workstations
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Six live workstations — each a different lens on the orbital mechanics pipeline.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link key={mod.to} to={mod.to} onClick={() => sound.playClick()} className="group">
                <SpotlightCard className="h-full p-6 flex flex-col justify-between gap-5 rounded-sm">
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="size-11 rounded-xs bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                        <Icon className="size-5" />
                      </div>
                      <Badge variant="outline" className="text-xs font-mono border-border text-muted-foreground">
                        {mod.tag}
                      </Badge>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{mod.desc}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground group-hover:text-primary pt-3 border-t border-border/60 transition-colors">
                    <span>Open Workstation</span>
                    <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </SpotlightCard>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          2009 BENCHMARK BANNER
      ═══════════════════════════════════════════════════════ */}
      <FadeIn>
        <section className="mt-10 border border-rose-500/30 bg-rose-500/5 p-7 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 rounded-sm">
          <div className="space-y-3.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <TrendingDown className="size-5 text-rose-400" />
              <Badge variant="outline" className="text-rose-400 border-rose-500/40 font-mono text-xs">
                HISTORICAL BENCHMARK
              </Badge>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Validated against the 2009 Iridium 33 / Cosmos 2251 Collision
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Using actual pre-collision TLEs (epoch 09041), Space-Guard flags a <strong className="text-rose-400">Critical Alert (Pc &gt; 10⁻⁴)</strong> with
              48 hours of lead time. A modelled impulsive burn of just <strong className="text-foreground font-semibold">0.10 m/s</strong> creates <strong className="text-emerald-400 font-semibold">+4.83 km of orbital clearance</strong> —
              demonstrating that the 2009 event was entirely avoidable with early astrodynamics intervention.
            </p>
          </div>
          <Button asChild variant="outline" size="lg" className="border-rose-500/40 hover:bg-rose-500/15 text-foreground font-semibold shrink-0 rounded-sm h-12 px-6">
            <Link to="/historical" onClick={() => sound.playClick()}>
              <span>Launch Replay Lab</span>
              <ArrowRight className="size-4 ml-2" />
            </Link>
          </Button>
        </section>
      </FadeIn>
    </div>
  );
}
