import { useState } from "react";
import { Container, Typography, Grid, Button } from "@mui/material";
import DashboardCard from "../components/DashboardCard";
import NavigationPopup from "../components/NavigationPopup";
import CategoryPopup from "../components/CategoriesPopup";
import Orders from "../components/Orders";

const Dashboard = () => {
  const [navPopupOpen, setNavPopupOpen] = useState(false);
  const [categoryPopupOpen, setCategoryPopupOpen] = useState(false);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Админ-панель
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <DashboardCard title="Основная навигация">
            <Button variant="contained" color="primary" onClick={() => setNavPopupOpen(true)}>
              Редактировать
            </Button>
          </DashboardCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <DashboardCard title="Категории навигации">
            <Button variant="contained" color="primary" onClick={() => setCategoryPopupOpen(true)}>
              Редактировать
            </Button>
          </DashboardCard>
        </Grid>
      </Grid>

      {/* Блок с заказами */}
      <Orders />

      {/* Попапы */}
      <NavigationPopup open={navPopupOpen} onClose={() => setNavPopupOpen(false)} />
      <CategoryPopup open={categoryPopupOpen} onClose={() => setCategoryPopupOpen(false)} />
    </Container>
  );
};

export default Dashboard;