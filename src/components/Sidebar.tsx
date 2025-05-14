// components/Sidebar.tsx
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
  useMediaQuery,
} from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

const menuItems = [
  { text: "Главная", icon: <HomeOutlinedIcon />, path: "/", color: "#4CAF50" },
  {
    text: "Товары",
    icon: <DashboardOutlinedIcon />,
    path: "/dashboard",
    color: "#FFC107",
  },
  {
    text: "Настройки",
    icon: <SettingsOutlinedIcon />,
    path: "/settings",
    color: "#2196F3",
  },
];

const Sidebar = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) onClose();
  };

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: isMobile ? "60vw" : open ? 100 : 72,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isMobile ? "60vw" : open ? 200 : 72,
          boxSizing: "border-box",
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(0, 0, 0, 0)"
              : "rgba(255, 255, 255, 0)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderRight: "none",
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          position: "fixed",
          top: isMobile ? 0 : "64px",
          height: isMobile ? "100vh" : "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Box sx={{ pt: isMobile ? 8 : 4, px: open || isMobile ? 2 : 1, textAlign: "center" }}>
        <Avatar
          src={user?.photoURL || ""}
          sx={{
            width: open || isMobile ? 64 : 40,
            height: open || isMobile ? 64 : 40,
            margin: "0 auto",
            transition: theme.transitions.create(["width", "height"]),
          }}
        />
        {(open || isMobile) && (
          <>
            <Typography
              variant="subtitle1"
              sx={{
                mt: 1,
                fontWeight: 600,
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

      <Divider sx={{ my: 2, mx: open ? 2 : 1, borderColor: "rgba(255,255,255,0.1)" }} />

      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        <List>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItemButton
                key={item.text}
                onClick={() => handleNavigate(item.path)}
                sx={{
                  mx: 1,
                  mb: 1,
                  borderRadius: "20px",
                  position: "relative",
                  color: isActive
                    ? theme.palette.common.white
                    : theme.palette.text.primary,
                  backgroundColor: isActive ? `${item.color}CC` : "transparent",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: `${item.color}CC`,
                    transform: "translateX(2px)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open || isMobile ? 2 : "auto",
                    justifyContent: "center",
                    color: "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {(open || isMobile) && (
                  <ListItemText
                    primary={item.text}
                    sx={{
                      opacity: 1,
                      fontWeight: isActive ? 600 : 400,
                    }}
                  />
                )}
              </ListItemButton>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;