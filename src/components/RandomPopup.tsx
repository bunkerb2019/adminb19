import { useState, useEffect, useMemo } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  FormHelperText,
  TextField,
  Chip,
  Switch,
  FormControlLabel,
  Grid,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { useQueryClient } from "@tanstack/react-query";
import { setDoc } from "firebase/firestore";
import useCategories from "../modules/categories/useCategories";
import { useRandomSettings } from "../hooks/useRandomSettings";
import queryKeys from "../utils/queryKeys";
import { getRandomSettingsDoc } from "../utils/firebaseDoc";
import { Category, RandomSettings, RandomizerConfig } from "../types";

interface RandomPopupProps {
  open: boolean;
  onClose: () => void;
}

const RandomPopup = ({ open, onClose }: RandomPopupProps) => {
  const queryClient = useQueryClient();
  const { data: categories = [] } = useCategories();
  const { data: currentSettings } = useRandomSettings();

  const [settings, setSettings] = useState<RandomSettings>({
    randomizers: [],
  });

  const [newRandomizer, setNewRandomizer] = useState<
    Omit<RandomizerConfig, "id">
  >({
    name: "",
    slotTitle: "",
    navigation: "1",
    categoryIds: [],
    active: true,
  });

  const [errors, setErrors] = useState({
    name: "",
    slotTitle: "",
    categories: "",
  });

  useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings);
    }
  }, [currentSettings]);

  const filteredCategories = useMemo(
    () =>
      categories.filter(
        (cat: Category) => cat.parentId === newRandomizer.navigation
      ),
    [categories, newRandomizer.navigation]
  );

  const handleAddRandomizer = () => {
    const validationErrors = {
      name: !newRandomizer.name ? "Введите название" : "",
      slotTitle: !newRandomizer.slotTitle ? "Введите заголовок" : "",
      categories:
        newRandomizer.categoryIds.length === 0 ? "Выберите категории" : "",
    };

    setErrors(validationErrors);

    if (Object.values(validationErrors).some(Boolean)) return;

    const newConfig: RandomizerConfig = {
      id: Date.now().toString(),
      ...newRandomizer,
    };

    setSettings((prev) => ({
      ...prev,
      randomizers: [...prev.randomizers, newConfig],
    }));

    setNewRandomizer({
      name: "",
      slotTitle: "",
      navigation: "1",
      categoryIds: [],
      active: true,
    });
  };

  const handleRemoveRandomizer = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      randomizers: prev.randomizers.filter((r) => r.id !== id),
    }));
  };

  const handleToggleActive = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      randomizers: prev.randomizers.map((r) =>
        r.id === id ? { ...r, active: !r.active } : r
      ),
    }));
  };

  const handleSave = async () => {
    try {
      const docRef = getRandomSettingsDoc();
      await setDoc(docRef, {
        randomizers: settings.randomizers,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.randomSettings() });
      onClose();
    } catch (error) {
      console.error("Ошибка сохранения:", error);
    }
  };

  const isFormValid = useMemo(() => {
    return (
      settings.randomizers.length > 0 &&
      settings.randomizers.every(
        (r) => r.name && r.slotTitle && r.categoryIds.length > 0
      )
    );
  }, [settings.randomizers]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 1000,
          bgcolor: "background.paper",
          p: 3,
          borderRadius: 2,
          boxShadow: 24,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5">Управление рандомайзерами</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Grid container spacing={3}>
          {/* Левая колонка - форма добавления */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: "100%" }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Добавить новый
              </Typography>

              <TextField
                fullWidth
                label="Название рандомайзера*"
                value={newRandomizer.name}
                onChange={(e) =>
                  setNewRandomizer({ ...newRandomizer, name: e.target.value })
                }
                error={!!errors.name}
                helperText={errors.name}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Заголовок для пользователя*"
                value={newRandomizer.slotTitle}
                onChange={(e) =>
                  setNewRandomizer({
                    ...newRandomizer,
                    slotTitle: e.target.value,
                  })
                }
                error={!!errors.slotTitle}
                helperText={errors.slotTitle}
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Навигация</InputLabel>
                <Select
                  value={newRandomizer.navigation}
                  label="Навигация"
                  onChange={(e) =>
                    setNewRandomizer({
                      ...newRandomizer,
                      navigation: e.target.value as string,
                      categoryIds: [],
                    })
                  }
                >
                  <MenuItem value="1">Навигация 1</MenuItem>
                  <MenuItem value="2">Навигация 2</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth error={!!errors.categories}>
                <InputLabel>Категории*</InputLabel>
                <Select
                  multiple
                  value={newRandomizer.categoryIds}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewRandomizer({
                      ...newRandomizer,
                      categoryIds:
                        typeof value === "string" ? value.split(",") : value,
                    });
                  }}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((id) => {
                        const category = categories.find((c) => c.id === id);
                        return (
                          <Chip
                            key={id}
                            label={category?.ru || id}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {filteredCategories.map((category: Category) => (
                    <MenuItem key={category.id} value={category.id}>
                      <Checkbox
                        checked={newRandomizer.categoryIds.includes(
                          category.id
                        )}
                      />
                      <ListItemText primary={category.ru} />
                    </MenuItem>
                  ))}
                </Select>
                {errors.categories && (
                  <FormHelperText>{errors.categories}</FormHelperText>
                )}
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={newRandomizer.active}
                    onChange={(e) =>
                      setNewRandomizer({
                        ...newRandomizer,
                        active: e.target.checked,
                      })
                    }
                  />
                }
                label="Активен"
                sx={{ mb: 2 }}
              />

              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddRandomizer}
                disabled={
                  !newRandomizer.name ||
                  !newRandomizer.slotTitle ||
                  newRandomizer.categoryIds.length === 0
                }
              >
                Добавить рандомайзер
              </Button>
            </Paper>
          </Grid>

          {/* Правая колонка - список рандомайзеров */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: "100%" }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Список рандомайзеров ({settings.randomizers.length})
              </Typography>

              {settings.randomizers.length === 0 ? (
                <Typography
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 4 }}
                >
                  Нет добавленных рандомайзеров
                </Typography>
              ) : (
                <Box sx={{ maxHeight: 500, overflowY: "auto" }}>
                  {settings.randomizers.map((randomizer) => (
                    <Paper
                      key={randomizer.id}
                      sx={{
                        p: 2,
                        mb: 2,
                        borderLeft: 4,
                        borderColor: randomizer.active
                          ? "primary.main"
                          : "grey.500",
                      }}
                    >
                      <Box display="flex" justifyContent="space-between">
                        <Box>
                          <Typography fontWeight="bold">
                            {randomizer.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {randomizer.slotTitle}
                          </Typography>
                          <Typography variant="body2">
                            Навигация: {randomizer.navigation}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 0.5,
                              mt: 1,
                            }}
                          >
                            {randomizer.categoryIds.map((id) => {
                              const category = categories.find(
                                (c) => c.id === id
                              );
                              return (
                                <Chip
                                  key={id}
                                  label={category?.ru || id}
                                  size="small"
                                  variant="outlined"
                                />
                              );
                            })}
                          </Box>
                        </Box>
                        <Box
                          display="flex"
                          flexDirection="column"
                          alignItems="flex-end"
                        >
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleRemoveRandomizer(randomizer.id)
                            }
                            sx={{ mb: 1 }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                          <FormControlLabel
                            control={
                              <Switch
                                size="small"
                                checked={randomizer.active}
                                onChange={() =>
                                  handleToggleActive(randomizer.id)
                                }
                              />
                            }
                            label="Активен"
                            labelPlacement="start"
                          />
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={!isFormValid}
            sx={{ minWidth: 120 }}
          >
            Сохранить
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default RandomPopup;
