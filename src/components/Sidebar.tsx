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
  useTheme,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

const menuItems = [
  { text: "Главная", icon: <HomeIcon />, path: "/" },
  { text: "Товары", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "Настройки", icon: <SettingsIcon />, path: "/settings" },
];

const Sidebar = ({ open }: { open: boolean }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? 240 : 80,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: open ? 240 : 80,
          boxSizing: "border-box",
          backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f4f4f4",
          borderRight: "none",
          transition: "width 0.3s ease",
          overflowX: "hidden",
        },
      }}
    >
      <Box
        sx={{
          p: open ? 3 : 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          transition: "all 0.3s ease",
        }}
      >
        <Avatar
          src={user?.photoURL || ""}
          sx={{
            width: open ? 70 : 40,
            height: open ? 70 : 40,
            transition: "all 0.3s ease",
            boxShadow: theme.palette.mode === "dark" ? "0 0 10px #000" : "0 0 10px rgba(0,0,0,0.1)",
          }}
        />
        {open && (
          <>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, textAlign: "center" }}
            >
              {user?.displayName}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textAlign: "center", wordBreak: "break-word" }}
            >
              {user?.email}
            </Typography>
          </>
        )}
      </Box>

      <Divider sx={{ mx: 2, borderColor: theme.palette.divider }} />

      <List sx={{ mt: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <ListItemButton
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                margin: "8px",
                borderRadius: "12px",
                paddingY: "10px",
                backgroundColor: isActive
                  ? theme.palette.mode === "dark"
                    ? "#333"
                    : "#e0e0e0"
                  : "transparent",
                color: isActive
                  ? theme.palette.primary.main
                  : theme.palette.text.primary,
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark" ? "#2a2a2a" : "#eaeaea",
                  transform: "scale(1.03)",
                  boxShadow:
                    theme.palette.mode === "dark"
                      ? "0 4px 8px rgba(0,0,0,0.4)"
                      : "0 4px 8px rgba(0,0,0,0.08)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : "auto",
                  justifyContent: "center",
                  color: "inherit",
                }}
              >
                {item.icon}
              </ListItemIcon>
              {open && <ListItemText primary={item.text} />}
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
};

export default Sidebar;