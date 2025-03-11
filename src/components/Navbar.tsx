import { AppBar, Toolbar, IconButton, Typography, Switch } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const Navbar = ({ toggleTheme, darkMode }: { toggleTheme: () => void; darkMode: boolean }) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu">
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Панель управления
        </Typography>
        <Switch checked={darkMode} onChange={toggleTheme} />
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;