import { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Tabs,
  Tab,
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
import { db } from "../firebase/firebaseConfig";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import useCategories from "../modules/categories/useCategories";
import { queryClient } from "../App";
import queryKeys from "../utils/queryKeys";
import { getCategoriesDoc } from "../utils/firebaseDoc";

const storage = getStorage();

export interface Category {
  id: string;
  parentId: string;
  ru: string;
  ro: string;
  en: string;
  icon: string;
}

interface CategoryPopupProps {
  open: boolean;
  onClose: () => void;
}

const CategoryPopup: React.FC<CategoryPopupProps> = ({ open, onClose }) => {
  const [iconFiles, setIconFiles] = useState<{ [key: string]: File | null }>({});
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({});
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: { [field: string]: string };
  }>({});
  const [activeTab, setActiveTab] = useState("1");

  const { data: serverCategories, isLoading, isRefetching } = useCategories();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (isLoading || isRefetching) return;
    if (!categories.length && serverCategories?.length) {
      setCategories(serverCategories);
    }
  }, [categories.length, serverCategories, isRefetching, isLoading]);

  const validateCategory = (category: Category) => {
    const errors: { [field: string]: string } = {};
    if (!category.ru) errors.ru = "Required";
    if (!category.ro) errors.ro = "Required";
    if (!category.en) errors.en = "Required";
    return errors;
  };

  const handleInputChange = (
    id: string,
    field: keyof Omit<Category, "id" | "parentId" | "icon">,
    value: string
  ) => {
    const updatedCategories = categories.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setCategories(updatedCategories);
    setValidationErrors((prev) => ({
      ...prev,
      [id]: validateCategory(updatedCategories.find((cat) => cat.id === id)!),
    }));
  };

  const handleIconUpload = (id: string, file: File | null) => {
    setIconFiles((prev) => ({ ...prev, [id]: file }));
  };

  const handleEditMode = (id: string) => {
    setEditMode((prev) => ({ ...prev, [id]: !prev[id] }));
    setValidationErrors((prev) => ({
      ...prev,
      [id]: validateCategory(categories.find((cat) => cat.id === id)!),
    }));
  };

  const handleSaveCategory = async (category: Category) => {
    const errors = validateCategory(category);
    setValidationErrors((prev) => ({ ...prev, [category.id]: errors }));
    if (Object.keys(errors).length > 0) return;

    try {
      let updatedIcon = category.icon;
      if (iconFiles[category.id]) {
        const storageRef = ref(storage, `categories/${category.id}`);
        await uploadBytes(storageRef, iconFiles[category.id]!);
        updatedIcon = await getDownloadURL(storageRef);
      }

      const updatedCategory = { ...category, icon: updatedIcon };
      setCategories((prev) =>
        prev.map((item) => (item.id === category.id ? updatedCategory : item))
      );
      setEditMode((prev) => ({ ...prev, [category.id]: false }));

      const docRef = doc(db, "settings", "categories");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(docRef, {
          list: docSnap.data().list.map((item: Category) =>
            item.id === category.id ? updatedCategory : item
          ),
        });
        await queryClient.invalidateQueries({ queryKey: queryKeys.categories() });
        setCategories([]);
      }
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const docRef = getCategoriesDoc();
      await updateDoc(docRef, {
        list: categories.filter((category) => category.id !== id),
      });
      setCategories([]);
      queryClient.invalidateQueries({ queryKey: queryKeys.categories() });
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleDeleteIcon = async (id: string) => {
    try {
      await deleteObject(ref(storage, `categories/${id}`));
      setCategories((prev) =>
        prev.map((item) => (item.id === id ? { ...item, icon: "" } : item))
      );
    } catch (error) {
      console.error("Error deleting icon:", error);
    }
  };

  const handleAddCategory = async (parentId: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      parentId,
      ru: "",
      ro: "",
      en: "",
      icon: "",
    };

    setCategories((prev) => [...prev, newCategory]);
    setValidationErrors((prev) => ({
      ...prev,
      [newCategory.id]: validateCategory(newCategory),
    }));
    setEditMode((prev) => ({ ...prev, [newCategory.id]: true }));

    const docRef = doc(db, "settings", "categories");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await updateDoc(docRef, { list: [...docSnap.data().list, newCategory] });
    } else {
      await setDoc(docRef, { list: [newCategory] });
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
          width: 900,
          bgcolor: "background.paper",
          p: 1.5,
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
            px: 1,
          }}
        >
          <Typography variant="subtitle1">Category Editor</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{
            mb: 1,
            minHeight: 36,
            "& .MuiTab-root": {
              minHeight: 36,
              py: 0.5,
              px: 1,
              fontSize: "0.75rem",
            },
          }}
        >
          {["1", "2", "3"].map((tab) => (
            <Tab key={tab} label={`Nav ${tab}`} value={tab} />
          ))}
        </Tabs>

        <Box sx={{ flex: 1, overflowY: "auto", p: 0.5 }}>
          {categories
            .filter((cat) => cat.parentId === activeTab)
            .map((item) => (
              <Paper
                key={item.id}
                elevation={1}
                sx={{
                  mb: 1,
                  p: 1,
                  bgcolor: editMode[item.id] ? "action.hover" : undefined,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  {/* Icon Block */}
                  <Box sx={{ width: 80 }}>
                    {item.icon ? (
                      <Box position="relative">
                        <img
                          src={item.icon}
                          alt="icon"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 2,
                          }}
                        />
                        {editMode[item.id] && (
                          <IconButton
                            size="small"
                            sx={{
                              position: "absolute",
                              top: -8,
                              right: -8,
                              p: 0.25,
                              bgcolor: "background.paper",
                            }}
                            onClick={() => handleDeleteIcon(item.id)}
                          >
                            <DeleteIcon fontSize="inherit" />
                          </IconButton>
                        )}
                      </Box>
                    ) : editMode[item.id] ? (
                      <Button
                        component="label"
                        size="small"
                        startIcon={<CloudUploadIcon fontSize="small" />}
                        sx={{ height: 32 }}
                      >
                        Icon
                        <input
                          type="file"
                          hidden
                          onChange={(e) =>
                            handleIconUpload(item.id, e.target.files?.[0] || null)
                          }
                        />
                      </Button>
                    ) : null}
                  </Box>

                  {/* Input Fields */}
                  <Stack direction="row" spacing={0.5} sx={{ flexGrow: 1 }}>
                    {["ru", "ro", "en"].map((lang) => (
                      <TextField
                        key={lang}
                        label={lang.toUpperCase()}
                        value={item[lang as keyof Category]}
                        onChange={(e) =>
                          handleInputChange(
                            item.id,
                            lang as "ru" | "ro" | "en",
                            e.target.value
                          )
                        }
                        size="small"
                        fullWidth
                        disabled={!editMode[item.id]}
                        error={!!validationErrors[item.id]?.[lang]}
                        helperText={validationErrors[item.id]?.[lang]}
                        sx={{
                          "& .MuiInputBase-root": { height: 40 },
                          "& .MuiFormHelperText-root": {
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          },
                        }}
                      />
                    ))}
                  </Stack>

                  {/* Action Buttons */}
                  <Stack direction="row" spacing={0.5}>
                    {editMode[item.id] ? (
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleSaveCategory(item)}
                        disabled={
                          Object.keys(validationErrors[item.id] || {}).length > 0
                        }
                        sx={{ height: 32, width: 32 }}
                      >
                        <SaveIcon fontSize="small" />
                      </IconButton>
                    ) : (
                      <IconButton
                        size="small"
                        onClick={() => handleEditMode(item.id)}
                        sx={{ height: 32, width: 32 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteCategory(item.id)}
                      sx={{ height: 32, width: 32 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
              </Paper>
            ))}
        </Box>

        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon fontSize="small" />}
          onClick={() => handleAddCategory(activeTab)}
          fullWidth
          sx={{ mt: 1, height: 36 }}
        >
          Add Category
        </Button>
      </Box>
    </Modal>
  );
};

export default CategoryPopup;