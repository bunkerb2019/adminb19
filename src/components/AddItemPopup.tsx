import { useState } from "react";
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
  Tabs,
  Tab,
  Box,
} from "@mui/material";
import { Order } from "../types";
import useCreateMenuItem from "../hooks/useCreateMenuItem";
import useCategories from "../modules/categories/useCategories";
import { ImageUploadInput } from "./ImageUploadInput.tsx";

interface AddItemPopupProps {
  open: boolean;
  onClose: () => void;
  onAdd: (newItem: Order) => void;
}

const AddItemPopup: React.FC<AddItemPopupProps> = ({
  open,
  onClose,
  onAdd,
}) => {
  const [nameRu, setNameRu] = useState("");
  const [nameRo, setNameRo] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [descriptionRu, setDescriptionRu] = useState("");
  const [descriptionRo, setDescriptionRo] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [weight, setWeight] = useState<number | string>("");
  const [price, setPrice] = useState<number | string>("");
  const [category, setCategory] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [currentTab, setCurrentTab] = useState(0);

  const resetPopupState = () => {
    setNameRu("");
    setNameRo("");
    setNameEn("");
    setDescriptionRu("");
    setDescriptionRo("");
    setDescriptionEn("");
    setWeight("");
    setPrice("");
    setCategory("");
    setImage(null);
  };

  const { saveItem, isLoading } = useCreateMenuItem({ onSave: onAdd });
  const [weightUnit, setWeightUnit] = useState<"g" | "ml" | "kg">("g");
  const [currency, setCurrency] = useState<"MDL" | "$" | "€">("$");

  const handleSave = async () => {
    const newItem: Partial<Order> = {
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
      weightUnit, // Add this
      price: Number(price),
      currency, // Add this
      category,
      active: true,
    };
    saveItem(newItem, image ?? null);
    resetPopupState();
  };

  const { data } = useCategories();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Добавить товар</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}
      >
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
        >
          <Tab label="Русский" />
          <Tab label="Română" />
          <Tab label="English" />
        </Tabs>

        <Box sx={{ display: currentTab === 0 ? "block" : "none" }}>
          <TextField
            label="Название (Русский)"
            value={nameRu}
            onChange={(e) => setNameRu(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Описание (Русский)"
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
          <InputLabel>Категория</InputLabel>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {data?.map((cat) => (
              <MenuItem key={cat.id} value={cat.ru}>
                {cat.ru}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <ImageUploadInput setImage={setImage} image={image} />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 16,
          }}
        >
          <Button disabled={isLoading} onClick={onClose} color="secondary">
            Отмена
          </Button>
          <Button
            disabled={isLoading}
            variant="contained"
            color="primary"
            onClick={handleSave}
          >
            Добавить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemPopup;
