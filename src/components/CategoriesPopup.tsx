import { useState, useEffect } from "react";
import {
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
import { db, ICON_UPLOAD_META } from "../firebase/firebaseConfig";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import logoWhite from "../assets/logo.png";
import { saveBarSx } from "../styles/saveBarSx";
import { showSaved } from "./SavedCheck";
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

const CategoryPopup = () => {
  const [iconFiles, setIconFiles] = useState<{ [key: string]: File | null }>(
    {}
  );
  const [iconPreviews, setIconPreviews] = useState<{ [key: string]: string }>(
    {}
  );
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
    if (!file) return;
    setIconFiles((prev) => ({ ...prev, [id]: file }));
    setIconPreviews((prev) => ({ ...prev, [id]: URL.createObjectURL(file) }));
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
        await uploadBytes(storageRef, iconFiles[category.id]!, ICON_UPLOAD_META);
        updatedIcon = await getDownloadURL(storageRef);
      }

      setIconFiles((prev) => ({ ...prev, [category.id]: null }));
      setIconPreviews((prev) => ({ ...prev, [category.id]: "" }));

      const updatedCategory = { ...category, icon: updatedIcon };
      setCategories((prev) =>
        prev.map((item) => (item.id === category.id ? updatedCategory : item))
      );
      setEditMode((prev) => ({ ...prev, [category.id]: false }));

      const docRef = doc(db, "settings", "categories");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(docRef, {
          list: docSnap
            .data()
            .list.map((item: Category) =>
              item.id === category.id ? updatedCategory : item
            ),
        });
        await queryClient.invalidateQueries({
          queryKey: queryKeys.categories(),
        });
        setCategories([]);
        showSaved();
      }
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Удалить категорию?")) return;
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
    setIconFiles((prev) => ({ ...prev, [id]: null }));
    setIconPreviews((prev) => ({ ...prev, [id]: "" }));
    setCategories((prev) =>
      prev.map((item) => (item.id === id ? { ...item, icon: "" } : item))
    );
    try {
      const docRef = getCategoriesDoc();
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(docRef, {
          list: docSnap
            .data()
            .list.map((item: Category) =>
              item.id === id ? { ...item, icon: "" } : item
            ),
        });
      }
      // файла может уже не быть в Storage — иконку всё равно отвязываем
      await deleteObject(ref(storage, `categories/${id}`)).catch(() => {});
      queryClient.invalidateQueries({ queryKey: queryKeys.categories() });
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
      <Box>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{ mb: 1.5, borderBottom: 1, borderColor: "divider" }}
        >
          {["1", "2", "3"].map((tab) => (
            <Tab key={tab} label={`Страница ${tab}`} value={tab} />
          ))}
        </Tabs>

        <Box>
          {categories
            .filter((cat) => cat.parentId === activeTab)
            .map((item) => {
              const editing = !!editMode[item.id];
              const iconSrc = iconPreviews[item.id] || item.icon;
              const hasErrors =
                Object.keys(validationErrors[item.id] || {}).length > 0;
              const fileInput = (
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    handleIconUpload(item.id, e.target.files?.[0] || null);
                    e.target.value = "";
                  }}
                />
              );

              return (
                <Paper
                  key={item.id}
                  variant="outlined"
                  sx={{
                    mb: 1,
                    p: 1.5,
                    borderRadius: "20px",
                    bgcolor: "background.paper",
                    borderColor: editing ? "primary.main" : "transparent",
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    {/* Icon */}
                    <Stack alignItems="center" spacing={0.5} sx={{ width: 72, flexShrink: 0 }}>
                      <Box
                        component={editing ? "label" : "div"}
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: "16px",
                          bgcolor: "#111",
                          border: "1px dashed",
                          borderColor: editing ? "primary.main" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          cursor: editing ? "pointer" : "default",
                        }}
                      >
                        <img
                          src={iconSrc || logoWhite}
                          alt=""
                          style={{ width: 40, height: 40, objectFit: "contain" }}
                        />
                        {editing && fileInput}
                      </Box>
                      {editing && (
                        <>
                          <Button
                            component="label"
                            size="small"
                            sx={{ minWidth: 0, py: 0, fontSize: 12 }}
                          >
                            {iconSrc ? "Заменить" : "Загрузить"}
                            {fileInput}
                          </Button>
                          {iconSrc && (
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleDeleteIcon(item.id)}
                              sx={{ minWidth: 0, py: 0, fontSize: 12 }}
                            >
                              Убрать
                            </Button>
                          )}
                        </>
                      )}
                    </Stack>

                    {/* Names */}
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      {editing ? (
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                          {(["ru", "ro", "en"] as const).map((lang) => (
                            <TextField
                              key={lang}
                              label={lang.toUpperCase()}
                              value={item[lang]}
                              onChange={(e) =>
                                handleInputChange(item.id, lang, e.target.value)
                              }
                              size="small"
                              fullWidth
                              error={!!validationErrors[item.id]?.[lang]}
                            />
                          ))}
                        </Stack>
                      ) : (
                        <Box sx={{ pt: 0.5 }}>
                          <Typography fontWeight={600} noWrap>
                            {item.ru || "Без названия"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {[item.ro, item.en].filter(Boolean).join(" · ")}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Actions */}
                    <Stack direction="row" spacing={0.5}>
                      {editing ? (
                        <IconButton
                          color="success"
                          onClick={() => handleSaveCategory(item)}
                          disabled={hasErrors}
                          aria-label="Сохранить"
                        >
                          <SaveIcon />
                        </IconButton>
                      ) : (
                        <IconButton
                          onClick={() => handleEditMode(item.id)}
                          aria-label="Редактировать"
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteCategory(item.id)}
                        aria-label="Удалить категорию"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Paper>
              );
            })}
        </Box>

        <Box sx={saveBarSx}>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => handleAddCategory(activeTab)}
          >
            Добавить категорию
          </Button>
        </Box>
      </Box>
  );
};

export default CategoryPopup;
