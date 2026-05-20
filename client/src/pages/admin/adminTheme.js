const palette = {
  background: "#f6f1ea",
  surface: "rgba(255, 255, 255, 0.95)",
  surfaceMuted: "#fdf7f0",
  contrast: "#1b1814",
  textMuted: "#756a5f",
  border: "rgba(27, 24, 20, 0.12)",
  accent: "#ff6b35",
  accentDark: "#d45420",
  accentSoft: "#f2c1a7",
  accentSecondary: "#5ea34d",
  warning: "#c47a2c",
  danger: "#c7523f",
  highlight: "#fff5ec",
};

const fonts = {
  display: "'Playfair Display', 'Dream Avenue', serif",
  accent: "'Dream Avenue', 'Playfair Display', serif",
  body: "'Lato', 'Source Sans 3', 'Inter', sans-serif",
};

const radii = {
  xl: "32px",
  lg: "22px",
  md: "14px",
  pill: "999px",
};

const shadow = {
  card: "0 32px 60px rgba(12, 8, 4, 0.09)",
  soft: "0 10px 30px rgba(12, 8, 4, 0.06)",
};

const gradients = {
  accent: "linear-gradient(135deg, #ff8c5a, #ff6b35)",
  emerald: "linear-gradient(135deg, #82d48f, #5ea34d)",
  ink: "linear-gradient(135deg, #272522, #14110e)",
};

const hexToRgba = (hex, alpha = 1) => {
  let sanitized = hex.replace("#", "");
  if (sanitized.length === 3) {
    sanitized = sanitized
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const r = parseInt(sanitized.slice(0, 2), 16);
  const g = parseInt(sanitized.slice(2, 4), 16);
  const b = parseInt(sanitized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const adminTheme = {
  palette,
  fonts,
  radii,
  shadow,
  gradients,
};

export const createCardStyle = (overrides = {}) => ({
  background: palette.surface,
  borderRadius: radii.xl,
  border: `1px solid ${palette.border}`,
  padding: "30px",
  boxShadow: shadow.card,
  backdropFilter: "blur(10px)",
  ...overrides,
});

export const createSurfaceStyle = (overrides = {}) => ({
  background: palette.surfaceMuted,
  borderRadius: radii.lg,
  border: `1px solid rgba(255, 255, 255, 0.35)`,
  ...overrides,
});

export const fieldLabelStyle = {
  fontFamily: fonts.body,
  fontSize: "0.9rem",
  fontWeight: 600,
  color: palette.contrast,
  letterSpacing: "0.02em",
  marginBottom: "6px",
  display: "block",
};

export const textInputStyle = {
  width: "100%",
  padding: "14px 18px",
  borderRadius: radii.md,
  border: `1px solid ${palette.border}`,
  background: "#fff",
  fontFamily: fonts.body,
  fontSize: "0.95rem",
  color: palette.contrast,
  outline: "none",
  transition: "border-color 0.3s ease",
};

export const textareaStyle = {
  ...textInputStyle,
  minHeight: "120px",
  resize: "vertical",
  lineHeight: 1.5,
};

export const helperTextStyle = {
  fontFamily: fonts.body,
  fontSize: "0.82rem",
  color: palette.textMuted,
  marginTop: "6px",
};

export const createChipStyle = (variant = "neutral", overrides = {}) => {
  const map = {
    neutral: {
      background: palette.highlight,
      color: palette.textMuted,
      border: `1px solid ${hexToRgba(palette.contrast, 0.08)}`,
    },
    accent: {
      background: hexToRgba(palette.accent, 0.12),
      color: palette.accent,
      border: `1px solid ${hexToRgba(palette.accent, 0.2)}`,
    },
    success: {
      background: hexToRgba(palette.accentSecondary, 0.18),
      color: palette.accentSecondary,
      border: `1px solid ${hexToRgba(palette.accentSecondary, 0.2)}`,
    },
    danger: {
      background: hexToRgba(palette.danger, 0.12),
      color: palette.danger,
      border: `1px solid ${hexToRgba(palette.danger, 0.18)}`,
    },
  };

  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    borderRadius: radii.pill,
    fontSize: "0.85rem",
    fontFamily: fonts.body,
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    ...map[variant],
    ...overrides,
  };
};

export const buttonStyle = (variant = "primary", overrides = {}) => {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    borderRadius: radii.pill,
    fontFamily: fonts.body,
    fontWeight: 600,
    fontSize: "0.95rem",
    padding: "12px 22px",
    border: "none",
    cursor: "pointer",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  };

  const variants = {
    primary: {
      background: gradients.accent,
      color: "#fff",
      boxShadow: "0 12px 30px rgba(255, 107, 53, 0.25)",
    },
    secondary: {
      background: palette.contrast,
      color: "#fff",
      boxShadow: "0 12px 30px rgba(27, 24, 20, 0.25)",
    },
    ghost: {
      background: "transparent",
      color: palette.contrast,
      border: `1px solid ${palette.border}`,
    },
  };

  return {
    ...base,
    ...(variants[variant] || variants.primary),
    ...overrides,
  };
};

export const iconBadgeStyle = (variant = "accent") => {
  const palettes = {
    accent: { color: palette.accent, background: hexToRgba(palette.accent, 0.14) },
    emerald: { color: palette.accentSecondary, background: hexToRgba(palette.accentSecondary, 0.14) },
    ink: { color: palette.contrast, background: hexToRgba(palette.contrast, 0.12) },
  };

  const selected = palettes[variant] || palettes.accent;

  return {
    width: "48px",
    height: "48px",
    borderRadius: radii.lg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "1rem",
    ...selected,
  };
};

export const sectionHeadingStyle = {
  fontFamily: fonts.display,
  fontSize: "2.1rem",
  fontWeight: 500,
  letterSpacing: "0.04em",
  color: palette.contrast,
  margin: "0 0 10px 0",
};

export const underlineStyle = {
  width: "72px",
  height: "3px",
  background: palette.accent,
  borderRadius: radii.pill,
  marginBottom: "16px",
};

export const mutedParagraphStyle = {
  fontFamily: fonts.body,
  fontSize: "0.95rem",
  color: palette.textMuted,
  lineHeight: 1.6,
  margin: 0,
};

export const hexToRgbaHelper = hexToRgba;
