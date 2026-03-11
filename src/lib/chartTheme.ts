// Shared chart theme colors matching the GoalPulse AI brand palette
export const CHART_COLORS = {
  primary: 'hsl(90, 85%, 45%)',       // lime-green
  accent: 'hsl(180, 85%, 45%)',       // cyan
  warning: 'hsl(38, 92%, 50%)',       // amber
  destructive: 'hsl(0, 72%, 51%)',    // red
  muted: 'hsl(160, 8%, 45%)',         // gray
  grid: 'hsl(160, 8%, 14%)',          // subtle grid
  tickText: 'hsl(160, 8%, 55%)',      // axis labels
  tooltipBg: 'hsl(160, 12%, 6%)',     // tooltip background
  tooltipBorder: 'hsl(160, 8%, 14%)', // tooltip border
  midline: 'hsl(160, 8%, 25%)',       // reference lines
};

export const CHART_TOOLTIP_STYLE = {
  background: CHART_COLORS.tooltipBg,
  border: `1px solid ${CHART_COLORS.tooltipBorder}`,
  borderRadius: 8,
  fontSize: 12,
};

export const CHART_TICK = {
  fill: CHART_COLORS.tickText,
  fontSize: 10,
};
