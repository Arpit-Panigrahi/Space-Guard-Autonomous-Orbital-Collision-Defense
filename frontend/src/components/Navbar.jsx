import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Globe2,
  Radar,
  Rocket,
  History,
  Target,
  Satellite,
  BookOpen,
  Volume2,
  VolumeX,
  Menu,
  X,
  Orbit,
  Layers,
} from 'lucide-react';
import { sound } from '../utils/audio';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Navbar({ backendStatus, dataAsOf }) {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    sound.enabled = false;
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    if (next) {
      sound.playGrandActivation();
      sound.startAmbientDrone();
    } else {
      sound.stopAmbientDrone();
    }
  };

  const navLinks = [
    { to: '/', label: 'Overview', icon: Orbit },
    { to: '/screening', label: 'Screening', icon: Radar },
    { to: '/globe', label: '3D Radar', icon: Globe2 },
    { to: '/maneuver', label: 'Maneuver', icon: Rocket },
    { to: '/bplane', label: 'B-Plane', icon: Target },
    { to: '/historical', label: '2009 Replay', icon: History },
    { to: '/walkthrough', label: 'Walkthrough', icon: Layers },
    { to: '/docs', label: 'Docs', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#070b14]/85 backdrop-blur-xl border-b border-white/[0.08] transition-all select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-3 sm:px-6 lg:px-8">
        
        {/* ── 1. BRAND LOGO (with generous right margin & subtle divider) ── */}
        <div className="flex items-center gap-3 sm:gap-6 lg:gap-10 shrink-0 min-w-0">
          <Link 
            to="/" 
            onClick={() => sound.playClick()}
            className="flex items-center gap-2.5 sm:gap-3.5 group py-1 min-w-0"
          >
            <div className="relative flex items-center justify-center size-9 rounded-sm bg-primary/10 border border-primary/25 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary group-hover:shadow-[0_0_16px_rgba(59,130,246,0.4)] transition-all duration-300">
              <Orbit className="size-5 transition-transform duration-500 group-hover:rotate-90" />
              <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[14px] sm:text-[15px] font-bold tracking-tight text-white group-hover:text-primary transition-colors font-sans truncate">
                  SPACE-GUARD
                </span>
                <span className="hidden sm:inline text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-xs bg-white/[0.06] text-muted-foreground border border-white/[0.08]">
                  v2.1
                </span>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground/80 tracking-tight hidden sm:block">
                Orbital Collision Defense
              </span>
            </div>
          </Link>
        </div>

        {/* ── 2. CENTER SEGMENTED NAVIGATION PILLS (with spacious layout) ── */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] border border-white/[0.08] p-1 rounded-sm shadow-inner mx-4">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => sound.playClick()}
                className={({ isActive }) =>
                  cn(
                    'px-3 py-1.5 text-[13px] rounded-xs font-medium transition-all duration-150 flex items-center gap-1.5 select-none cursor-pointer whitespace-nowrap',
                    isActive
                      ? 'bg-white/[0.12] text-white border border-white/[0.15] shadow-xs font-semibold'
                      : 'text-muted-foreground hover:text-white hover:bg-white/[0.05] border border-transparent'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={cn('size-3.5 transition-colors', isActive ? 'text-primary' : 'opacity-70')} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* ── 3. RIGHT ACTION CONTROLS ── */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 pl-2">
          {/* Live Telemetry Beacon */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xs bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-muted-foreground">
            <span
              className={cn(
                'size-1.5 rounded-full transition-all',
                backendStatus 
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse' 
                  : 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]'
              )}
            />
            <span className="text-white font-medium text-[11px] tracking-wide uppercase">
              {backendStatus ? 'Live Telemetry' : 'Offline'}
            </span>
          </div>

          {/* Audio Synthesis Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute audio' : 'Enable audio'}
            className={cn(
              'size-9 rounded-sm flex items-center justify-center transition-all border cursor-pointer',
              soundEnabled
                ? 'bg-primary/15 border-primary/40 text-primary shadow-[0_0_12px_rgba(59,130,246,0.25)]'
                : 'bg-white/[0.03] border-white/[0.08] text-muted-foreground hover:text-white hover:bg-white/[0.06]'
            )}
          >
            {soundEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </button>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden size-9 rounded-sm flex items-center justify-center bg-white/[0.03] border border-white/[0.08] text-muted-foreground hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
          >
            {mobileMenuOpen ? <X className="size-4.5" /> : <Menu className="size-4.5" />}
          </button>
        </div>
      </div>

      {/* ── 4. RESPONSIVE MOBILE NAVIGATION DRAWER ── */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/[0.08] bg-[#070b14]/95 backdrop-blur-2xl px-3 sm:px-4 py-3 animate-fade-in space-y-1">
          <div className="flex items-center justify-between px-3 py-2 text-xs font-mono text-muted-foreground border-b border-white/[0.06] mb-2">
            <span>SYSTEM STATUS</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {backendStatus ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => {
                    sound.playClick();
                    setMobileMenuOpen(false);
                  }}
                  className={({ isActive }) =>
                    cn(
                      'px-3 py-2.5 rounded-xs text-sm flex items-center gap-2.5 transition-all font-medium',
                      isActive
                        ? 'bg-primary/15 text-white border border-primary/30 font-semibold'
                        : 'text-muted-foreground hover:text-white hover:bg-white/[0.05]'
                    )
                  }
                >
                  <Icon className="size-4 opacity-80 text-primary" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
