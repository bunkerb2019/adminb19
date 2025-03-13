// NavigationPopup.tsx
import { useState, useEffect } from "react";
import { Modal, Box, Typography, TextField, Button, IconButton } from "@mui/material";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const storage = getStorage();

interface NavigationItem {
  id: string;
  ru: string;
  ro: string;
  en: string;
  icon: string;
}

interface NavigationPopupProps {
  open: boolean;
  onClose: () => void;
}

const NavigationPopup: React.FC<NavigationPopupProps> = ({ open, onClose }) => {
  const [navigation, setNavigation] = useState<NavigationItem[]>([
    { id: "1", ru: "", ro: "", en: "", icon: "" },
    { id: "2", ru: "", ro: "", en: "", icon: "" },
    { id: "3", ru: "", ro: "", en: "", icon: "" },
  ]);

  const [iconFiles, setIconFiles] = useState<{ [key: string]: File | null }>({});
  const [editField, setEditField] = useState<{ id: string; lang: "ru" | "ro" | "en" } | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ [id: string]: { [lang: string]: string } }>({});

  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        const docRef = doc(db, "settings", "navigation");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setNavigation(docSnap.data().categories || []);
        }
      } catch (error) {
        console.error("Ошибка загрузки навигации:", error);
      }
    };

    if (open) fetchNavigation();
  }, [open]);

  const validateItem = (item: NavigationItem) => {
    const errors: { [lang: string]: string } = {};
    if (!item.ru) {
      errors.ru = "Поле RU обязательно для заполнения";
    }
    if (!item.ro) {
      errors.ro = "Поле RO обязательно для заполнения";
    }
    if (!item.en) {
      errors.en = "Поле EN обязательно для заполнения";
    }
    return errors;
  };

  const handleInputChange = (id: string, field: "ru" | "ro" | "en", value: string) => {
    const updatedNavigation = navigation.map((item) => (item.id === id ? { ...item, [field]: value } : item));
    setNavigation(updatedNavigation);

    // Update validation errors immediately
    setValidationErrors((prev) => ({
      ...prev,
      [id]: validateItem(updatedNavigation.find((navItem) => navItem.id === id)!),
    }));
  };

  const handleIconUpload = (id: string, file: File | null) => {
    setIconFiles((prev) => ({ ...prev, [id]: file }));
  };

  const handleSave = async () => {
    // Validate all items before saving
    const newValidationErrors: { [id: string]: { [lang: string]: string } } = {};
    let hasErrors = false;

    navigation.forEach((item) => {
      const errors = validateItem(item);
      newValidationErrors[item.id] = errors;
      if (Object.keys(errors).length > 0) {
        hasErrors = true;
      }
    });

    setValidationErrors(newValidationErrors);

    if (hasErrors) {
      alert("Пожалуйста, заполните все обязательные поля.");
      return;
    }

    try {
      const updatedNavigation = [...navigation];

      for (let item of updatedNavigation) {
        if (iconFiles[item.id]) {
          const storageRef = ref(storage, `navigation/${item.id}`);
          await uploadBytes(storageRef, iconFiles[item.id] as Blob);
          item.icon = await getDownloadURL(storageRef);
        }
      }
      setNavigation(updatedNavigation);

      const docRef = doc(db, "settings", "navigation");
      await updateDoc(docRef, { categories: updatedNavigation });

      setIconFiles({});
      setEditField(null); // Сбрасываем режим редактирования
      onClose();
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      // Добавим уведомление об ошибке
      alert("Ошибка сохранения. Проверьте консоль для деталей.");
    }
  };

  const handleDeleteIcon = async (id: string) => {
    try {
      const storageRef = ref(storage, `navigation/${id}`);
      await deleteObject(storageRef);
      setNavigation((prev) => prev.map((item) => (item.id === id ? { ...item, icon: "" } : item)));
    } catch (error) {
      console.error("Ошибка удаления иконки:", error);
    }
  };

  return (
    <Modal open={open} onClose={() => {}}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 1050,
          bgcolor: "background.paper",
          p: 3,
          borderRadius: 2,
          boxShadow: 24,
        }}
      >
        {/* Заголовок */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6">Редактирование навигации</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {navigation.map((item) => (
          <Box key={item.id} sx={{ mb: 2, p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Typography variant="body1">Навигация {item.id}</Typography>

              <Button variant="contained" component="label" startIcon={<CloudUploadIcon />}>
                {item.icon ? "Заменить" : "Добавить иконку"}
                <input type="file" hidden onChange={(e) => handleIconUpload(item.id, e.target.files?.[0] || null)} />
              </Button>

              {item.icon && (
                <>
                  <img src={item.icon} alt="icon" style={{ width: 40, height: 40, borderRadius: 4 }} />
                  <IconButton color="error" onClick={() => handleDeleteIcon(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </>
              )}
            </Box>

            {/* Обозначения языков */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
              {(["ru", "ro", "en"] as const).map((lang) => (
                <Box key={lang} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: "bold", width: 30, textAlign: "center", color: "#555" }}
                  >
                    {lang.toUpperCase()}
                  </Typography>

                  {editField?.id === item.id && editField.lang === lang ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={item[lang]}
                      onChange={(e) => handleInputChange(item.id, lang, e.target.value)}
                      onBlur={() => setEditField(null)}
                      autoFocus
                      error={!!validationErrors[item.id]?.[lang]}
                      helperText={validationErrors[item.id]?.[lang]}
                    />
                  ) : (
                    <Typography
                      sx={{
                        flex: 1,
                        padding: "5px 10px",
                        border: "1px solid #ddd",
                        borderRadius: 2,
                        minHeight: "36px",
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        "&:hover": { backgroundColor: "#2c2c2c52" },
                        ...(validationErrors[item.id]?.[lang] && { border: "1px solid red" }), // Optional: highlight if there's an error
                      }}
                      onClick={() => setEditField({ id: item.id, lang })}
                    >
                      {item[lang] || <span style={{ opacity: 0.5 }}>Введите...</span>}
                    </Typography>
                  )}

                  <IconButton size="small" onClick={() => setEditField({ id: item.id, lang })}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>
        ))}

        <Button variant="contained" color="primary" fullWidth onClick={handleSave} sx={{ mt: 2 }}>
          Сохранить
        </Button>
      </Box>
    </Modal>
  );
};

export default NavigationPopup;
