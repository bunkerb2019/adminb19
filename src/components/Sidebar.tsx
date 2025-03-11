import { Drawer, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  const menuItems = [
    { text: "Главная", icon: <HomeIcon />, path: "/" },
    { text: "Товары", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Настройки", icon: <SettingsIcon />, path: "/settings" },
  ];

  return (
    <Drawer variant="permanent" sx={{ width: 170, flexShrink: 0 }}>
      <List>
        {menuItems.map((item) => (
          <ListItemButton key={item.text} onClick={() => navigate(item.path)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;