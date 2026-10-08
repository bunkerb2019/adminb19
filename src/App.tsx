import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  Box,
  useMediaQuery,
} from "@mui/material";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Manage from "./pages/Manage";
import SavedCheck from "./components/SavedCheck";
import Navbar from "./components/Navbar";
import { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "../src/contexts/LanguageContext";
import { AuthProvider, useAuth } from "./providers/AuthProvider";
import Sidebar, { BottomNav } from "./components/Sidebar";
import WelcomeScreen from "./components/WelcomeScreen";
import { AppViewsProvider } from "./contexts/AppViewsContext.tsx";

// eslint-disable-next-line react-refresh/only-export-components
export const queryClient = new QueryClient();

const SOFT = "#f3f5fa";

function AppContent() {
  const { isAdmin, isLoading } = useAuth();
  const isMobile = useMediaQuery("(max-width:899.95px)");

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: "light",
          primary: { main: "#111111", contrastText: "#ffffff" },
          secondary: { main: "#6b7280" },
          success: { main: "#111111" },
          background: { default: "#ffffff", paper: SOFT },
          text: { primary: "#111111", secondary: "#8b90a0" },
          divider: "rgba(17,17,17,0.07)",
        },
        shape: { borderRadius: 14 },
        typography: {
          fontFamily: "Poppins, sans-serif",
          fontSize: 13,
          button: { textTransform: "none", fontWeight: 600 },
          h4: { fontWeight: 600, letterSpacing: -0.5 },
          h5: { fontWeight: 600, letterSpacing: -0.3 },
          h6: { fontWeight: 600, fontSize: "1.05rem" },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: { body: { backgroundColor: "#0c0c0c" } },
          },
          MuiPaper: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
              root: { backgroundImage: "none" },
              rounded: { borderRadius: 20 },
              outlined: { borderColor: "transparent" },
            },
          },
          MuiMenu: {
            styleOverrides: {
              paper: { backgroundColor: "#fff", boxShadow: "0 12px 32px rgba(0,0,0,0.12)" },
            },
          },
          MuiCard: { defaultProps: { elevation: 0 } },
          MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: { root: { borderRadius: 999, paddingInline: 18 } },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: 999,
                backgroundColor: "#fff",
                "& fieldset": { borderColor: "rgba(17,17,17,0.08)" },
                "&:hover fieldset": { borderColor: "rgba(17,17,17,0.2)" },
              },
              multiline: { borderRadius: 16 },
            },
          },
          MuiToggleButton: {
            styleOverrides: {
              root: {
                border: "none",
                borderRadius: 999,
                padding: "6px 14px",
                textTransform: "none",
                fontWeight: 600,
                "&.Mui-selected, &.Mui-selected:hover": { backgroundColor: "#111", color: "#fff" },
              },
            },
          },
          MuiToggleButtonGroup: {
            styleOverrides: {
              root: { backgroundColor: SOFT, borderRadius: 999, padding: 3, gap: 2 },
              grouped: { borderRadius: "999px !important" },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: { borderBottom: "none" },
              head: { color: "#8b90a0", fontWeight: 500, fontSize: 12 },
            },
          },
          MuiTableRow: {
            styleOverrides: {
              root: {
                "& td:first-of-type": { borderRadius: "14px 0 0 14px" },
                "& td:last-of-type": { borderRadius: "0 14px 14px 0" },
                "&.MuiTableRow-hover:hover, &.Mui-selected, &.Mui-selected:hover": {
                  backgroundColor: "transparent",
                },
                "&.MuiTableRow-hover:hover td, &.Mui-selected td": {
                  backgroundColor: SOFT,
                },
              },
            },
          },
          MuiTab: { styleOverrides: { root: { fontWeight: 600, textTransform: "none" } } },
          MuiTabs: { styleOverrides: { indicator: { backgroundColor: "#111", height: 3, borderRadius: 3 } } },
          MuiDialog: {
            defaultProps: { fullScreen: isMobile },
            styleOverrides: { paper: { borderRadius: isMobile ? 0 : 28, backgroundColor: "#fff" } },
          },
        },
      }),
    [isMobile]
  );

  if (isLoading) {
    return null;
  }

  if (!isAdmin) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <WelcomeScreen />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100dvh" }}>
        {!isMobile && <Sidebar />}
        <Box sx={{ flexGrow: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          {isMobile && <Navbar />}
          <Box
            sx={{
              flexGrow: 1,
              bgcolor: "background.default",
              borderRadius: { xs: "28px 28px 0 0", md: "28px" },
              m: { md: 1.5 },
              ml: { md: 0 },
              height: { md: "calc(100dvh - 24px)" },
              overflowY: { md: "auto" },
            }}
          >
            {!isMobile && <Navbar />}
            <Box
              component="main"
              sx={{
                px: { xs: 2, md: 3.5 },
                pt: { xs: 2.5, md: 1 },
                pb: { xs: "calc(96px + env(safe-area-inset-bottom))", md: 3.5 },
              }}
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/manage/:section?" element={<Manage />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Box>
          </Box>
        </Box>
        {isMobile && <BottomNav />}
        <SavedCheck />
      </Box>
    </ThemeProvider>
  );
}

const App = () => {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppViewsProvider>
            <LanguageProvider>
              <AppContent />
              {/* <ReactQueryDevtools initialIsOpen={false} /> */}
            </LanguageProvider>
          </AppViewsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
};

export default App;
