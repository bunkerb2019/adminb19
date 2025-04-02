import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Switch, 
  Button,
  Box,
  Avatar
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useAuth } from "../providers/AuthProvider";
import { logout } from "../firebase/auth";

const Navbar = ({ toggleTheme, darkMode }: { toggleTheme: () => void; darkMode: boolean }) => {
  const { user } = useAuth();

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton 
            edge="start" 
            color="inherit" 
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="h1">
            Панель управления
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Switch 
            checked={darkMode} 
            onChange={toggleTheme} 
            color="default"
          />
          
          {user && (
            <>
              {user.photoURL && (
                <Avatar 
                  src={user.photoURL} 
                  sx={{ width: 36, height: 36 }}
                />
              )}
              
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<ExitToAppIcon />}
                onClick={logout}
                sx={{
                  textTransform: 'none',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.7)'
                  }
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