import React, { useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

export default function GuideBox({ title, steps = [], note, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-sm border border-border/80 bg-card/50 overflow-hidden">
        <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-accent/40 transition-colors">
          <div className="flex items-center gap-2">
            <Info className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">{title}</span>
          </div>
          <ChevronDown
            className={cn(
              'size-4 text-muted-foreground transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 pt-1 space-y-3 border-t border-border/60">
            {steps.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="rounded-xs border border-border/60 bg-background/50 p-3 space-y-1"
                  >
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {note && (
              <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3">
                {note}
              </p>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
