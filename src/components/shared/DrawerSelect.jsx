import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from '@/components/ui/drawer';

export default function DrawerSelect({ id, label, value, options, onValueChange, className = '', style }) {
  const [open, setOpen] = useState(false);
  const choices = options.map(option => typeof option === 'string' ? { value: option, label: option } : option);
  const selected = choices.find(option => option.value === value);
  return (
    <Drawer open={open} onOpenChange={setOpen} shouldScaleBackground={false} autoFocus>
      <DrawerTrigger asChild>
        <button id={id} type="button" aria-label={`${label}: ${selected?.label || value || 'Select'}`}
          className={`min-h-11 flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring ${className}`} style={style}>
          <span>{selected?.label || value || label}</span><ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0" />
        </button>
      </DrawerTrigger>
      <DrawerContent className="mx-auto max-w-lg max-h-[85dvh] bg-card text-card-foreground pb-[max(1rem,env(safe-area-inset-bottom))]">
        <DrawerHeader>
          <DrawerTitle className="font-heading">{label}</DrawerTitle>
          <DrawerDescription className="sr-only">Choose an option. Your selection closes this panel.</DrawerDescription>
        </DrawerHeader>
        <div className="min-h-0 overflow-y-auto overscroll-contain px-4" aria-label={label}>
          {choices.map(option => (
            <button key={option.value} type="button" disabled={option.disabled} aria-pressed={value === option.value}
              onClick={() => { onValueChange(option.value); setOpen(false); }}
              className={`min-h-14 w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring ${value === option.value ? 'bg-primary/10 text-primary' : 'text-card-foreground'}`}>
              <span>{option.label}</span>{value === option.value && <Check aria-hidden="true" className="h-5 w-5 shrink-0" />}
            </button>
          ))}
        </div>
        <DrawerClose asChild><button type="button" className="mx-4 mt-3 min-h-11 rounded-xl bg-secondary text-secondary-foreground font-semibold">Cancel</button></DrawerClose>
      </DrawerContent>
    </Drawer>
  );
}