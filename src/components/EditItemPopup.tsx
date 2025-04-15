import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { Order } from "../types";
import { collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db, storage } from "../firebase/firebaseConfig";
import useCreateMenuItem from "../hooks/useCreateMenuItem";
import { getDownloadURL, ref, deleteObject } from "firebase/storage";
import { ImageUploadInput } from "./ImageUploadInput";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLanguage } from "../contexts/LanguageContext";

interface EditItemPopupProps {
  open: boolean;
  onClose: () => void;
  item?: Order;
  onSave: (updatedItem: Order | null) => void;
  categories: string[];
}

const EditItemPopup: React.FC<EditItemPopupProps> = ({
  open,
  onClose,
  item,
  onSave,
  categories,
}) => {
  const [nameRu, setNameRu] = useState("");
  const [nameRo, setNameRo] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [descriptionRu, setDescriptionRu] = useState("");
  const [descriptionRo, setDescriptionRo] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [weight, setWeight] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const { getText } = useLanguage();

  // смена веса и цены!!!!!!!
  const [weightUnit, setWeightUnit] = useState<"g" | "ml" | "kg">("g");
  const [currency, setCurrency] = useState<"MDL" | "$" | "€">("$");

  const [active, setActive] = useState(true);

  useEffect(() => {
    if (item) {
      setNameRu(
        typeof item.name === "object" ? item.name.ru || "" : item.name || ""
      );
      setNameRo(typeof item.name === "object" ? item.name.ro || "" : "");
      setNameEn(typeof item.name === "object" ? item.name.en || "" : "");

      if (typeof item.description === "object") {
        setDescriptionRu(item.description.ru || "");
        setDescriptionRo(item.description.ro || "");
        setDescriptionEn(item.description.en || "");
      } else {
        setDescriptionRu(item.description || "");
        setDescriptionRo("");
        setDescriptionEn("");
      }

      setWeight(item.weight || "");
      setPrice(item.price || "");
      setWeightUnit(item.weightUnit || "g");
      setCurrency(item.currency || "$");
      setCategory(item.category ?? "");

      setActive(item.active !== false);

      if (item.image) {
        const storageRef = ref(storage, item.image);
        getDownloadURL(storageRef)
          .then((url) => {
            setImagePreview(url);
          })
          .catch((error) => {
            console.error("Error getting download URL:", error);
            setImagePreview(undefined);
          });
      } else {
        setImagePreview(undefined);
      }
    }
  }, [item]);

  const { saveItem, isLoading } = useCreateMenuItem({ item, onSave });

  const handleSave = () => {
    saveItem(
      {
        name: {
          ru: nameRu,
          ro: nameRo,
          en: nameEn,
        },
        description: {
          ru: descriptionRu,
          ro: descriptionRo,
          en: descriptionEn,
        },
        weight: Number(weight),
        weightUnit,
        price: Number(price),
        currency,
        category,
        active,
      },
      image
    );
  setImage(null);
  };

  const handleDeleteImage = async () => {
    if (!item || !item.image) return;

    setIsDeletingImage(true);
    try {
      const storageRef = ref(storage, item.image);
      await deleteObject(storageRef);

      const menuDoc = doc(collection(db, "menu"), item.id);
      await updateDoc(menuDoc, {
        image: null,
      });

      setImagePreview(undefined);
      setImage(null);
      onSave({ ...item, image: undefined });
    } catch (error) {
      console.error("Error deleting image:", error);
    } finally {
      setIsDeletingImage(false);
    }
  };

  const handleDelete = async () => {
    if (!item || isDeleting) return;

    const confirmDelete = window.confirm(
      getText({
        ru: "Вы уверены, что хотите удалить этот товар?",
        en: "Are you sure you want to delete this item?",
        ro: "Sigur doriți să ștergeți acest produs?",
      })
    );

    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      if (item.image) {
        const storageRef = ref(storage, item.image);
        await deleteObject(storageRef).catch((error) => {
          console.error("Error deleting image:", error);
        });
      }

      const menuDoc = doc(collection(db, "menu"), item.id);
      await deleteDoc(menuDoc);

      onSave(null);
      onClose();
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {getText({
          ru: "Редактировать товар",
          en: "Edit item",
          ro: "Editați produs",
        })}
      </DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}
      >
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
        >
          <Tab label={getText({ ru: "Русский", en: "Russian", ro: "Rusă" })} />
          <Tab
            label={getText({ ru: "Română", en: "Romanian", ro: "Română" })}
          />
          <Tab
            label={getText({ ru: "English", en: "English", ro: "Engleză" })}
          />
        </Tabs>

        <Box sx={{ display: currentTab === 0 ? "block" : "none" }}>
          <TextField
            label={getText({
              ru: "Название (Русский)",
              en: "Name (Russian)",
              ro: "Denumire (Rusă)",
            })}
            value={nameRu}
            onChange={(e) => setNameRu(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label={getText({
              ru: "Описание (Русский)",
              en: "Description (Russian)",
              ro: "Descriere (Rusă)",
            })}
            value={descriptionRu}
            onChange={(e) => setDescriptionRu(e.target.value)}
            fullWidth
            multiline
            rows={2}
            margin="normal"
          />
        </Box>

        <Box sx={{ display: currentTab === 1 ? "block" : "none" }}>
          <TextField
            label="Nume (Română)"
            value={nameRo}
            onChange={(e) => setNameRo(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Descriere (Română)"
            value={descriptionRo}
            onChange={(e) => setDescriptionRo(e.target.value)}
            fullWidth
            multiline
            rows={2}
            margin="normal"
          />
        </Box>

        <Box sx={{ display: currentTab === 2 ? "block" : "none" }}>
          <TextField
            label="Name (English)"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Description (English)"
            value={descriptionEn}
            onChange={(e) => setDescriptionEn(e.target.value)}
            fullWidth
            multiline
            rows={2}
            margin="normal"
          />
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Вес"
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value) || "")}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Единица веса</InputLabel>
            <Select
              value={weightUnit}
              onChange={(e) =>
                setWeightUnit(e.target.value as "g" | "ml" | "kg")
              }
              label="Единица веса"
            >
              <MenuItem value="g">г</MenuItem>
              <MenuItem value="ml">мл</MenuItem>
              <MenuItem value="kg">кг</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Цена"
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value) || "")}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Валюта</InputLabel>
            <Select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as "MDL" | "$" | "€")}
              label="Валюта"
            >
              <MenuItem value="MDL">MDL</MenuItem>
              <MenuItem value="$">$</MenuItem>
              <MenuItem value="€">€</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <FormControl fullWidth>
          <InputLabel>
            {getText({ ru: "Категория", en: "Category", ro: "Categorie" })}
          </InputLabel>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              color="primary"
            />
          }
          label={getText({
            ru: "Активный товар",
            en: "Active product",
            ro: "Produs activ",
          })}
          sx={{ mb: 2 }}
        />

        <ImageUploadInput
          setImage={setImage}
          image={image}
          setImagePreview={setImagePreview}
        />

        {imagePreview && (
          <Box sx={{ position: "relative", display: "inline-flex" }}>
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                maxWidth: "100px",
                marginTop: "10px",
                borderRadius: "5px",
                opacity: isDeletingImage ? 0.5 : 1,
              }}
            />
            <IconButton
              aria-label="delete image"
              onClick={handleDeleteImage}
              disabled={isDeletingImage}
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                color: "error.main",
                backgroundColor: "background.paper",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        <Button
          disabled={isLoading || isDeletingImage || isDeleting}
          variant="contained"
          color="error"
          onClick={handleDelete}
          sx={{ mt: 2 }}
          startIcon={isDeleting ? <CircularProgress size={20} /> : null}
        >
          {isDeleting
            ? getText({
                ru: "Удаление...",
                en: "Deleting...",
                ro: "Ștergere...",
              })
            : getText({
                ru: "Удалить товар",
                en: "Delete item",
                ro: "Ștergeți produs",
              })}
        </Button>

        <Button
          disabled={isLoading || isDeletingImage || isDeleting}
          variant="contained"
          color="primary"
          onClick={handleSave}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {getText({ ru: "Сохранить", en: "Save", ro: "Salvați" })}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemPopup;
