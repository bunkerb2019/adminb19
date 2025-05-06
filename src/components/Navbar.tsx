import { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Avatar,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useAuth } from "../providers/AuthProvider";
import { logout } from "../firebase/auth";

const Navbar = ({
  toggleTheme,
  darkMode,
  toggleSidebar,
}: {
  toggleTheme: () => void;
  darkMode: boolean;
  toggleSidebar: () => void;
}) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Тоггл для открытия/закрытия боковой панели
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
    toggleSidebar(); // Тогглим боковое меню
  };

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: darkMode ?"#F9FAFB" : "#000",
          color: darkMode ? "#000000" : "#ffffff",
          transition: "all 0.3s ease",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleSidebarToggle} // Вызываем функцию для открытия/закрытия меню
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              {sidebarOpen ? <CloseIcon /> : <MenuIcon />}{" "}
              {/* Меняем иконку на крестик при открытом меню */}
            </IconButton>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              onClick={toggleTheme}
              sx={{
                width: 50,
                height: 28,
                borderRadius: "50px",
                backgroundColor: darkMode ? "#e0e0e0" : "#444",
                display: "flex",
                alignItems: "center",
                padding: "3px",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
                position: "relative",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  left: darkMode ? "3px" : "calc(100% - 25px - 3px)",
                  width: 25,
                  height: 25,
                  borderRadius: "50%",
                  backgroundColor: darkMode ? "#444" : "#000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                  color: darkMode ? "#fff" : "#fff",
                }}
              >
                {darkMode ? (
                  <LightModeIcon fontSize="small" />
                ) : (
                  <DarkModeIcon fontSize="small" />
                )}
              </Box>
            </Box>

            {user && (
              <>
                {user.photoURL && (
                  <Avatar src={user.photoURL} sx={{ width: 36, height: 36 }} />
                )}
                <Button
                  variant="outlined"
                  startIcon={<ExitToAppIcon />}
                  onClick={logout}
                  sx={{
                    textTransform: "none",
                    borderRadius: "20px",
                    padding: "6px 16px",
                    borderColor: darkMode ? "#000" : "#fff",
                    color: darkMode ?"#000" : "#fff",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: darkMode ? "#000" : "#fff",
                      color: darkMode ? "#fff" : "#000",
                      borderColor: darkMode ? "#000" : "#fff",
                    },
                  }}
                >
                  Выйти
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Navbar;
