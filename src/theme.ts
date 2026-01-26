import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#4f46e5", // Indigo-600 to match Tailwind
      light: "#818cf8",
      dark: "#3730a3",
    },
    secondary: {
      main: "#10b981", // Emerald-500
      light: "#34d399",
      dark: "#059669",
    },
    background: {
      default: "#f8fafc", // Slate-50
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a", // Slate-900
      secondary: "#64748b", // Slate-500
    },
  },
  typography: {
    fontFamily: '"Cairo", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 900 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    shape: {
      borderRadius: 16,
    },
    allVariants: {
      fontFamily:
        '"Cairo", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 700,
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 20,
        },
        elevation1: {
          boxShadow:
            "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        },
      },
    },
  },
});

export default theme;
