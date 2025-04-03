import { useState, useEffect, useMemo, Key } from "react";
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
  Tabs,
  Tab,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
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
  const [languageTab, setLanguageTab] = useState<"ru" | "ro" | "en">("ru");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [settings, setSettings] = useState<RandomSettings>({
    pageTitle: { ru: "", ro: "", en: "" },
    pageDescription: { ru: "", ro: "", en: "" },
    randomizers: [],
  });

  const [newRandomizer, setNewRandomizer] = useState<Omit<RandomizerConfig, "id">>({
    slotTitle: {
      ru: "",
      ro: "",
      en: "",
    },
    navigation: "1",
    categoryIds: [],
    active: true,
  });

  const [errors, setErrors] = useState({
    name: "",
    categories: "",
  });

  useEffect(() => {
    if (currentSettings) {
      setSettings({
        pageTitle: currentSettings.pageTitle || { ru: "", ro: "", en: "" },
        pageDescription: currentSettings.pageDescription || {
          ru: "",
          ro: "",
          en: "",
        },
        randomizers: currentSettings.randomizers || [],
      });
    }
  }, [currentSettings]);

  const filteredCategories = useMemo(
    () =>
      categories.filter(
        (cat: Category) => cat.parentId === newRandomizer.navigation
      ),
    [categories, newRandomizer.navigation]
  );

  const handleSlotTitleChange = (lang: "ru" | "ro" | "en", value: string) => {
    setNewRandomizer((prev) => ({
      ...prev,
      slotTitle: {
        ...prev.slotTitle,
        [lang]: value,
      },
    }));
  };

  const handlePageTitleChange = (lang: "ru" | "ro" | "en", value: string) => {
    setSettings((prev) => ({
      ...prev,
      pageTitle: {
        ...prev.pageTitle,
        [lang]: value,
      },
    }));
  };

  const handlePageDescriptionChange = (
    lang: "ru" | "ro" | "en",
    value: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      pageDescription: {
        ...prev.pageDescription,
        [lang]: value,
      },
    }));
  };

  const handleAddRandomizer = () => {
    const validationErrors = {
      name: !newRandomizer.slotTitle?.ru ? "Введите название (RU)" : "",
      categories:
        !newRandomizer.categoryIds || newRandomizer.categoryIds.length === 0
          ? "Выберите категории"
          : "",
    };

    setErrors(validationErrors);

    if (Object.values(validationErrors).some(Boolean)) return;

    const newConfig: RandomizerConfig = {
      id: Date.now().toString(),
      slotTitle: {
        ru: newRandomizer.slotTitle?.ru || "Без названия",
        ro: newRandomizer.slotTitle?.ro || newRandomizer.slotTitle?.ru || "",
        en: newRandomizer.slotTitle?.en || newRandomizer.slotTitle?.ru || "",
      },
      navigation: newRandomizer.navigation || "1",
      categoryIds: newRandomizer.categoryIds || [],
      active: newRandomizer.active !== false,
    };

    setSettings((prev) => ({
      ...prev,
      randomizers: [...prev.randomizers, newConfig],
    }));

    setNewRandomizer({
      slotTitle: { ru: "", ro: "", en: "" },
      navigation: "1",
      categoryIds: [],
      active: true,
    });
  };

  const handleEditRandomizer = (id: string) => {
    const randomizerToEdit = settings.randomizers.find(r => r.id === id);
    if (randomizerToEdit) {
      setNewRandomizer({
        slotTitle: randomizerToEdit.slotTitle,
        navigation: randomizerToEdit.navigation,
        categoryIds: randomizerToEdit.categoryIds,
        active: randomizerToEdit.active
      });
      setEditingId(id);
    }
  };

  const handleUpdateRandomizer = () => {
    if (!editingId) return;

    const validationErrors = {
      name: !newRandomizer.slotTitle?.ru ? "Введите название (RU)" : "",
      categories:
        !newRandomizer.categoryIds || newRandomizer.categoryIds.length === 0
          ? "Выберите категории"
          : "",
    };

    setErrors(validationErrors);

    if (Object.values(validationErrors).some(Boolean)) return;

    setSettings(prev => ({
      ...prev,
      randomizers: prev.randomizers.map(r => 
        r.id === editingId ? {
          ...r,
          slotTitle: newRandomizer.slotTitle,
          navigation: newRandomizer.navigation,
          categoryIds: newRandomizer.categoryIds,
          active: newRandomizer.active
        } : r
      )
    }));

    setEditingId(null);
    setNewRandomizer({
      slotTitle: { ru: "", ro: "", en: "" },
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
        pageTitle: settings.pageTitle,
        pageDescription: settings.pageDescription,
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
      settings.pageTitle.ru &&
      settings.randomizers.length > 0 &&
      settings.randomizers.every(
        (r) => r?.slotTitle?.ru && r.categoryIds?.length > 0
      )
    );
  }, [settings]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 1200,
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
            mb: 2,
          }}
        >
          <Typography variant="h5">Управление рандомайзерами</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Настройки страницы
          </Typography>

          <Tabs
            value={languageTab}
            onChange={(_, newValue) => setLanguageTab(newValue)}
            sx={{ mb: 1 }}
          >
            <Tab label="RU" value="ru" />
            <Tab label="RO" value="ro" />
            <Tab label="EN" value="en" />
          </Tabs>

          <TextField
            fullWidth
            size="small"
            label={`Заголовок страницы (${languageTab.toUpperCase()})${
              languageTab === "ru" ? "*" : ""
            }`}
            value={settings.pageTitle[languageTab]}
            onChange={(e) => handlePageTitleChange(languageTab, e.target.value)}
            sx={{ mb: 1 }}
            required={languageTab === "ru"}
          />

          <TextField
            fullWidth
            size="small"
            label={`Описание страницы (${languageTab.toUpperCase()})`}
            value={settings.pageDescription[languageTab]}
            onChange={(e) =>
              handlePageDescriptionChange(languageTab, e.target.value)
            }
            multiline
            rows={2}
          />
        </Paper>

        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <Paper elevation={3} sx={{ p: 3, height: "100%" }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {editingId ? "Редактировать рандомайзер" : "Добавить новый рандомайзер"}
              </Typography>

              <Tabs
                value={languageTab}
                onChange={(_, newValue) => setLanguageTab(newValue)}
                sx={{ mb: 2 }}
              >
                <Tab label="RU" value="ru" />
                <Tab label="RO" value="ro" />
                <Tab label="EN" value="en" />
              </Tabs>

              <TextField
                fullWidth
                label={`Название рандомайзера (${languageTab.toUpperCase()})${
                  languageTab === "ru" ? "*" : ""
                }`}
                value={newRandomizer.slotTitle[languageTab]}
                onChange={(e) =>
                  handleSlotTitleChange(languageTab, e.target.value)
                }
                error={!!errors.name && languageTab === "ru"}
                helperText={languageTab === "ru" ? errors.name : ""}
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
                  <MenuItem value="3">Навигация 3</MenuItem>
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
                      {selected.map((id: Key | null | undefined) => {
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
                startIcon={editingId ? <EditIcon /> : <AddIcon />}
                onClick={editingId ? handleUpdateRandomizer : handleAddRandomizer}
                disabled={
                  !newRandomizer.slotTitle.ru ||
                  newRandomizer.categoryIds.length === 0
                }
              >
                {editingId ? "Обновить" : "Добавить"}
              </Button>

              {editingId && (
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 1 }}
                  onClick={() => {
                    setEditingId(null);
                    setNewRandomizer({
                      slotTitle: { ru: "", ro: "", en: "" },
                      navigation: "1",
                      categoryIds: [],
                      active: true,
                    });
                  }}
                >
                  Отменить редактирование
                </Button>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper elevation={3} sx={{ p: 2, height: "100%" }}>
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
                            {randomizer.slotTitle?.ru || "Без названия"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {randomizer.slotTitle?.ro || ""}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {randomizer.slotTitle?.en || ""}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
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
                          <Box>
                            <IconButton
                              size="small"
                              onClick={() => handleEditRandomizer(randomizer.id)}
                              sx={{ mb: 1 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleRemoveRandomizer(randomizer.id)
                              }
                              sx={{ mb: 1 }}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
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

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
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