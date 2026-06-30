import React, { memo, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Delete, Percent, Hash, Tag, Trash2 } from 'lucide-react';

export type NumpadMode = 'qty' | 'price' | 'discount';

interface PosNumpadProps {
  mode: NumpadMode;
  onModeChange: (m: NumpadMode) => void;
  buffer: string;
  onBufferChange: (next: string) => void;
  onDeleteLine: () => void;
  disabled?: boolean;
}

const KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', '←'];

const PosNumpadImpl: React.FC<PosNumpadProps> = ({
  mode,
  onModeChange,
  buffer,
  onBufferChange,
  onDeleteLine,
  disabled,
}) => {
  const press = useCallback(
    (k: string) => {
      if (disabled) return;
      if (k === '←') {
        onBufferChange(buffer.slice(0, -1));
        return;
      }
      if (k === '.') {
        if (buffer.includes('.')) return;
        onBufferChange((buffer || '0') + '.');
        return;
      }
      // Replace leading 0 unless decimal
      const next = buffer === '0' ? k : buffer + k;
      onBufferChange(next.slice(0, 10));
    },
    [buffer, onBufferChange, disabled],
  );

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      if (disabled) return;
      if (/^[0-9]$/.test(e.key)) {
        press(e.key);
      } else if (e.key === '.' || e.key === ',') {
        press('.');
      } else if (e.key === 'Backspace') {
        press('←');
      } else if (e.key.toLowerCase() === 'q') {
        onModeChange('qty');
      } else if (e.key.toLowerCase() === 'p') {
        onModeChange('price');
      } else if (e.key.toLowerCase() === 'r') {
        onModeChange('discount');
      } else if (e.key === 'Delete') {
        onDeleteLine();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [press, onModeChange, onDeleteLine, disabled]);

  const modeBtn = (m: NumpadMode, label: string, Icon: any) => (
    <button
      type="button"
      onClick={() => onModeChange(m)}
      className={cn(
        'flex items-center justify-center gap-1 h-9 rounded-md text-xs font-semibold border transition active:scale-[0.97]',
        mode === m
          ? 'bg-primary text-primary-foreground border-primary shadow'
          : 'bg-background hover:bg-accent border-border',
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </button>
  );

  return (
    <div className="p-1.5 border-t bg-muted/20 space-y-1.5">
      <div className="grid grid-cols-3 gap-1">
        {modeBtn('qty', 'Qté', Hash)}
        {modeBtn('discount', 'Remise', Percent)}
        <button
          type="button"
          onClick={onDeleteLine}
          disabled={disabled}
          className="flex items-center justify-center gap-1 h-9 rounded-md text-xs font-semibold border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20 transition active:scale-[0.97] disabled:opacity-40"
        >
          <Trash2 className="h-3 w-3" />
          Suppr.
        </button>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {KEYS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => press(k)}
            disabled={disabled}
            className={cn(
              'h-9 rounded-md font-bold text-sm bg-background border hover:bg-accent transition active:scale-[0.95] disabled:opacity-40',
              k === '←' && 'text-destructive',
            )}
          >
            {k === '←' ? <Delete className="h-3.5 w-3.5 mx-auto" /> : k}
          </button>
        ))}
      </div>
    </div>
  );
};

export const PosNumpad = memo(PosNumpadImpl);
