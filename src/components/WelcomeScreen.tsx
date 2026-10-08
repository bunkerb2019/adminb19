import { Box, Button, Typography, Paper, Avatar, Stack } from "@mui/material";
import { useAuth } from "../providers/AuthProvider";
import { loginWithGoogle, logout } from "../firebase/auth";
import GoogleIcon from "@mui/icons-material/Google";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import logo from "../assets/logo.png";

const WelcomeScreen = () => {
  const { user, isAdmin } = useAuth();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100dvh",
        p: 2,
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 3, sm: 4 },
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
          borderRadius: "28px",
          bgcolor: "#fff",
        }}
      >
        <Box
          component="img"
          src={logo}
          alt="Bunker B19"
          sx={{ width: 72, height: 72, mb: 2 }}
        />
        {user?.photoURL && (
          <Avatar
            src={user.photoURL}
            sx={{
              width: 100,
              height: 100,
              mx: "auto",
              mb: 3,
              border: "3px solid #111",
            }}
          />
        )}

        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700 }}
        >
          {user ? "Добро пожаловать!" : "Панель управления"}
        </Typography>

        {user ? (
          <>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {user.displayName || user.email}
            </Typography>

            {!isAdmin && (
              <Typography color="error" sx={{ my: 2 }}>
                У вас недостаточно прав для доступа к панели управления
              </Typography>
            )}

            <Stack
              direction="row"
              justifyContent="center"
              spacing={2}
              sx={{ mt: 4 }}
            >
              <Button
                variant="contained"
                onClick={logout}
                startIcon={<ExitToAppIcon />}
                size="large"
                sx={{
                  px: 4,
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: "1rem",
                }}
              >
                Выйти
              </Button>
            </Stack>
          </>
        ) : (
          <>
            <Typography variant="body1" sx={{ mb: 4, color: "text.secondary" }}>
              Авторизуйтесь с помощью Google для доступа к панели управления
            </Typography>

            <Button
              variant="contained"
              onClick={loginWithGoogle}
              startIcon={<GoogleIcon />}
              size="large"
              sx={{
                px: 4,
                borderRadius: 2,
                textTransform: "none",
                fontSize: "1rem",
                bgcolor: "#111",
                "&:hover": { bgcolor: "#333" },
              }}
            >
              Войти через Google
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default WelcomeScreen;
