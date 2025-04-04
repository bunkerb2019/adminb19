import { 
  Card, 
  CardContent, 
  Grid, 
  Typography, 
  Checkbox, 
  Box, 
  Switch,
  FormControlLabel
} from "@mui/material";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../firebase/firebaseConfig";
import { Order } from "../types";
import { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

type Props = {
  order: Order;
  onEdit: (order: Order) => void;
  selected: boolean;
  onSelect: () => void;
  currentLanguage?: "ru" | "ro" | "en";
};

const OrderListItem = ({ 
  order, 
  onEdit, 
  selected, 
  onSelect,
  currentLanguage = "ru" 
}: Props) => {
  const [imgUrl, setImgUrl] = useState<string | undefined>();
  const [isActive, setIsActive] = useState(order.active);

  useEffect(() => {
    if (imgUrl || !order.image) return;
    const storageRef = ref(storage, order.image);
    getDownloadURL(storageRef).then(setImgUrl);
  }, [imgUrl, order.image]);

  const getLocalizedText = (text?: (typeof order)["name"]) => {
    if (typeof text === "string") return text;
    return text?.[currentLanguage] || text?.ru || "";
  };

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.MuiCheckbox-root, .MuiSwitch-root')) {
      return;
    }
    onEdit(order);
  };

  const handleActiveChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newActiveState = e.target.checked;
    setIsActive(newActiveState);
    
    try {
      const menuDoc = doc(db, "menu", order.id);
      await updateDoc(menuDoc, {
        active: newActiveState
      });
    } catch (error) {
      console.error("Error updating active status:", error);
      setIsActive(!newActiveState); // Откатываем состояние при ошибке
    }
  };

  return (
    <Grid item xs={12} sm={6} md={2} key={order.id}>
      <Card
        sx={{
          height: 220,
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          border: "1px solid #6b6969",
          position: 'relative',
          transition: 'opacity 0.3s ease',
        }}
        onClick={handleClick}
      >
        <Box sx={{ 
          position: 'absolute', 
          top: 8, 
          left: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Checkbox
            checked={selected}
            onChange={onSelect}
            onClick={(e) => e.stopPropagation()}
            size="small"
          />
        </Box>

        <Box sx={{ 
          position: 'absolute', 
          top: 8, 
          right: 8,
          display: 'flex',
          alignItems: 'center'
        }}>
          <FormControlLabel
            control={
              <Switch
                checked={isActive}
                onChange={handleActiveChange}
                onClick={(e) => e.stopPropagation()}
                color="primary"
                size="small"
              />
            }
            label=""
            sx={{ m: 0 }}
          />
        </Box>

        <CardContent sx={{ pt: 6 }}>
          <Typography variant="body1">
            {getLocalizedText(order.name)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {order.category}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Цена: {order.price} {order.currency || '$'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Вес: {order.weight} {order.weightUnit || 'г'}
          </Typography>
        </CardContent>

        {imgUrl && (
          <img
            src={imgUrl}
            alt={getLocalizedText(order.name)}
            style={{
              width: "100%",
              height: "100px",
              objectFit: "contain",
              borderBottomLeftRadius: "4px",
              borderBottomRightRadius: "4px",
            }}
          />
        )}
      </Card>
    </Grid>
  );
};

export default OrderListItem;