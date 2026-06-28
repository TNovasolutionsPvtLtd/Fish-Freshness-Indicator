// Design tokens used across all screens, themed around the fish market /
// ocean subject of the app rather than generic defaults.
export const colors = {
  background: "#F7F5EF", // warm off-white, like paper at a market stall
  surface: "#FFFFFF",
  deep: "#0B3D45", // deep teal - primary brand colour, evokes ocean depth
  deepLight: "#15565F",
  accent: "#FF6B4A", // coral - secondary accent
  textPrimary: "#16242A",
  textSecondary: "#5C6F73",
  border: "#E1DDD2",
  fresh: "#2E8B57", // sea green
  medium: "#E8A33D", // amber
  spoiled: "#C0392B", // red
  white: "#FFFFFF",
};

export const spacing = (n) => n * 8;

export const radii = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
};

export const typography = {
  display: { fontSize: 28, fontWeight: "700", color: colors.deep },
  title: { fontSize: 20, fontWeight: "700", color: colors.textPrimary },
  body: { fontSize: 15, fontWeight: "400", color: colors.textPrimary },
  caption: { fontSize: 12, fontWeight: "500", color: colors.textSecondary, letterSpacing: 0.4 },
};

export function freshnessColor(result) {
  if (result === "FRESH") return colors.fresh;
  if (result === "MEDIUM") return colors.medium;
  if (result === "SPOILED") return colors.spoiled;
  return colors.textSecondary;
}
