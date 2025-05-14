import { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Stack,
  Paper,
} from "@mui/material";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const storage = getStorage();

export interface NavigationItem {
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
  const [editField, setEditField] = useState<{
    id: string;
    lang: "ru" | "ro" | "en";
  } | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    [id: string]: { [lang: string]: string };
  }>({});

  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        const docRef = doc(db, "settings", "navigation");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setNavigation(docSnap.data().categories || []);
        }
      } catch (error) {
        console.error("Error loading navigation:", error);
      }
    };

    if (open) fetchNavigation();
  }, [open]);

  const validateItem = (item: NavigationItem) => {
    const errors: { [lang: string]: string } = {};
    if (!item.ru) errors.ru = "Required";
    if (!item.ro) errors.ro = "Required";
    if (!item.en) errors.en = "Required";
    return errors;
  };

  const handleInputChange = (
    id: string,
    field: "ru" | "ro" | "en",
    value: string
  ) => {
    const updatedNavigation = navigation.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setNavigation(updatedNavigation);
    setValidationErrors((prev) => ({
      ...prev,
      [id]: validateItem(updatedNavigation.find((navItem) => navItem.id === id)!),
    }));
  };

  const handleIconUpload = (id: string, file: File | null) => {
    setIconFiles((prev) => ({ ...prev, [id]: file }));
  };

  const handleSave = async () => {
    const newValidationErrors: { [id: string]: { [lang: string]: string } } = {};
    let hasErrors = false;

    navigation.forEach((item) => {
      const errors = validateItem(item);
      newValidationErrors[item.id] = errors;
      if (Object.keys(errors).length > 0) hasErrors = true;
    });

    setValidationErrors(newValidationErrors);
    if (hasErrors) return;

    try {
      const updatedNavigation = [...navigation];
      for (const item of updatedNavigation) {
        if (iconFiles[item.id]) {
          const storageRef = ref(storage, `navigation/${item.id}`);
          await uploadBytes(storageRef, iconFiles[item.id]!);
          item.icon = await getDownloadURL(storageRef);
        }
      }
      setNavigation(updatedNavigation);
      await updateDoc(doc(db, "settings", "navigation"), {
        categories: updatedNavigation,
      });
      setIconFiles({});
      setEditField(null);
      onClose();
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleDeleteIcon = async (id: string) => {
    try {
      await deleteObject(ref(storage, `navigation/${id}`));
      setNavigation((prev) =>
        prev.map((item) => (item.id === id ? { ...item, icon: "" } : item))
      );
    } catch (error) {
      console.error("Error deleting icon:", error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "95%",
          maxWidth: 800,
          bgcolor: "background.paper",
          p: { xs: 2, sm: 3 },
          borderRadius: 2,
          boxShadow: 24,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
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
          <Typography variant="h6">Navigation Editor</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto", pr: 1 }}>
          {navigation.map((item) => (
            <Paper
              key={item.id}
              elevation={2}
              sx={{
                mb: 2,
                p: 2,
                borderRadius: 2,
                backgroundColor: "background.default",
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{ mb: 1, flexWrap: "wrap" }}
              >
                <Typography variant="body2">Страница {item.id}</Typography>

                <Button
                  component="label"
                  size="small"
                  startIcon={<CloudUploadIcon fontSize="small" />}
                  sx={{ height: 32 }}
                >
                  {item.icon ? "Change" : "Add Icon"}
                  <input
                    type="file"
                    hidden
                    onChange={(e) =>
                      handleIconUpload(item.id, e.target.files?.[0] || null)
                    }
                  />
                </Button>

                {item.icon && (
                  <>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 1,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                      }}
                    >
                      <img
                        src={item.icon}
                        alt="icon"
                        style={{ width: 24, height: 24, objectFit: "contain" }}
                      />
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteIcon(item.id)}
                      sx={{ height: 32, width: 32 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </>
                )}
              </Stack>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{ mb: 1 }}
              >
                {(["ru", "ro", "en"] as const).map((lang) => (
                  <Box key={lang} sx={{ flex: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Typography variant="caption" sx={{ width: 24 }}>
                        {lang.toUpperCase()}
                      </Typography>
                      {editField?.id === item.id && editField.lang === lang ? (
                        <TextField
                          fullWidth
                          size="small"
                          value={item[lang]}
                          onChange={(e) =>
                            handleInputChange(item.id, lang, e.target.value)
                          }
                          onBlur={() => setEditField(null)}
                          autoFocus
                          error={!!validationErrors[item.id]?.[lang]}
                          helperText={validationErrors[item.id]?.[lang]}
                          sx={{
                            "& .MuiInputBase-root": { height: 32 },
                          }}
                        />
                      ) : (
                        <Paper
                          variant="outlined"
                          sx={{
                            flex: 1,
                            p: "6px 10px",
                            minHeight: 32,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            cursor: "pointer",
                            transition: "0.2s",
                            borderColor: validationErrors[item.id]?.[lang]
                              ? "error.main"
                              : "divider",
                            "&:hover": {
                              backgroundColor: "action.hover",
                            },
                          }}
                          onClick={() => setEditField({ id: item.id, lang })}
                        >
                          <Typography variant="body2">
                            {item[lang] || (
                              <span style={{ opacity: 0.5 }}>Click to edit</span>
                            )}
                          </Typography>
                        </Paper>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => setEditField({ id: item.id, lang })}
                        sx={{ height: 32, width: 32 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Paper>
          ))}
        </Box>

        <Button
          variant="contained"
          size="medium"
          onClick={handleSave}
          fullWidth
          sx={{ mt: 2, height: 44, fontWeight: 500 }}
        >
          Save
        </Button>
      </Box>
    </Modal>
  );
};

export default NavigationPopup;