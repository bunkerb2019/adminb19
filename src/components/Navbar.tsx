import { IconButton, Box, Avatar, Tooltip, useMediaQuery } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useLocation } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { logout } from "../firebase/auth";
import InstagramBlack from "../assets/logosfooter/InstagramBlack.svg";
import TelegramBlack from "../assets/logosfooter/telegramBlack.svg";
import logoWhite from "../assets/logo.png";
import { isActivePath, menuItems } from "./Sidebar";

const softBtn = { bgcolor: "background.paper", width: 38, height: 38 };

const Navbar = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const isMobile = useMediaQuery("(max-width:899.95px)");
  const title = menuItems.find((i) => isActivePath(i.path, pathname))?.title ?? "";

  if (isMobile) {
    return (
      <Box
        component="header"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          pt: "calc(12px + env(safe-area-inset-top))",
          pb: 1.5,
          color: "#fff",
        }}
      >
        <Box component="img" src={logoWhite} alt="Bunker B19" sx={{ width: 28, height: 28 }} />
        <Box sx={{ fontWeight: 600, fontSize: 18, flexGrow: 1 }}>{title}</Box>
        <IconButton
          onClick={logout}
          aria-label="Выйти"
          sx={{ color: "#fff", bgcolor: "rgba(255,255,255,0.1)", width: 38, height: 38 }}
        >
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 3.5,
        py: 2,
      }}
    >
      <Box sx={{ fontWeight: 600, fontSize: 22, letterSpacing: -0.4, flexGrow: 1 }}>
        {title}
      </Box>
      <Tooltip title="Telegram">
        <IconButton sx={softBtn} href="https://t.me/max_kich" target="_blank" rel="noopener noreferrer">
          <img src={TelegramBlack} alt="Telegram" width={18} height={18} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Instagram">
        <IconButton
          sx={softBtn}
          href="https://www.instagram.com/max_gutsu/?hl=ru"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={InstagramBlack} alt="Instagram" width={18} height={18} />
        </IconButton>
      </Tooltip>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 1.5 }}>
        <Avatar src={user?.photoURL || ""} sx={{ width: 34, height: 34 }} />
        <Box sx={{ fontWeight: 600, fontSize: 14, maxWidth: 160 }} title={user?.email || ""}>
          {user?.displayName?.split(" ")[0] || "Админ"}
        </Box>
      </Box>
    </Box>
  );
};

export default Navbar;
