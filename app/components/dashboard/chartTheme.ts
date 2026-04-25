// Shared Recharts tooltip styling — fixes dark-on-dark text bug.
export const TOOLTIP_STYLE = {
  contentStyle: {
    background: "rgba(9, 9, 11, 0.95)",
    border: "1px solid #3f3f46",
    borderRadius: 8,
    color: "#fafafa",
    fontSize: 12,
    padding: "8px 12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
  } as React.CSSProperties,
  labelStyle: { color: "#a1a1aa", marginBottom: 4 } as React.CSSProperties,
  itemStyle: { color: "#fafafa" } as React.CSSProperties,
  cursor: { fill: "rgba(255,255,255,0.04)" } as { fill: string },
};
