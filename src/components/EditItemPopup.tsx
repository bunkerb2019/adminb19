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
} from "@mui/material";
import { Order } from "../types";
import { collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db, storage } from "../firebase/firebaseConfig";
import useCreateMenuItem from "../hooks/useCreateMenuItem";
import { getDownloadURL, ref, deleteObject } from 'firebase/storage';
import { ImageUploadInput } from "./ImageUploadInput";
import DeleteIcon from '@mui/icons-material/Delete';

interface EditItemPopupProps {
  open: boolean;
  onClose: () => void;
  item?: Order;
  onSave: (updatedItem: Order) => void;
  categories: string[];
}

const EditItemPopup: React.FC<EditItemPopupProps> = ({ open, onClose, item, onSave, categories }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState<string>("");
  const [weight, setWeight] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const [isDeletingImage, setIsDeletingImage] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name ?? '');
      setDescription(item.description || "");
      setWeight(item.weight || "");
      setPrice(item.price || "");
      setCategory(item.category ?? '');

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
    saveItem({
      name,
      description,
      weight: Number(weight),
      price: Number(price),
      category,
    }, image);
  };

  const handleDeleteImage = async () => {
    if (!item || !item.image) return;

    setIsDeletingImage(true);
    try {
      // Удаляем изображение из Storage
      const storageRef = ref(storage, item.image);
      await deleteObject(storageRef);

      // Обновляем документ в Firestore, удаляя ссылку на изображение
      const menuDoc = doc(collection(db, "menu"), item.id);
      await updateDoc(menuDoc, {
        image: null
      });

      // Обновляем локальное состояние
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
    if (!item) return;

    // Если есть изображение, удаляем его из Storage
    if (item.image) {
      try {
        const storageRef = ref(storage, item.image);
        await deleteObject(storageRef);
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }

    // Удаляем документ из Firestore
    const menuDoc = doc(collection(db, "menu"), item.id);
    await deleteDoc(menuDoc);

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Редактировать товар</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}>
        <TextField label="Название" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
        <TextField label="Описание" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline rows={2} />
        <TextField label="Вес (граммы)" type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value) || "")} fullWidth />
        <TextField label="Цена ($)" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value) || "")} fullWidth />

        <FormControl fullWidth>
          <InputLabel>Категория</InputLabel>
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <ImageUploadInput setImage={setImage} image={image} setImagePreview={setImagePreview} />

        {imagePreview && (
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <img 
              src={imagePreview} 
              alt="Preview" 
              style={{ 
                maxWidth: "100px", 
                marginTop: "10px", 
                borderRadius: "5px",
                opacity: isDeletingImage ? 0.5 : 1 
              }} 
            />
            <IconButton
              aria-label="delete image"
              onClick={handleDeleteImage}
              disabled={isDeletingImage}
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                color: 'error.main',
                backgroundColor: 'background.paper',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        <Button 
          disabled={isLoading || isDeletingImage} 
          variant="contained" 
          color="error" 
          onClick={handleDelete}
          sx={{ mt: 2 }}
        >
          Удалить товар
        </Button>

        <Button 
          disabled={isLoading || isDeletingImage} 
          variant="contained" 
          color="primary" 
          onClick={handleSave}
        >
          Сохранить
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemPopup;