import { 
  Card, 
  CardContent, 
  Grid, 
  Typography, 
  Checkbox, 
  Box, 
  Switch,
  FormControlLabel,
  IconButton
} from "@mui/material";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../firebase/firebaseConfig";
import { Order } from "../types";
import { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useLanguage } from "../contexts/LanguageContext";

type Props = {
  order: Order;
  onEdit: (order: Order) => void;
  selected: boolean;
  onSelect: () => void;
  onImageClick?: (imagePath: string) => Promise<void>;
  
};

const OrderListItem = ({ 
  order, 
  onEdit, 
  selected, 
  onSelect,
  onImageClick
}: Props) => {
  const [imgUrl, setImgUrl] = useState<string | undefined>();
  const [isActive, setIsActive] = useState(order.active);
  const { getText } = useLanguage();

  useEffect(() => {
    if (imgUrl || !order.image) return;
    const storageRef = ref(storage, order.image);
    getDownloadURL(storageRef).then(setImgUrl);
  }, [imgUrl, order.image]);

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.MuiCheckbox-root, .MuiSwitch-root, .MuiIconButton-root')) {
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
      setIsActive(!newActiveState);
    }
  };

  const handleImagePreview = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (order.image && onImageClick) {
      await onImageClick(order.image);
    }
  };

  return (
    <Grid item xs={12} sm={6} md={3} key={order.id}>
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
                checked={isActive !== false}
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
            {getText(order.name || '')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {order.category}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {getText({ ru: "Цена", en: "Price", ro: "Preț" })}: {order.price || 0} {order.currency || '$'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {getText({ ru: "Вес", en: "Weight", ro: "Greutate" })}: {order.weight || ''} {order.weightUnit || 'г'}
          </Typography>
        </CardContent>

        {imgUrl && (
          <Box sx={{ position: 'relative' }}>
            <img
              src={imgUrl}
              alt={getText(order.name || '')}
              style={{
                width: "100%",
                height: "100px",
                objectFit: "contain",
                borderBottomLeftRadius: "4px",
                borderBottomRightRadius: "4px",
              }}
            />
            {onImageClick && (
              <IconButton
                size="small"
                onClick={handleImagePreview}
                sx={{
                  position: 'absolute',
                  bottom: 4,
                  right: 4,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.7)'
                  }
                }}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        )}
      </Card>
    </Grid>
  );
};

export default OrderListItem;