interface Props {
  valores: number[];
  ancho?: number;
  alto?: number;
  clase?: string;
}

/** Mini-gráfico de tendencia sin librerías: un polyline SVG */
export function Sparkline({ valores, ancho = 140, alto = 36, clase = 'stroke-rose-400' }: Props) {
  if (valores.length < 2) {
    return <div style={{ width: ancho, height: alto }} />;
  }
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const rango = Math.max(1, max - min);
  const puntos = valores
    .map((v, i) => {
      const x = (i / (valores.length - 1)) * ancho;
      const y = alto - 3 - ((v - min) / rango) * (alto - 6);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg width={ancho} height={alto} className="overflow-visible" aria-hidden="true">
      <polyline
        points={puntos}
        fill="none"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={clase}
      />
    </svg>
  );
}
