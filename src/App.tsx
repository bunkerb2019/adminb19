import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme, Box } from "@mui/material";
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
  const [darkMode, setDarkMode] = useState(true); // Устанавливаем начальную тему на темную

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? "light" : "dark", // Используем темную по умолчанию
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          backgroundColor: darkMode ? "#F9FAFB" : "#000", // <-- Здесь меняется фон
          transition: "background-color 0.3s ease",
        }}
      >
        <Sidebar open={sidebarOpen} />
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
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
              backgroundColor: darkMode ? "#F9FAFB" : "#000", // <-- фон основного контента
              color: darkMode ? "#000" : "#fff", // чтобы текст был читаем
              transition: "background-color 0.3s ease, color 0.3s ease",
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
