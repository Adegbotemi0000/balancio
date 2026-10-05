import { useState } from 'react';
import { getChartTheme } from './palette';

// Single-series magnitude bar chart -- plain SVG, no charting library.
// Specs followed: bars capped at 24px thick, 4px rounded data-end square at
// baseline, 2px surface gap between bars, hairline recessive gridlines,
// value labelled at the bar cap (moved above the bar when it won't fit
// inside), per-bar hover tooltip. Single series -> no legend box (the
// card's own heading names what's plotted).
export default function BarChart({ data, height = 160, formatValue = (v) => v.toLocaleString() }) {
  const theme = getChartTheme();
  const [hovered, setHovered] = useState(null);

  const max = Math.max(1, ...data.map((d) => d.value));
  const barWidth = Math.min(24, Math.max(10, 240 / data.length - 8));
  const gap = Math.max(8, 240 / data.length - barWidth);
  const chartWidth = data.length * (barWidth + gap);
  const topPadding = 24; // room for the value label above a tall bar
  const bottomPadding = 18; // room for the category label below the baseline

  // Clean gridline steps (0, max/2, max), rounded to a tidy number.
  function niceStep(n) {
    const magnitude = Math.pow(10, Math.floor(Math.log10(n || 1)));
    const residual = n / magnitude;
    const step = residual > 5 ? 10 : residual > 2 ? 5 : residual > 1 ? 2 : 1;
    return step * magnitude;
  }
  const gridStep = niceStep(max / 2) || 1;
  const gridLines = [0, gridStep, gridStep * 2].filter((v) => v <= max * 1.15);

  return (
    <div>
      <svg width="100%" height={height + topPadding + bottomPadding} viewBox={`0 0 ${chartWidth} ${height + topPadding + bottomPadding}`} preserveAspectRatio="xMinYMid meet" role="img">
        {gridLines.map((v) => {
          const y = topPadding + height - (v / (max * 1.15 || 1)) * height;
          return <line key={v} x1={0} x2={chartWidth} y1={y} y2={y} stroke={theme.grid} strokeWidth={1} />;
        })}

        {data.map((d, i) => {
          const barHeight = (d.value / (max * 1.15 || 1)) * height;
          const x = i * (barWidth + gap);
          const y = topPadding + height - barHeight;
          const isHovered = hovered === i;
          const labelFitsInside = barHeight > 20;
          return (
            <g key={d.label} onPointerEnter={() => setHovered(i)} onPointerLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                rx={4}
                fill={theme.categorical[0]}
                opacity={hovered !== null && !isHovered ? 0.55 : 1}
                style={{ transition: 'opacity 0.12s' }}
              >
                <title>{`${d.label}: ${formatValue(d.value)}`}</title>
              </rect>
              <text
                x={x + barWidth / 2}
                y={labelFitsInside ? y + 14 : y - 6}
                textAnchor="middle"
                fontSize={10}
                fill={labelFitsInside ? '#fff' : theme.inkSoft}
                style={{ fontVariantNumeric: 'tabular-nums', pointerEvents: 'none' }}
              >
                {isHovered || i === data.length - 1 ? formatValue(d.value) : ''}
              </text>
              <text x={x + barWidth / 2} y={topPadding + height + 14} textAnchor="middle" fontSize={10} fill={theme.inkSoft} style={{ pointerEvents: 'none' }}>
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
