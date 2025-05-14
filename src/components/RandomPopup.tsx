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
  useMediaQuery,
  useTheme,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
          width: "95%",
          maxWidth: isMobile ? "100%" : 800, // Уменьшил максимальную ширину
          bgcolor: "background.paper",
          p: isMobile ? 1 : 2,
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
            mb: 1,
          }}
        >
          <Typography variant="h6">Управление рандомайзерами</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Настройки страницы - теперь в одну колонку */}
        <Paper elevation={1} sx={{ p: 1, mb: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Настройки страницы
          </Typography>

          <Tabs
            value={languageTab}
            onChange={(_, newValue) => setLanguageTab(newValue)}
            sx={{ mb: 1 }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="RU" value="ru" />
            <Tab label="RO" value="ro" />
            <Tab label="EN" value="en" />
          </Tabs>

          <TextField
            fullWidth
            size="small"
            label={`Заголовок (${languageTab.toUpperCase()})${languageTab === "ru" ? "*" : ""}`}
            value={settings.pageTitle[languageTab]}
            onChange={(e) => handlePageTitleChange(languageTab, e.target.value)}
            sx={{ mb: 1 }}
            required={languageTab === "ru"}
          />

          <TextField
            fullWidth
            size="small"
            label={`Описание (${languageTab.toUpperCase()})`}
            value={settings.pageDescription[languageTab]}
            onChange={(e) =>
              handlePageDescriptionChange(languageTab, e.target.value)
            }
            multiline
            rows={1}
          />
        </Paper>

        <Grid container spacing={1}>
          {/* Форма добавления/редактирования */}
          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 1, height: "100%" }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                {editingId ? "Редактировать" : "Новый рандомайзер"}
              </Typography>

              <Tabs
                value={languageTab}
                onChange={(_, newValue) => setLanguageTab(newValue)}
                sx={{ mb: 1 }}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="RU" value="ru" />
                <Tab label="RO" value="ro" />
                <Tab label="EN" value="en" />
              </Tabs>

              <TextField
                fullWidth
                size="small"
                label={`Название (${languageTab.toUpperCase()})${languageTab === "ru" ? "*" : ""}`}
                value={newRandomizer.slotTitle[languageTab]}
                onChange={(e) =>
                  handleSlotTitleChange(languageTab, e.target.value)
                }
                error={!!errors.name && languageTab === "ru"}
                helperText={languageTab === "ru" ? errors.name : ""}
                sx={{ mb: 1 }}
              />

              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small" sx={{ mb: 1 }}>
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
                      <MenuItem value="1">Страница 1</MenuItem>
                      <MenuItem value="2">Страница 2</MenuItem>
                      <MenuItem value="3">Страница 3</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
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
                    sx={{ mt: 1 }}
                  />
                </Grid>
              </Grid>

              <FormControl fullWidth size="small" error={!!errors.categories}>
                <InputLabel>Категории*</InputLabel>
                <Select
                  multiple
                  size="small"
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
                      {selected.slice(0, 3).map((id: Key | null | undefined) => {
                        const category = categories.find((c) => c.id === id);
                        return (
                          <Chip
                            key={id}
                            label={category?.ru || id}
                            size="small"
                          />
                        );
                      })}
                      {selected.length > 3 && (
                        <Chip label={`+${selected.length - 3}`} size="small" />
                      )}
                    </Box>
                  )}
                >
                  {filteredCategories.map((category: Category) => (
                    <MenuItem key={category.id} value={category.id}>
                      <Checkbox
                        size="small"
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

              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="small"
                  startIcon={editingId ? <EditIcon fontSize="small" /> : <AddIcon fontSize="small" />}
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
                    size="small"
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
                    Отмена
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Список рандомайзеров */}
          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 1, height: "100%" }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Рандомайзеры ({settings.randomizers.length})
              </Typography>

              {settings.randomizers.length === 0 ? (
                <Typography
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 2 }}
                  variant="body2"
                >
                  Нет добавленных
                </Typography>
              ) : (
                <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
                  {settings.randomizers.map((randomizer) => (
                    <Paper
                      key={randomizer.id}
                      sx={{
                        p: 1,
                        mb: 1,
                        borderLeft: 2,
                        borderColor: randomizer.active
                          ? "primary.main"
                          : "grey.500",
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box sx={{ overflow: 'hidden' }}>
                          <Typography fontWeight="bold" variant="body2">
                            {randomizer.slotTitle?.ru || "Без названия"}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {randomizer.categoryIds.slice(0, 3).map((id) => {
                              const category = categories.find((c) => c.id === id);
                              return (
                                <Chip
                                  key={id}
                                  label={category?.ru || id}
                                  size="small"
                                  variant="outlined"
                                />
                              );
                            })}
                            {randomizer.categoryIds.length > 3 && (
                              <Chip label={`+${randomizer.categoryIds.length - 3}`} size="small" />
                            )}
                          </Box>
                        </Box>
                        <Box display="flex" flexDirection="column" alignItems="flex-end">
                          <Box display="flex">
                            <IconButton
                              size="small"
                              onClick={() => handleEditRandomizer(randomizer.id)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveRandomizer(randomizer.id)}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          <Switch
                            size="small"
                            checked={randomizer.active}
                            onChange={() => handleToggleActive(randomizer.id)}
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

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleSave}
            disabled={!isFormValid}
            sx={{ minWidth: 100 }}
          >
            Сохранить
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default RandomPopup;