
import { Card, CardContent, Grid, Typography } from '@mui/material';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../firebase/firebaseConfig';
import { Order } from '../types';
import { useEffect, useState } from 'react';

type Props = {
    order: Order
    onEdit: (order: Order) => void;
}

const OrderListItem = ({order, onEdit}: Props) => {

    const [imgUrl, setImgUrl] = useState<string | undefined>()

  useEffect(() => {
    if (imgUrl) return;
    const storageRef = ref(storage, order.image);
    getDownloadURL(storageRef).then(setImgUrl)
  },[])

    return (
    <Grid item xs={12} sm={6} md={3} key={order.id}>
        <Card sx={{ height: 220, cursor: "pointer", display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #6b6969'}} onClick={() => onEdit(order)}>
            <CardContent>
                <Typography variant="body1">{order.name}</Typography>
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
                    alt={order.name}
                    style={{
                        width: '100%',
                        height: '100px', // Фиксированная высота
                        objectFit: 'contain', // Масштабирует изображение, сохраняя пропорции
                        borderBottomLeftRadius: '4px', // Добавляем радиус снизу слева
                        borderBottomRightRadius: '4px', // Добавляем радиус снизу справа
                    }}
                />
            )}
        </Card>
    </Grid>)
}

export default OrderListItem