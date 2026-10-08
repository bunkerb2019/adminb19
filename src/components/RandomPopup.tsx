import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Switch,
  Stack,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import CheckIcon from "@mui/icons-material/Check";
import { useQueryClient } from "@tanstack/react-query";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import useCategories from "../modules/categories/useCategories";
import { useRandomSettings } from "../hooks/useRandomSettings";
import queryKeys from "../utils/queryKeys";
import { getRandomSettingsDoc } from "../utils/firebaseDoc";
import { Category, RandomSettings, RandomizerConfig } from "../types";
import { saveBarSx } from "../styles/saveBarSx";
import { showSaved } from "./SavedCheck";

type Lang = "ru" | "ro" | "en";
type Draft = Omit<RandomizerConfig, "id"> & { id?: string };

const LANGS: { key: Lang; label: string }[] = [
  { key: "ru", label: "Русский" },
  { key: "ro", label: "Română" },
  { key: "en", label: "English" },
];

const emptyDraft = (navigation: string): Draft => ({
  slotTitle: { ru: "", ro: "", en: "" },
  navigation,
  categoryIds: [],
  active: true,
});

const cardSx = { p: { xs: 2, sm: 2.5 }, borderRadius: "24px", bgcolor: "background.paper" };

const Step = ({ n, title, hint }: { n: number; title: string; hint?: string }) => (
  <Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ mb: 1.25 }}>
    <Box
      sx={{
        width: 24,
        height: 24,
        flexShrink: 0,
        borderRadius: "50%",
        bgcolor: "#111",
        color: "#fff",
        fontSize: 12,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {n}
    </Box>
    <Box>
      <Typography fontWeight={700} fontSize={14} lineHeight="24px">
        {title}
      </Typography>
      {hint && (
        <Typography variant="caption" color="text.secondary" component="div">
          {hint}
        </Typography>
      )}
    </Box>
  </Stack>
);

const Pill = ({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) => (
  <Box
    component="button"
    type="button"
    onClick={onClick}
    sx={{
      all: "unset",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: 0.5,
      px: 1.5,
      py: 0.75,
      borderRadius: 999,
      fontSize: 13,
      fontWeight: 600,
      border: "1.5px solid",
      borderColor: selected ? "#111" : "rgba(0,0,0,0.12)",
      bgcolor: selected ? "#111" : "#fff",
      color: selected ? "#fff" : "text.primary",
      transition: "all .15s",
    }}
  >
    {selected && <CheckIcon sx={{ fontSize: 16 }} />}
    {children}
  </Box>
);

const RandomPopup = ({ onSaved }: { onSaved: () => void }) => {
  const queryClient = useQueryClient();
  const { data: categories = [] } = useCategories();
  const { data: currentSettings } = useRandomSettings();
  const [pages, setPages] = useState<{ id: string; ru: string }[]>([]);
  const [pageLang, setPageLang] = useState<Lang>("ru");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState<RandomSettings>({
    pageTitle: { ru: "", ro: "", en: "" },
    pageDescription: { ru: "", ro: "", en: "" },
    randomizers: [],
  });

  useEffect(() => {
    if (!currentSettings) return;
    setSettings({
      pageTitle: currentSettings.pageTitle || { ru: "", ro: "", en: "" },
      pageDescription: currentSettings.pageDescription || { ru: "", ro: "", en: "" },
      randomizers: currentSettings.randomizers || [],
    });
  }, [currentSettings]);

  useEffect(() => {
    getDoc(doc(db, "settings", "navigation"))
      .then((snap) => snap.exists() && setPages(snap.data().categories || []))
      .catch(() => {});
  }, []);

  const pageName = (id: string) => pages.find((p) => p.id === id)?.ru || `Страница ${id}`;
  const pageIds = pages.length ? pages.map((p) => p.id) : ["1", "2", "3"];
  const categoryName = (id: string) => categories.find((c: Category) => c.id === id)?.ru || "—";

  const draftCategories = useMemo(
    () => (draft ? categories.filter((c: Category) => c.parentId === draft.navigation) : []),
    [categories, draft]
  );

  const patchDraft = (patch: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...patch } : d));

  const toggleCategory = (id: string) =>
    draft &&
    patchDraft({
      categoryIds: draft.categoryIds.includes(id)
        ? draft.categoryIds.filter((c) => c !== id)
        : [...draft.categoryIds, id],
    });

  const draftValid = !!draft?.slotTitle.ru && !!draft?.categoryIds.length;

  const applyDraft = () => {
    if (!draft) return;
    if (!draftValid) return setShowErrors(true);
    const config: RandomizerConfig = {
      id: draft.id || Date.now().toString(),
      slotTitle: {
        ru: draft.slotTitle.ru,
        ro: draft.slotTitle.ro || draft.slotTitle.ru,
        en: draft.slotTitle.en || draft.slotTitle.ru,
      },
      navigation: draft.navigation,
      categoryIds: draft.categoryIds,
      active: draft.active,
    };
    setSettings((prev) => ({
      ...prev,
      randomizers: draft.id
        ? prev.randomizers.map((r) => (r.id === draft.id ? config : r))
        : [...prev.randomizers, config],
    }));
    setDraft(null);
    setShowErrors(false);
  };

  const startDraft = (d: Draft) => {
    setDraft(d);
    setShowErrors(false);
  };

  const removeRandomizer = (r: RandomizerConfig) => {
    if (!window.confirm(`Удалить «${r.slotTitle?.ru}»?`)) return;
    setSettings((prev) => ({ ...prev, randomizers: prev.randomizers.filter((x) => x.id !== r.id) }));
  };

  const toggleActive = (id: string) =>
    setSettings((prev) => ({
      ...prev,
      randomizers: prev.randomizers.map((r) => (r.id === id ? { ...r, active: !r.active } : r)),
    }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(getRandomSettingsDoc(), {
        pageTitle: settings.pageTitle,
        pageDescription: settings.pageDescription,
        randomizers: settings.randomizers,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.randomSettings() });
      showSaved();
      onSaved();
    } catch (error) {
      console.error("Ошибка сохранения:", error);
    } finally {
      setSaving(false);
    }
  };

  const canSave =
    !!settings.pageTitle.ru &&
    settings.randomizers.every((r) => r?.slotTitle?.ru && r.categoryIds?.length > 0) &&
    !draft;

  const editor = draft && (
    <Paper elevation={0} sx={{ ...cardSx, border: "2px solid #111" }}>
      <Typography fontWeight={700} fontSize={16} sx={{ mb: 2 }}>
        {draft.id ? "Изменить рандомайзер" : "Новый рандомайзер"}
      </Typography>

      <Step n={1} title="Название кнопки" hint="Так раздел будет подписан у гостей" />
      <Stack spacing={1.25} sx={{ mb: 2.5 }}>
        {LANGS.map(({ key, label }) => (
          <TextField
            key={key}
            size="small"
            fullWidth
            label={key === "ru" ? `${label} *` : `${label} (необязательно)`}
            value={draft.slotTitle[key] || ""}
            onChange={(e) => patchDraft({ slotTitle: { ...draft.slotTitle, [key]: e.target.value } })}
            error={showErrors && key === "ru" && !draft.slotTitle.ru}
            helperText={showErrors && key === "ru" && !draft.slotTitle.ru ? "Введите название" : undefined}
          />
        ))}
      </Stack>

      <Step n={2} title="Из какой страницы меню" hint="Откуда брать товары" />
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2.5 }}>
        {pageIds.map((id) => (
          <Pill
            key={id}
            selected={draft.navigation === id}
            onClick={() => draft.navigation !== id && patchDraft({ navigation: id, categoryIds: [] })}
          >
            {pageName(id)}
          </Pill>
        ))}
      </Stack>

      <Step
        n={3}
        title={`Категории · выбрано ${draft.categoryIds.length} из ${draftCategories.length}`}
        hint="Товары из отмеченных категорий будут участвовать в розыгрыше"
      />
      <Stack direction="row" spacing={1} sx={{ mb: 1.25 }}>
        <Button size="small" onClick={() => patchDraft({ categoryIds: draftCategories.map((c: Category) => c.id) })}>
          Выбрать все
        </Button>
        <Button size="small" color="inherit" onClick={() => patchDraft({ categoryIds: [] })}>
          Снять все
        </Button>
      </Stack>
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
        {draftCategories.map((c: Category) => (
          <Pill key={c.id} selected={draft.categoryIds.includes(c.id)} onClick={() => toggleCategory(c.id)}>
            {c.ru}
          </Pill>
        ))}
        {!draftCategories.length && (
          <Typography variant="body2" color="text.secondary">
            На этой странице нет категорий
          </Typography>
        )}
      </Stack>
      {showErrors && !draft.categoryIds.length && (
        <Typography variant="caption" color="error">
          Отметьте хотя бы одну категорию
        </Typography>
      )}

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2, mb: 2 }}>
        <Typography fontSize={14} fontWeight={600}>
          Показывать гостям
        </Typography>
        <Switch checked={draft.active} onChange={(e) => patchDraft({ active: e.target.checked })} />
      </Stack>

      <Stack direction="row" spacing={1}>
        <Button variant="contained" fullWidth size="large" onClick={applyDraft}>
          {draft.id ? "Готово" : "Добавить"}
        </Button>
        <Button variant="outlined" fullWidth size="large" onClick={() => setDraft(null)}>
          Отмена
        </Button>
      </Stack>
    </Paper>
  );

  return (
    <Box>
      <Typography fontWeight={700} fontSize={13} color="text.secondary" sx={{ mb: 1, textTransform: "uppercase", letterSpacing: 0.5 }}>
        Шапка страницы
      </Typography>
      <Paper elevation={0} sx={{ ...cardSx, mb: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Заголовок и подпись вверху страницы «Случайное»
        </Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={pageLang}
          onChange={(_, v) => v && setPageLang(v)}
          sx={{ mb: 1.5 }}
        >
          {LANGS.map(({ key }) => (
            <ToggleButton key={key} value={key} sx={{ px: 2 }}>
              {key.toUpperCase()}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Stack spacing={1.25}>
          <TextField
            size="small"
            fullWidth
            label={pageLang === "ru" ? "Заголовок *" : "Заголовок"}
            value={settings.pageTitle[pageLang] || ""}
            onChange={(e) =>
              setSettings((p) => ({ ...p, pageTitle: { ...p.pageTitle, [pageLang]: e.target.value } }))
            }
            error={pageLang === "ru" && !settings.pageTitle.ru}
          />
          <TextField
            size="small"
            fullWidth
            label="Подпись"
            value={settings.pageDescription[pageLang] || ""}
            onChange={(e) =>
              setSettings((p) => ({
                ...p,
                pageDescription: { ...p.pageDescription, [pageLang]: e.target.value },
              }))
            }
          />
        </Stack>
      </Paper>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography fontWeight={700} fontSize={13} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
          Рандомайзеры · {settings.randomizers.length}
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Каждый рандомайзер — отдельная кнопка у гостей. Нажал — крутится лента и выпадает случайный товар из выбранных
        категорий.
      </Typography>

      <Stack spacing={1.25}>
        {settings.randomizers.map((r) =>
          draft?.id === r.id ? (
            <Box key={r.id}>{editor}</Box>
          ) : (
            <Paper key={r.id} elevation={0} sx={{ ...cardSx, opacity: r.active ? 1 : 0.6 }}>
              <Stack direction="row" alignItems="flex-start" spacing={1}>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography fontWeight={700} fontSize={16} noWrap>
                    {r.slotTitle?.ru || "Без названия"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {pageName(r.navigation)} · {r.categoryIds?.length || 0} кат. · {r.active ? "показывается" : "скрыт"}
                  </Typography>
                </Box>
                <Switch checked={r.active} onChange={() => toggleActive(r.id)} inputProps={{ "aria-label": "Показывать" }} />
              </Stack>
              <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ my: 1.5 }}>
                {r.categoryIds?.slice(0, 6).map((id) => (
                  <Box key={id} sx={{ px: 1.25, py: 0.25, borderRadius: 999, bgcolor: "#fff", fontSize: 12, fontWeight: 600 }}>
                    {categoryName(id)}
                  </Box>
                ))}
                {r.categoryIds?.length > 6 && (
                  <Box sx={{ px: 1.25, py: 0.25, fontSize: 12, color: "text.secondary" }}>
                    ещё {r.categoryIds.length - 6}
                  </Box>
                )}
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  disabled={!!draft}
                  onClick={() => startDraft({ ...r })}
                >
                  Изменить
                </Button>
                <IconButton size="small" color="error" onClick={() => removeRandomizer(r)} aria-label="Удалить">
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </Paper>
          )
        )}

        {draft && !draft.id && editor}

        {!draft && (
          <Button
            variant="outlined"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => startDraft(emptyDraft(pageIds[0]))}
            sx={{ borderStyle: "dashed", height: 56, borderRadius: "24px" }}
          >
            Новый рандомайзер
          </Button>
        )}
      </Stack>

      <Box sx={{ ...saveBarSx, flexDirection: "column", alignItems: { xs: "stretch", sm: "flex-end" }, gap: 0.75 }}>
        {draft && (
          <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ bgcolor: "background.default", borderRadius: 999, px: 1.5, py: 0.5 }}>
            Сначала нажмите «{draft.id ? "Готово" : "Добавить"}» в форме выше
          </Typography>
        )}
        <Button variant="contained" size="large" onClick={handleSave} disabled={!canSave || saving}>
          {saving ? "Сохраняю..." : "Сохранить"}
        </Button>
      </Box>
    </Box>
  );
};

export default RandomPopup;
