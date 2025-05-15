
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Avatar,
  Button,
  useMediaQuery,
  useTheme,
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
  sidebarOpen,
}: {
  toggleTheme: () => void;
  darkMode: boolean;
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}) => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleSidebarToggle = () => {
    toggleSidebar();
  };

  return (
    <AppBar
  position="fixed"
  elevation={0}
  sx={{
    backgroundColor: darkMode ? "rgba(255, 255, 255, 0)" : "rgba(25, 25, 25, 0)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    color: darkMode ? "#000" : "#fff",
    zIndex: (theme) => theme.zIndex.drawer + 1,
  }}
>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {isMobile && ( // Показываем иконку меню только на мобильных
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleSidebarToggle}
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            onClick={toggleTheme}
            sx={{
              width: 50,
              height: 28,
              borderRadius: "50px",
              backgroundColor: darkMode ? "#e0e0e0" : "#444",
              // boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)",
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
                <Avatar 
                  src={user.photoURL} 
                  sx={{ 
                    width: 36, 
                    height: 36,
                    display: { xs: 'none', sm: 'flex' } // Скрываем аватар на очень маленьких экранах
                  }} 
                />
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
                  color: darkMode ? "#000" : "#fff",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: darkMode ? "#000" : "#fff",
                    color: darkMode ? "#fff" : "#000",
                    borderColor: darkMode ? "#000" : "#fff",
                  },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' } // Адаптивный размер текста
                }}
              >
                Выйти
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;