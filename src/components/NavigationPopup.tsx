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
          width: 800,
          bgcolor: "background.paper",
          p: 2,
          borderRadius: 1,
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
            mb: 1,
          }}
        >
          <Typography variant="subtitle1">Navigation Editor</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto", p: 1 }}>
          {navigation.map((item) => (
            <Paper key={item.id} elevation={1} sx={{ mb: 1.5, p: 1.5 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="body2">Nav {item.id}</Typography>
                
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
                    <img
                      src={item.icon}
                      alt="icon"
                      style={{ width: 32, height: 32, borderRadius: 2 }}
                    />
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

              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
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
                            p: "8px 12px",
                            minHeight: 32,
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                            ...(validationErrors[item.id]?.[lang] && {
                              borderColor: "error.main",
                            }),
                          }}
                          onClick={() => setEditField({ id: item.id, lang })}
                        >
                          <Typography variant="body2">
                            {item[lang] || <span style={{ opacity: 0.5 }}>Click to edit</span>}
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
          size="small"
          onClick={handleSave}
          fullWidth
          sx={{ mt: 1, height: 36 }}
        >
          Save
        </Button>
      </Box>
    </Modal>
  );
};

export default NavigationPopup;