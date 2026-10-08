import { Box, IconButton, Tooltip } from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../firebase/auth";
import logoWhite from "../assets/logo.png";

// eslint-disable-next-line react-refresh/only-export-components
export const menuItems = [
  { text: "Главная", title: "Аналитика", icon: <HomeOutlinedIcon />, path: "/" },
  { text: "Товары", title: "Меню и товары", icon: <Inventory2OutlinedIcon />, path: "/dashboard" },
  { text: "Управление", title: "Управление", icon: <TuneOutlinedIcon />, path: "/manage" },
  { text: "Настройки", title: "Настройки", icon: <SettingsOutlinedIcon />, path: "/settings" },
];

// eslint-disable-next-line react-refresh/only-export-components
export const isActivePath = (path: string, pathname: string) =>
  path === "/" ? pathname === "/" : pathname.startsWith(path);

const railBtn = (active: boolean) => ({
  width: 46,
  height: 46,
  color: active ? "#111" : "rgba(255,255,255,0.6)",
  bgcolor: active ? "#fff" : "transparent",
  transition: "all .2s",
  "&:hover": { bgcolor: active ? "#fff" : "rgba(255,255,255,0.1)", color: active ? "#111" : "#fff" },
});

const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <Box
      component="nav"
      sx={{
        width: 80,
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 3,
        gap: 1.5,
      }}
    >
      <Box component="img" src={logoWhite} alt="Bunker B19" sx={{ width: 34, height: 34, mb: 3 }} />
      {menuItems.map((item) => (
        <Tooltip key={item.path} title={item.text} placement="right">
          <IconButton
            aria-label={item.text}
            onClick={() => navigate(item.path)}
            sx={railBtn(isActivePath(item.path, pathname))}
          >
            {item.icon}
          </IconButton>
        </Tooltip>
      ))}
      <Box sx={{ flexGrow: 1 }} />
      <Tooltip title="Выйти" placement="right">
        <IconButton aria-label="Выйти" onClick={logout} sx={railBtn(false)}>
          <LogoutIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export const BottomNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <Box
      component="nav"
      sx={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: "calc(12px + env(safe-area-inset-bottom))",
        zIndex: 1100,
        bgcolor: "#111",
        borderRadius: 999,
        p: 0.75,
        display: "flex",
        justifyContent: "space-between",
        boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
      }}
    >
      {menuItems.map((item) => {
        const active = isActivePath(item.path, pathname);
        return (
          <Box
            key={item.path}
            component="button"
            aria-label={item.text}
            onClick={() => navigate(item.path)}
            sx={{
              all: "unset",
              cursor: "pointer",
              flex: active ? 1.6 : 1,
              height: 48,
              borderRadius: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              fontSize: 14,
              fontWeight: 600,
              color: active ? "#111" : "rgba(255,255,255,0.6)",
              bgcolor: active ? "#fff" : "transparent",
              transition: "all .25s",
            }}
          >
            {item.icon}
            {active && item.text}
          </Box>
        );
      })}
    </Box>
  );
};

export default Sidebar;
