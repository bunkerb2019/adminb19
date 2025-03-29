// Orders.tsx
import  { useState } from "react";
import { Paper, Typography, FormControl, InputLabel, Select, MenuItem, Button, Grid, Card, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import useOrders from "../components/useOrders";
import AddItemPopup from "../components/AddItemPopup";
import EditItemPopup from "../components/EditItemPopup";
import { Order } from "../types";
import OrderList from "./OrderList"; 
import useCategories from "../modules/categories/useCategories";

const Orders = () => {
    const { filteredOrders, categoryFilter, setCategoryFilter } = useOrders();
    const [addPopupOpen, setAddPopupOpen] = useState(false);
    const [editPopupOpen, setEditPopupOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const handleEdit = (order: Order) => {
        setSelectedOrder(order);
        setEditPopupOpen(true);
    };

    const handleAdd = () => {
        setAddPopupOpen(false);
    };
    const {data: categories} = useCategories()

    const dinamicCategory = () => {
        return categories?.map(category => category.ru).map(element =>
            <MenuItem key={element} value={element}>{element}</MenuItem>
        )
    };

    return (
        <Paper sx={{ mt: 4, p: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
                Последние заказы
            </Typography>

            {/* Фильтры */}
            <Grid container spacing={2} sx={{ mb: 2 }}>

                <Grid item xs={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Категория</InputLabel>
                        <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                            {dinamicCategory()}
                        </Select>
                    </FormControl>
                </Grid>

                {/* Кнопка добавить товар */}
                <Grid item xs={12} md={6} textAlign="right">
                    <Button variant="contained" color="primary" onClick={() => setAddPopupOpen(true)}>
                        Добавить товар
                    </Button>
                </Grid>
            </Grid>

            {/* Карточки заказов */}
            <Grid container spacing={2}>
                {/* Кнопка добавить новую карточку */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 100, cursor: "pointer" }} onClick={() => setAddPopupOpen(true)}>
                        <IconButton>
                            <AddIcon fontSize="large" />
                        </IconButton>
                    </Card>
                </Grid>

                {/* Существующие заказы */}
                <OrderList orders={filteredOrders} onEdit={handleEdit} />
            </Grid>

            {/* Попап для добавления товара */}
            <AddItemPopup open={addPopupOpen} onClose={() => setAddPopupOpen(false)} onAdd={handleAdd} />

            {/* Попап для редактирования товара */}
            {selectedOrder && (
                 <EditItemPopup 
                 open={editPopupOpen} 
                 onClose={() => setEditPopupOpen(false)} 
                 item={selectedOrder} 
                 onSave={() => setEditPopupOpen(false)} 
                 categories={categories?.map(category => category.ru) || []} // Передача категорий
             />
            )}
        </Paper>
    );
};

export default Orders;
