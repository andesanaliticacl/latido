interface Props {
  activo: boolean;
  onCambio: (v: boolean) => void;
  etiqueta?: string;
}

/** Interruptor grande y accesible (≥44px de área táctil) */
export function Toggle({ activo, onCambio, etiqueta }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={etiqueta}
      onClick={() => onCambio(!activo)}
      className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${
        activo ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
      }`}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${
          activo ? 'left-7' : 'left-1'
        }`}
      />
    </button>
  );
}
