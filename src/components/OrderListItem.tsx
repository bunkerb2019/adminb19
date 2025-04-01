import { Card, CardContent, Grid, Typography } from "@mui/material";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../firebase/firebaseConfig";
import { Order } from "../types";
import { useEffect, useState } from "react";

type Props = {
  order: Order;
  onEdit: (order: Order) => void;
  currentLanguage?: 'ru' | 'ro' | 'en'; // Добавляем параметр языка
};

const OrderListItem = ({ order, onEdit, currentLanguage = 'ru' }: Props) => {
  const [imgUrl, setImgUrl] = useState<string | undefined>();

  useEffect(() => {
    if (imgUrl || !order.image) return;
    const storageRef = ref(storage, order.image);
    getDownloadURL(storageRef).then(setImgUrl);
  }, [imgUrl, order.image]);

  // Функция для получения текста на текущем языке
  const getLocalizedText = (text: string | { ru: string; ro?: string; en?: string }) => {
    if (typeof text === 'string') return text; // Для обратной совместимости
    return text[currentLanguage] || text.ru || '';
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
        }}
        onClick={() => onEdit(order)}
      >
        <CardContent>
          <Typography variant="body1">
            {getLocalizedText(order.name)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {order.category}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Цена: {order.price} $
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Вес: {order.weight} г
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