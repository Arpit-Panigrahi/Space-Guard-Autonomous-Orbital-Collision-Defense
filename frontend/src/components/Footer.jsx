import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border/60 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="space-y-1">
          <p className="text-foreground font-medium">Space-Guard v2.1.0</p>
          <p className="text-xs max-w-md leading-relaxed">
            Conjunction screening with Foster/Alfano analytic Pc and Clohessy-Wiltshire maneuver planning.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          <Link to="/docs" className="hover:text-foreground transition-colors">
            Documentation
          </Link>
          <Link to="/screening" className="hover:text-foreground transition-colors">
            Screening
          </Link>
          <a
            href="https://github.com/mkdirharkeerat/space-guard"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            GitHub
            <ExternalLink className="size-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
