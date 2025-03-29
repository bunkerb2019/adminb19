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
} from "@mui/material";
import { Order } from "../types";
import { collection, deleteDoc, doc } from "firebase/firestore";
import { db, storage } from "../firebase/firebaseConfig";
import useCreateMenuItem from "../hooks/useCreateMenuItem";
import { getDownloadURL, ref } from 'firebase/storage';
import { ImageUploadInput } from "./ImageUploadInput";

interface EditItemPopupProps {
  open: boolean;
  onClose: () => void;
  item?: Order;
  onSave: (updatedItem: Order) => void;
  categories: string[]; // Добавляем новый пропс
}





const EditItemPopup: React.FC<EditItemPopupProps> = ({ open, onClose, item, onSave, categories }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState<string>("");
  const [weight, setWeight] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>();

  useEffect(() => {
    if (item) {
      setName(item.name ?? '');
      setDescription(item.description || "");
      setWeight(item.weight || "");
      setPrice(item.price || "");
      setCategory(item.category ?? '');

      // Получаем URL изображения из Firebase Storage, если item.image - это путь
      if (item.image) {
        const storageRef = ref(storage, item.image);
        getDownloadURL(storageRef)
          .then((url) => {
            setImagePreview(url);
          })
          .catch((error) => {
            console.error("Error getting download URL:", error);
            setImagePreview(undefined); // Обработка ошибки
          });
      } else {
        setImagePreview(undefined); // Если item.image отсутствует
      }
    }
  }, [item]);

  const {saveItem, isLoading} = useCreateMenuItem({item, onSave})

  const handleSave = () => {
    saveItem({
      name,
      description,
      weight: Number(weight),
      price: Number(price),
      category,
    }, image)
  }

  const handleDelete = async () => {
    if (!item) return;

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
          <img src={imagePreview} alt="Preview" style={{ maxWidth: "100px", marginTop: "10px", borderRadius: "5px" }} />
        )}

        <Button disabled={isLoading} variant="contained" color="error" onClick={handleDelete}>
          Удалить
        </Button>

        <Button loading={isLoading} variant="contained" color="primary" onClick={handleSave}>
          Сохранить
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemPopup;
