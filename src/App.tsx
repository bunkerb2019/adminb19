import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// eslint-disable-next-line react-refresh/only-export-components
export const queryClient = new QueryClient()

const App = () => {
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "light" : "dark",
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {/* настройка и просмотр query если требуется  */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */} 
    <ThemeProvider theme={theme} defaultMode="dark">
      <CssBaseline />
      <Router>
        <div style={{ display: "flex", height: "100vh" }}>
          <Sidebar />
          <div style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
            <Navbar toggleTheme={() => setDarkMode(!darkMode)} darkMode={darkMode} />
            <main style={{ flexGrow: 1, padding: "20px" }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;