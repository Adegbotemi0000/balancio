// Chart-specific color instance, derived from the brand accents but
// independently validated for colorblind-safe separation via the dataviz
// skill's validate_palette.js (run by hand, 2026-10-05) -- the brand's own
// gold/orange pair fails CVD separation outright (deutan ΔE 2.1, normal
// ΔE 14.3, both below the floor) so orange is excluded from chart/status
// color duty here and kept for warning-pill use only, where it's never
// adjacent to gold. Emerald is nudged slightly toward teal (#00875a ->
// #00897a light / #1fa391 dark) and red gets a dark-mode-only variant --
// both adjustments needed to pass CVD separation against gold once all 4
// status hues sit together. Every combination below is ALL-CHECKS-PASS
// (light) or PASS-with-a-legal-WARN requiring direct labels (dark, red vs
// teal ΔE 6.7 -- satisfied, every chart here labels directly). Re-validate
// with `node scripts/validate_palette.js "<hex,hex,...>" --mode <light|dark>
// --surface <hex> --pairs all` from the dataviz skill if any of these change.

const LIGHT = {
  blue: '#0066ff',
  gold: '#c9a227',
  teal: '#00897a',
  red: '#e5484d',
  surface: '#fcfcfb',
  ink: '#0a0a0a',
  inkSoft: '#6b6b6f',
  grid: '#e2e2e5',
};

const DARK = {
  blue: '#3d7fe0',
  gold: '#a8820f',
  teal: '#1fa391',
  red: '#ec3f6b',
  surface: '#1c1c1e',
  ink: '#f2f2f3',
  inkSoft: '#a3a3a8',
  grid: '#2e2e31',
};

// Sequential ramp (magnitude, single hue, light -> dark) for the one-series
// revenue-over-time chart. Lightness-monotonic by construction; CVD
// separation doesn't apply to a sequential ramp (dataviz skill scope note).
const SEQUENTIAL_BLUE_LIGHT = ['#cfe3ff', '#8fb8ff', '#4d94ff', '#0066ff', '#003d99'];
const SEQUENTIAL_BLUE_DARK = ['#1a2b4d', '#2d4f8f', '#3d7fe0', '#6ba3ff', '#a8c8ff'];

function prefersDark() {
  if (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark') return true;
  if (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light') return false;
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
}

export function getChartTheme() {
  const dark = prefersDark();
  const c = dark ? DARK : LIGHT;
  return {
    dark,
    categorical: [c.blue, c.gold, c.teal],
    statusColor: { Draft: c.inkSoft, Issued: c.blue, 'Partially Paid': c.gold, Paid: c.teal, Overdue: c.red, Cancelled: c.red },
    sequentialBlue: dark ? SEQUENTIAL_BLUE_DARK : SEQUENTIAL_BLUE_LIGHT,
    surface: c.surface,
    ink: c.ink,
    inkSoft: c.inkSoft,
    grid: c.grid,
  };
}
