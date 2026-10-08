import { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Stack, Paper } from "@mui/material";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, ICON_UPLOAD_META } from "../firebase/firebaseConfig";
import { saveBarSx } from "../styles/saveBarSx";
import { showSaved } from "./SavedCheck";

const storage = getStorage();

export interface NavigationItem {
  id: string;
  ru: string;
  ro: string;
  en: string;
  icon: string;
}

const LANGS = [
  { key: "ru", label: "Русский" },
  { key: "ro", label: "Română" },
  { key: "en", label: "English" },
] as const;

const NavigationPopup = ({ onSaved }: { onSaved: () => void }) => {
  const [navigation, setNavigation] = useState<NavigationItem[]>([]);
  const [iconFiles, setIconFiles] = useState<{ [key: string]: File | null }>({});
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "settings", "navigation"))
      .then((snap) => snap.exists() && setNavigation(snap.data().categories || []))
      .catch((error) => console.error("Error loading navigation:", error));
  }, []);

  const update = (id: string, patch: Partial<NavigationItem>) =>
    setNavigation((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const handleSave = async () => {
    if (navigation.some((item) => !item.ru || !item.ro || !item.en)) {
      setShowErrors(true);
      return;
    }
    setSaving(true);
    try {
      const updatedNavigation = [...navigation];
      for (const item of updatedNavigation) {
        if (iconFiles[item.id]) {
          const storageRef = ref(storage, `navigation/${item.id}`);
          await uploadBytes(storageRef, iconFiles[item.id]!, ICON_UPLOAD_META);
          item.icon = await getDownloadURL(storageRef);
        }
      }
      await updateDoc(doc(db, "settings", "navigation"), {
        categories: updatedNavigation,
      });
      setIconFiles({});
      showSaved();
      onSaved();
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteIcon = async (id: string) => {
    setIconFiles((prev) => ({ ...prev, [id]: null }));
    setPreviews((prev) => ({ ...prev, [id]: "" }));
    update(id, { icon: "" });
    await deleteObject(ref(storage, `navigation/${id}`)).catch(() => {});
  };

  return (
    <Box>
      <Stack spacing={1.5}>
        {navigation.map((item) => {
          const iconSrc = previews[item.id] || item.icon;
          return (
            <Paper
              key={item.id}
              elevation={0}
              sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: "24px", bgcolor: "background.paper" }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    flexShrink: 0,
                    borderRadius: "50%",
                    bgcolor: "#111",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {iconSrc ? (
                    <img src={iconSrc} alt="" style={{ width: 24, height: 24, objectFit: "contain" }} />
                  ) : (
                    <Typography color="#fff" fontWeight={700}>
                      {item.id}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography fontWeight={700}>{item.ru || `Страница ${item.id}`}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Страница {item.id}
                  </Typography>
                </Box>
                <Button component="label" size="small" variant="outlined">
                  {iconSrc ? "Иконка" : "Добавить иконку"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIconFiles((prev) => ({ ...prev, [item.id]: file }));
                      setPreviews((prev) => ({ ...prev, [item.id]: URL.createObjectURL(file) }));
                      e.target.value = "";
                    }}
                  />
                </Button>
                {iconSrc && (
                  <Button size="small" color="error" onClick={() => handleDeleteIcon(item.id)}>
                    Убрать
                  </Button>
                )}
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                {LANGS.map(({ key, label }) => (
                  <TextField
                    key={key}
                    label={label}
                    value={item[key]}
                    onChange={(e) => update(item.id, { [key]: e.target.value })}
                    error={showErrors && !item[key]}
                    helperText={showErrors && !item[key] ? "Обязательное поле" : undefined}
                    size="small"
                    fullWidth
                  />
                ))}
              </Stack>
            </Paper>
          );
        })}
      </Stack>

      <Box sx={saveBarSx}>
        <Button variant="contained" size="large" onClick={handleSave} disabled={saving}>
          {saving ? "Сохраняю..." : "Сохранить"}
        </Button>
      </Box>
    </Box>
  );
};

export default NavigationPopup;
