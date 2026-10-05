import { useState } from 'react';
import { getChartTheme } from './palette';

// Status/categorical donut -- built in plain SVG per the dataviz skill's
// components.md (no charting library dependency for one chart type). Specs
// followed: 2px surface gap between segments (not a stroke), a legend
// always present for >=2 series with direct values, per-segment hover
// tooltip, text stays in ink tokens (never the series color).
export default function DonutChart({ data, size = 180, thickness = 28 }) {
  const theme = getChartTheme();
  const [hovered, setHovered] = useState(null);

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = size / 2;
  const innerRadius = radius - thickness;
  const gapDeg = total > 0 ? 2 : 0; // 2px-equivalent angular gap between segments

  let angle = -90;
  const segments = data
    .filter((d) => d.value > 0)
    .map((d) => {
      const fraction = total > 0 ? d.value / total : 0;
      const sweep = fraction * 360 - gapDeg;
      const start = angle;
      const end = angle + Math.max(sweep, 0);
      angle += fraction * 360;
      return { ...d, start, end };
    });

  function arcPath(startDeg, endDeg) {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const sx = radius + radius * Math.cos(toRad(startDeg));
    const sy = radius + radius * Math.sin(toRad(startDeg));
    const ex = radius + radius * Math.cos(toRad(endDeg));
    const ey = radius + radius * Math.sin(toRad(endDeg));
    const isx = radius + innerRadius * Math.cos(toRad(startDeg));
    const isy = radius + innerRadius * Math.sin(toRad(startDeg));
    const iex = radius + innerRadius * Math.cos(toRad(endDeg));
    const iey = radius + innerRadius * Math.sin(toRad(endDeg));
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${sx} ${sy} A ${radius} ${radius} 0 ${largeArc} 1 ${ex} ${ey} L ${iex} ${iey} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${isx} ${isy} Z`;
  }

  if (total === 0) {
    return <p className="empty-state">No data yet.</p>;
  }

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative' }}>
        <svg width={size} height={size} role="img" aria-label="Status breakdown">
          {segments.map((seg) => (
            <path
              key={seg.label}
              d={arcPath(seg.start, seg.end)}
              fill={seg.color}
              opacity={hovered && hovered !== seg.label ? 0.45 : 1}
              style={{ cursor: 'pointer', transition: 'opacity 0.12s' }}
              onPointerEnter={() => setHovered(seg.label)}
              onPointerLeave={() => setHovered(null)}
              onFocus={() => setHovered(seg.label)}
              onBlur={() => setHovered(null)}
              tabIndex={0}
            >
              <title>{`${seg.label}: ${seg.value} (${Math.round((seg.value / total) * 100)}%)`}</title>
            </path>
          ))}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: theme.ink }}>{total}</div>
          <div style={{ fontSize: 11, color: theme.inkSoft }}>total</div>
        </div>
      </div>

      <div>
        {data.filter((d) => d.value > 0).map((d) => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, opacity: hovered && hovered !== d.label ? 0.5 : 1 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: theme.ink }}>{d.label}</span>
            <span style={{ fontSize: 13, color: theme.inkSoft, marginLeft: 'auto', fontVariantNumeric: 'tabular-nums' }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
