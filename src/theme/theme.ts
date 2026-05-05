import { createTheme, alpha } from "@mui/material/styles";

// Brand palette — Material 3 inspired
const PRIMARY = "#1B4FD8"; // Banking blue
const SECONDARY = "#00694A"; // Trust green

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: PRIMARY,
      light: "#5478E4",
      dark: "#0D2D8A",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: SECONDARY,
      light: "#338B6E",
      dark: "#004830",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#B3261E",
      light: "#DC3545",
      dark: "#7F0000",
    },
    warning: {
      main: "#7D5700",
    },
    success: {
      main: "#1A6B3C",
    },
    background: {
      default: "#F3F6FB",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1A1C2A",
      secondary: "#4A4E6B",
    },
    divider: "rgba(26, 28, 42, 0.1)",
  },

  shape: {
    borderRadius: 12,
  },

  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, letterSpacing: "-0.02em" },
    h2: { fontWeight: 700, letterSpacing: "-0.015em" },
    h3: { fontWeight: 600, letterSpacing: "-0.01em" },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          padding: "10px 24px",
          fontWeight: 600,
          lineHeight: 1.5,
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: `0 4px 12px ${alpha(PRIMARY, 0.3)}`,
          },
        },
        outlined: {
          borderWidth: "1.5px",
          "&:hover": {
            borderWidth: "1.5px",
          },
        },
      },
    },

    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1px solid rgba(26, 28, 42, 0.08)",
        },
      },
    },

    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: "none" },
        rounded: { borderRadius: 16 },
      },
    },

    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          color: "#1A1C2A",
          borderBottom: "1px solid rgba(26, 28, 42, 0.08)",
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: "none",
          backgroundColor: "#FFFFFF",
        },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          marginBottom: 2,
          "&.Mui-selected": {
            backgroundColor: alpha(PRIMARY, 0.1),
            color: PRIMARY,
            "&:hover": { backgroundColor: alpha(PRIMARY, 0.15) },
            "& .MuiListItemIcon-root": { color: PRIMARY },
          },
          "&:hover": {
            backgroundColor: alpha(PRIMARY, 0.06),
          },
        },
      },
    },

    MuiListItemIcon: {
      styleOverrides: {
        root: { minWidth: 40, color: "#4A4E6B" },
      },
    },

    MuiTextField: {
      defaultProps: { variant: "outlined" },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 500 },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: { borderColor: "rgba(26, 28, 42, 0.08)" },
      },
    },

    MuiSkeleton: {
      defaultProps: { animation: "wave" },
    },
  },
});
