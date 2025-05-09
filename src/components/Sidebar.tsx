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
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

const menuItems = [
  { text: "Главная", icon: <HomeOutlinedIcon />, path: "/", color: "#4CAF50" },
  { text: "Товары", icon: <DashboardOutlinedIcon />, path: "/dashboard", color: "#FFC107" },
  { text: "Настройки", icon: <SettingsOutlinedIcon />, path: "/settings", color: "#2196F3" },
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
        width: open ? 220 : 80,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: open ? 220 : 80,
          boxSizing: "border-box",
          backgroundColor:
            theme.palette.mode === "dark" ? "#0F1115" : "#F9FAFB",
          borderRight: "none",
          transition: "width 0.3s ease",
          overflowX: "hidden",
        },
      }}
    >
      <Box
        sx={{
          py: 3,
          px: open ? 2 : 1,
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
            width: open ? 64 : 40,
            height: open ? 64 : 40,
            transition: "all 0.3s ease",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
          }}
        />
        {open && (
          <>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                textAlign: "center",
                mt: 1,
                maxWidth: 160,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.displayName || "Пользователь"}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                textAlign: "center",
                maxWidth: 160,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
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
                position: "relative",
                margin: "8px 12px",
                borderRadius: "20px",
                color: isActive ? theme.palette.common.white : theme.palette.text.primary,
                overflow: "hidden",
                transition: "all 0.3s ease",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: "100%",
                  height: "100%",
                  background: isActive
                    ? item.color
                    : "transparent",
                  transform: isActive ? "scaleX(1)" : "scaleX(0)",
                  transformOrigin: "top right",
                  transition: "transform 0.3s ease, background-color 0.3s ease",
                  zIndex: -1,
                },
                "&:hover::before": {
                  transform: "scaleX(1)",
                  transformOrigin: "top left",
                  background: item.color,
                },
                "&:hover": {
                  boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)",
                  transform: "translateX(2px)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : "auto",
                  justifyContent: "center",
                  color: "inherit",
                  transition: "all 0.3s ease",
                }}
              >
                {item.icon}
              </ListItemIcon>
              {open && (
                <ListItemText
                  primary={item.text}
                  sx={{
                    fontWeight: isActive ? 600 : 400,
                    transition: "font-weight 0.3s ease",
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
};

export default Sidebar;