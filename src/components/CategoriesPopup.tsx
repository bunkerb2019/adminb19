import { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db } from "../firebase/firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
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
  const [iconFiles, setIconFiles] = useState<{ [key: string]: File | null }>(
    {}
  );
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({});
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: { [field: string]: string };
  }>({});

  const { data: serverCategories, isLoading, isRefetching } = useCategories();

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    console.log({serverCategories, categories, isLoading, isRefetching})

    if (isLoading || isRefetching) return
    if (!categories.length && serverCategories?.length) {
      setCategories(serverCategories);
    }
  }, [categories.length, serverCategories, isRefetching, isLoading, categories]);

  const validateCategory = (category: Category) => {
    const errors: { [field: string]: string } = {};
    if (!category.ru) {
      errors.ru = "Поле обязательно для заполнения";
    }
    if (!category.ro) {
      errors.ro = "Поле обязательно для заполнения";
    }
    if (!category.en) {
      errors.en = "Поле обязательно для заполнения";
    }
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

    // Update validation errors immediately
    setValidationErrors((prev) => ({
      ...prev,
      [id]: validateCategory(
        updatedCategories.find((cat) => cat.id === id) as Category
      ),
    }));
  };

  const handleIconUpload = (id: string, file: File | null) => {
    setIconFiles((prev) => ({ ...prev, [id]: file }));
  };

  const handleEditMode = (id: string) => {
    setEditMode((prev) => ({ ...prev, [id]: !prev[id] }));
    setValidationErrors((prev) => ({
      ...prev,
      [id]: validateCategory(
        categories.find((cat) => cat.id === id) as Category
      ),
    }));
  };

  const handleSaveCategory = async (category: Category) => {
    const errors = validateCategory(category);
    setValidationErrors((prev) => ({ ...prev, [category.id]: errors }));

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      let updatedIcon = category.icon;

      if (iconFiles[category.id]) {
        const storageRef = ref(storage, `categories/${category.id}`);
        await uploadBytes(storageRef, iconFiles[category.id] as Blob);
        updatedIcon = await getDownloadURL(storageRef);
      }

      const updatedCategory = { ...category, icon: updatedIcon };

      // Optimistic update of local state
      setCategories((prev) =>
        prev.map((item) => (item.id === category.id ? updatedCategory : item))
      );
      setEditMode((prev) => ({ ...prev, [category.id]: false }));

      const docRef = doc(db, "settings", "categories");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const updatedCategories = docSnap
          .data()
          .list.map((item: Category) =>
            item.id === category.id ? updatedCategory : item
          );
        await updateDoc(docRef, { list: updatedCategories });
        await queryClient.invalidateQueries({queryKey: queryKeys.categories()})
        setCategories([])
      }

    
    } catch (error) {
      console.error("Ошибка сохранения категории:", error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      
      const docRef = getCategoriesDoc()
      const newCategories = categories.filter(category => category.id !== id)
      await updateDoc(docRef, { list: newCategories });

      setCategories([])
      queryClient.invalidateQueries({queryKey: queryKeys.categories()})
    } catch (error) {
      console.error("Ошибка удаления категории:", error);
    }
  };

  const handleDeleteIcon = async (id: string) => {
    try {
      const storageRef = ref(storage, `categories/${id}`);
      await deleteObject(storageRef);
      setCategories((prev) =>
        prev.map((item) => (item.id === id ? { ...item, icon: "" } : item))
      );
    } catch (error) {
      console.error("Ошибка удаления иконки:", error);
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

    // Optimistically update local state
    setCategories((prev) => [...prev, newCategory]);

    // Initialize validation errors for the new category
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
          width: 1050,
          bgcolor: "background.paper",
          p: 3,
          borderRadius: 2,
          boxShadow: 24,
          maxHeight: "80vh",
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
          <Typography variant="h6">Редактирование категорий</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", gap: 3 }}>
          {["1", "2"].map((parentId) => (
            <Box
              key={parentId}
              sx={{ 
                flex: 1,
                mb: 3, 
                p: 2, 
                border: "1px solid #ddd", 
                borderRadius: 2,
                minHeight: "100%"
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                Навигация {parentId === "1" ? "1st" : "2nd"}
              </Typography>

              {categories
                .filter((cat) => cat.parentId === parentId)
                .map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      mb: 2,
                      p: 2,
                      border: "1px solid #ddd",
                      borderRadius: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 1,
                      }}
                    >
                      <Typography variant="body1">Категория</Typography>

                      <Button
                        variant="contained"
                        component="label"
                        startIcon={<CloudUploadIcon />}
                      >
                        {item.icon ? "Заменить" : "Добавить иконку"}
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
                            style={{ width: 40, height: 40, borderRadius: 4 }}
                          />
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteIcon(item.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </Box>

                    <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
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
                          sx={{ flex: 1 }}
                          disabled={!editMode[item.id]}
                          error={!!validationErrors[item.id]?.[lang]}
                          helperText={validationErrors[item.id]?.[lang]}
                        />
                      ))}
                    </Box>

                    <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                      {editMode[item.id] ? (
                        <Button
                          variant="contained"
                          color="success"
                          onClick={() => handleSaveCategory(item)}
                          disabled={
                            Object.keys(validationErrors[item.id] || {}).length >
                            0
                          }
                        >
                          Сохранить
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          onClick={() => handleEditMode(item.id)}
                        >
                          Редактировать
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteCategory(item.id)}
                      >
                        Удалить категорию
                      </Button>
                    </Box>
                  </Box>
                ))}

              <Button
                variant="contained"
                onClick={() => handleAddCategory(parentId)}
                sx={{ mt: 2 }}
              >
                Добавить категорию
              </Button>
            </Box>
          ))}
        </Box>
      </Box>
    </Modal>
  );
};

export default CategoryPopup;