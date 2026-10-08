import { Box, IconButton, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowBack as ArrowBackIcon,
  ViewQuiltOutlined as PagesIcon,
  CategoryOutlined as CategoryIcon,
  CasinoOutlined as CasinoIcon,
  ContactPhoneOutlined as ContactPhoneIcon,
  ArrowForward as ArrowIcon,
} from "@mui/icons-material";
import { useRandomSettings } from "../hooks/useRandomSettings";
import useCategories from "../modules/categories/useCategories";
import NavigationPopup from "../components/NavigationPopup";
import CategoryPopup from "../components/CategoriesPopup";
import RandomPopup from "../components/RandomPopup";
import ContactSettingsPopup from "../components/ContactSettingsPopup";

const Manage = () => {
  const { section } = useParams();
  const navigate = useNavigate();
  const { data: randomSettings } = useRandomSettings();
  const { data: categories } = useCategories();
  const back = () => navigate("/manage");

  const randomCount = randomSettings?.randomizers?.length ?? 0;

  const cards = [
    {
      key: "pages",
      title: "Страницы",
      text: "Порядок и названия разделов меню на сайте",
      badge: null,
      icon: <PagesIcon />,
    },
    {
      key: "categories",
      title: "Категории",
      text: "Названия, иконки и порядок категорий товаров",
      badge: categories?.length ? `${categories.length} шт.` : null,
      icon: <CategoryIcon />,
    },
    {
      key: "random",
      title: "Рандом",
      text: "Разделы «Случайное» и какие категории в них участвуют",
      badge: randomCount ? `${randomCount} шт.` : "Не настроен",
      icon: <CasinoIcon />,
    },
    {
      key: "contacts",
      title: "Контакты",
      text: "Телефон, адрес, соцсети и кнопки на странице контактов",
      badge: null,
      icon: <ContactPhoneIcon />,
    },
  ];

  const current = cards.find((c) => c.key === section);
  if (current) {
    return (
      <Box sx={{ maxWidth: 960 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
          <IconButton onClick={back} aria-label="Назад" sx={{ bgcolor: "background.paper" }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={700} fontSize={20} lineHeight={1.2}>
              {current.title}
            </Typography>
            <Typography color="text.secondary" fontSize={13}>
              {current.text}
            </Typography>
          </Box>
        </Box>
        {section === "pages" && <NavigationPopup onSaved={back} />}
        {section === "categories" && <CategoryPopup />}
        {section === "random" && <RandomPopup onSaved={back} />}
        {section === "contacts" && <ContactSettingsPopup />}
      </Box>
    );
  }

  return (
    <Box>
      <Typography color="text.secondary" fontSize={14} sx={{ mb: 2 }}>
        Что видят гости на сайте меню
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: { xs: 1.25, sm: 2 },
        }}
      >
        {cards.map((c) => (
          <Box
            key={c.key}
            component="button"
            onClick={() => navigate(`/manage/${c.key}`)}
            sx={{
              all: "unset",
              cursor: "pointer",
              boxSizing: "border-box",
              bgcolor: "background.paper",
              borderRadius: "24px",
              p: { xs: 2, sm: 2.5 },
              display: "flex",
              flexDirection: { xs: "row", sm: "column" },
              alignItems: { xs: "center", sm: "stretch" },
              gap: { xs: 1.75, sm: 3 },
              minHeight: { sm: 190 },
              transition: "transform .15s, box-shadow .15s",
              "&:hover": { boxShadow: "0 10px 30px rgba(0,0,0,0.08)" },
              "&:hover .manage-arrow": { bgcolor: "#111", color: "#fff" },
              "&:active": { transform: "scale(0.98)" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box
                sx={{
                  width: { xs: 48, sm: 52 },
                  height: { xs: 48, sm: 52 },
                  borderRadius: "50%",
                  bgcolor: "#111",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {c.icon}
              </Box>
              {c.badge && (
                <Box
                  sx={{
                    display: { xs: "none", sm: "block" },
                    px: 1.25,
                    py: 0.5,
                    borderRadius: 999,
                    bgcolor: "#fff",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {c.badge}
                </Box>
              )}
            </Box>
            <Box sx={{ flexGrow: 1, minWidth: 0, display: "flex", alignItems: "flex-end", gap: 1.5 }}>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography fontWeight={700} fontSize={{ xs: 16, sm: 20 }} lineHeight={1.2}>
                  {c.title}
                  {c.badge && (
                    <Box
                      component="span"
                      sx={{ display: { sm: "none" }, ml: 1, fontSize: 12, fontWeight: 600, color: "text.secondary" }}
                    >
                      {c.badge}
                    </Box>
                  )}
                </Typography>
                <Typography color="text.secondary" fontSize={13} lineHeight={1.35} sx={{ mt: 0.5 }}>
                  {c.text}
                </Typography>
              </Box>
              <Box
                className="manage-arrow"
                sx={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  borderRadius: "50%",
                  bgcolor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all .15s",
                }}
              >
                <ArrowIcon fontSize="small" />
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Manage;
