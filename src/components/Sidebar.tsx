import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  Typography,
  Divider,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

const menuItems = [
  { text: "Главная", icon: <HomeIcon />, path: "/" },
  { text: "Товары", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "Настройки", icon: <SettingsIcon />, path: "/settings" },
];

const Sidebar = ({ open }: { open: boolean }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? 240 : 70,
        flexShrink: 0,
        transition: "width 0.3s ease",
        "& .MuiDrawer-paper": {
          width: open ? 240 : 70,
          boxSizing: "border-box",
          overflowX: "hidden",
          transition: "width 0.3s ease",
        },
      }}
    >
      {/* Аватар и инфо можно скрывать */}
      {open && (
        <Box
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Avatar
            src={user?.photoURL || ""}
            sx={{ width: 80, height: 80, mb: 2 }}
          />
          <Typography variant="h6">{user?.displayName}</Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
      )}
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItemButton key={item.text} onClick={() => navigate(item.path)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            {open && <ListItemText primary={item.text} />}
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
