import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, TextField, Button, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import { Order } from "../types";
import useCreateMenuItem from "../hooks/useCreateMenuItem";
import useCategories from "../modules/categories/useCategories";

interface AddItemPopupProps {
  open: boolean;
  onClose: () => void;
  onAdd: (newItem: Order) => void;
}

const AddItemPopup: React.FC<AddItemPopupProps> = ({ open, onClose, onAdd }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"food" | "bar">("food");
  const [image, setImage] = useState<File>();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
    }
  };

  const {saveItem, isLoading} = useCreateMenuItem({onSave: onAdd})

  const handleSave = async () => {
      
    const newItem: Partial<Order> = {
      name,
      description,
      weight: Number(weight),
      price: Number(price),
      category,
      type,
    };
    saveItem(newItem, image)
  };

  const {data} = useCategories()

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Добавить товар</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}>
        <TextField label="Название" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
        <TextField label="Описание" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline rows={2} />
        <TextField label="Вес (граммы)" type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value) || "")} fullWidth />
        <TextField label="Цена ($)" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value) || "")} fullWidth />

        <FormControl fullWidth>
          <InputLabel>Категория</InputLabel>
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            {data?.map((cat) => (
              <MenuItem key={cat.id} value={cat.ru}>
                {cat.ru}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Тип</InputLabel>
          <Select value={type} onChange={(e) => setType(e.target.value as "food" | "bar")}>
            <MenuItem value="food">Еда</MenuItem>
            <MenuItem value="bar">Бар</MenuItem>
          </Select>
        </FormControl>

        <input type="file" accept="image/*" onChange={handleImageChange} />

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
          <Button disabled={isLoading} onClick={onClose} color="secondary">
            Отмена
          </Button>
          <Button loading={isLoading} variant="contained" color="primary" onClick={handleSave}>
            Добавить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemPopup;