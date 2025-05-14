import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Navbar from "./components/Navbar";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "../src/contexts/LanguageContext";
import { AuthProvider, useAuth } from "./providers/AuthProvider";
import Sidebar from "./components/Sidebar";
import WelcomeScreen from "./components/WelcomeScreen";
import { AppViewsProvider } from "./contexts/AppViewsContext.tsx";

// eslint-disable-next-line react-refresh/only-export-components
export const queryClient = new QueryClient();

function AppContent() {
  const { isAdmin, isLoading } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const customTheme = createTheme({
    palette: {
      mode: darkMode ? "light" : "dark",
    },
    typography: {
      fontFamily: "Poppins, sans-serif",
    },
  });

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        {/* Ваш компонент загрузки */}
      </Box>
    );
  }

  if (!isAdmin) {
    return <WelcomeScreen />;
  }

  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      <Box sx={{ display: "flex", height: "100vh" }}>
        <Navbar
          toggleTheme={() => setDarkMode(!darkMode)}
          darkMode={darkMode}
          toggleSidebar={toggleSidebar}
        />

        {/* Sidebar - всегда виден на desktop, скрыт на mobile */}
        <Sidebar open={!isMobile || sidebarOpen} onClose={toggleSidebar} />

        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            width: isMobile
              ? "100%"
              : `calc(100% - ${sidebarOpen ? 220 : 80}px)`,
            transition: "width 0.3s ease",
          }}
        >
          <Navbar
            toggleTheme={() => setDarkMode(!darkMode)}
            darkMode={darkMode}
            toggleSidebar={toggleSidebar}
          />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              pt: "64px", // Отступ под navbar
              transition: (theme) =>
                theme.transitions.create("margin", {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.leavingScreen,
                }),
              marginLeft: isMobile ? 0 : sidebarOpen ? "220px" : "80px",
            }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Box>
        </Box>
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
