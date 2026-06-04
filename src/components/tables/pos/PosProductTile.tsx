import React, { memo } from 'react';
import { cn } from '@/lib/utils';

interface PosProductTileProps {
  id: string;
  name: string;
  price: number;
  accent: string; // tailwind color class like "bg-orange-100"
  onClick: (id: string) => void;
}

const PosProductTileImpl: React.FC<PosProductTileProps> = ({ id, name, price, accent, onClick }) => {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={cn(
        'h-[76px] rounded-lg border text-left p-2 flex flex-col justify-between transition active:scale-[0.96] hover:border-primary hover:shadow-sm',
        accent,
      )}
    >
      <p className="text-[13px] font-semibold leading-tight line-clamp-2 text-foreground">{name}</p>
      <p className="text-xs font-bold text-foreground/80">{price.toLocaleString()} XAF</p>
    </button>
  );
};

export const PosProductTile = memo(PosProductTileImpl);

// Stable color palette per category
const PALETTE = [
  'bg-orange-50 border-orange-200',
  'bg-blue-50 border-blue-200',
  'bg-emerald-50 border-emerald-200',
  'bg-pink-50 border-pink-200',
  'bg-amber-50 border-amber-200',
  'bg-violet-50 border-violet-200',
  'bg-teal-50 border-teal-200',
  'bg-rose-50 border-rose-200',
  'bg-sky-50 border-sky-200',
  'bg-lime-50 border-lime-200',
];

export const colorForCategory = (cat: string): string => {
  let h = 0;
  for (let i = 0; i < cat.length; i++) h = (h * 31 + cat.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
};
