import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Grow,
  Avatar,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { useRandomSettings } from "../hooks/useRandomSettings";
import NavigationPopup from "../components/NavigationPopup";
import CategoryPopup from "../components/CategoriesPopup";
import RandomPopup from "../components/RandomPopup";
import Orders from "../components/Orders";
import {
  Menu as MenuIcon,
  Category as CategoryIcon,
  Casino as CasinoIcon,
} from "@mui/icons-material";
import { useMediaQuery } from "@mui/material";

const Dashboard = () => {
  const theme = useTheme();
  const [navPopupOpen, setNavPopupOpen] = useState(false);
  const [categoryPopupOpen, setCategoryPopupOpen] = useState(false);
  const [randomPopupOpen, setRandomPopupOpen] = useState(false);
  const { data: randomSettings } = useRandomSettings();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDarkMode = theme.palette.mode === "dark";

  const cards = [
    {
      title: "Основные страницы",
      onClick: () => setNavPopupOpen(true),
      color: "#1976d2",
      icon: <MenuIcon />,
    },
    {
      title: "Категории товаров",
      onClick: () => setCategoryPopupOpen(true),
      color: "#388e3c",
      icon: <CategoryIcon />,
    },
    {
      title: "Настройки рандома",
      onClick: () => setRandomPopupOpen(true),
      color: "#8e24aa",
      icon: <CasinoIcon />,
      buttonText: randomSettings?.randomizers?.length
        ? "Редактировать"
        : "Настроить",
    },
  ];

  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: isMobile ? 1 : 3,
        px: isMobile ? 0.5 : 3, // Уменьшаем padding на мобильных
        pb: 2,
        width: "100%", // Явное указание ширины
        overflowX: "hidden", // Запрещаем горизонтальный скролл
      }}
    >
      <Typography
        variant={isMobile ? "h6" : "h5"}
        fontWeight={700}
        gutterBottom
      >
        Панель управления
      </Typography>

      <Grid
        container
        spacing={isMobile ? 1 : 2}
        sx={{
          mt: 1,
          width: "100%",
          marginLeft: "0 !important", // Убираем отрицательные отступы
          "& .MuiGrid-item": {
          },
        }}
      >
        {cards.map((item, index) => (
          <Grow in timeout={400 + index * 200} key={item.title}>
            <Grid item xs={12} sm={6} md={4}>
              <Box
                onClick={item.onClick}
                sx={{
                  cursor: "pointer",
                  bgcolor: isDarkMode ? theme.palette.grey[800] : "#fff",
                  borderRadius: 2,
                  p: isMobile ? 1 : 2,
                  textAlign: "center",
                  boxShadow: isDarkMode
                    ? "0 2px 6px rgba(0,0,0,0.1)"
                    : "0 2px 6px rgba(0,0,0,0.05)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: isMobile ? "none" : "translateY(-2px)",
                    boxShadow: `0 4px 12px ${item.color}${
                      isDarkMode ? "33" : "22"
                    }`,
                  },
                  border: isDarkMode
                    ? `1px solid ${theme.palette.grey[700]}`
                    : "none",
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: item.color,
                    width: isMobile ? 36 : 48,
                    height: isMobile ? 36 : 48,
                    mx: "auto",
                    mb: 1,
                  }}
                >
                  {item.icon}
                </Avatar>
                <Typography
                  variant={isMobile ? "body2" : "subtitle1"}
                  fontWeight={600}
                  color={isDarkMode ? theme.palette.text.primary : "inherit"}
                >
                  {item.title}
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  sx={{
                    mt: 0.5,
                    color: item.color,
                    fontWeight: 500,
                    fontSize: isMobile ? "0.75rem" : "0.875rem",
                    textTransform: "none",
                    "&:hover": {
                      textDecoration: "underline",
                      background: "transparent",
                    },
                  }}
                >
                  {item.buttonText || "Редактировать"}
                </Button>
              </Box>
            </Grid>
          </Grow>
        ))}
      </Grid>

      <Box mt={isMobile ? 2 : 4}>
        <Orders />
      </Box>

      <NavigationPopup
        open={navPopupOpen}
        onClose={() => setNavPopupOpen(false)}
      />
      <CategoryPopup
        open={categoryPopupOpen}
        onClose={() => setCategoryPopupOpen(false)}
      />
      <RandomPopup
        open={randomPopupOpen}
        onClose={() => setRandomPopupOpen(false)}
      />
    </Container>
  );
};

export default Dashboard;
