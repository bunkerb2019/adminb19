// Orders.tsx
import { useState } from "react";
import { Paper, Typography, FormControl, InputLabel, Select, MenuItem, Button, Grid, Card, IconButton, ToggleButton, ToggleButtonGroup, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Pagination } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from '@mui/icons-material/Visibility';
import useOrders from "../components/useOrders";
import AddItemPopup from "../components/AddItemPopup";
import EditItemPopup from "../components/EditItemPopup";
import { Order } from "../types";
import OrderList from "./OrderList"; 
import useCategories from "../modules/categories/useCategories";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../firebase/firebaseConfig";

const Orders = () => {
    const { filteredOrders, categoryFilter, setCategoryFilter, refreshData } = useOrders();
    const [addPopupOpen, setAddPopupOpen] = useState(false);
    const [editPopupOpen, setEditPopupOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    const handleEdit = (order: Order) => {
        setSelectedOrder(order);
        setEditPopupOpen(true);
        
    };

    const handleAdd = () => {
        setAddPopupOpen(false);
        refreshData(); 
    };

    const handleSave = () => {
        setEditPopupOpen(false);
        refreshData(); // Обновляем данные после редактирования
    };
    
    const {data: categories} = useCategories()

    const dinamicCategory = () => {
        return [
            <MenuItem key="all" value="">Все категории</MenuItem>,
            ...(categories?.map(category => category.ru).map(element =>
                <MenuItem key={element} value={element}>{element}</MenuItem>
            ) || [])
        ];
    };

    // Pagination calculations
    const pageCount = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    const handleViewModeChange = (
        _event: React.MouseEvent<HTMLElement>,
        newViewMode: 'grid' | 'list',
    ) => {
        if (newViewMode !== null) {
            setViewMode(newViewMode);
        }
    };

    return (
        <Paper sx={{ mt: 4, p: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
                Последние заказы
            </Typography>

            {/* Фильтры и управление */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Категория</InputLabel>
                        <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                            {dinamicCategory()}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={6} md={3}>
                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={handleViewModeChange}
                        aria-label="view mode"
                    >
                        <ToggleButton value="grid" aria-label="grid view">
                            Grid
                        </ToggleButton>
                        <ToggleButton value="list" aria-label="list view">
                            List
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Grid>

                {/* Кнопка добавить товар */}
                <Grid item xs={12} md={6} textAlign="right">
                    <Button variant="contained" color="primary" onClick={() => setAddPopupOpen(true)}>
                        Добавить товар
                    </Button>
                </Grid>
            </Grid>

            {/* Контент в зависимости от выбранного вида */}
            {viewMode === 'grid' ? (
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
                    <OrderList orders={paginatedOrders} onEdit={handleEdit} />
                </Grid>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Название</TableCell>
                                <TableCell>Категория</TableCell>
                                <TableCell>Фото</TableCell>
                                <TableCell>Цена</TableCell>
                                <TableCell>Вес</TableCell>
                                <TableCell>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedOrders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>{order.name}</TableCell>
                                    <TableCell>{order.category}</TableCell>
                                    <TableCell>
                                        {order.image && (
                                            <IconButton onClick={() => {
                                                // Here you can implement a modal to view the image
                                                const storageRef = ref(storage, order.image);
                                                getDownloadURL(storageRef).then(url => {
                                                    window.open(url, '_blank');
                                                });
                                            }}>
                                                <VisibilityIcon />
                                            </IconButton>
                                        )}
                                    </TableCell>
                                    <TableCell>{order.price} $</TableCell>
                                    <TableCell>{order.weight} г</TableCell>
                                    <TableCell>
                                        <Button 
                                            variant="outlined" 
                                            size="small"
                                            onClick={() => handleEdit(order)}
                                        >
                                            Редактировать
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Пагинация */}
            {pageCount > 1 && (
                <Grid container justifyContent="center" sx={{ mt: 3 }}>
                    <Pagination
                        count={pageCount}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        color="primary"
                    />
                </Grid>
            )}

            {/* Попап для добавления товара */}
            <AddItemPopup open={addPopupOpen} onClose={() => setAddPopupOpen(false)} onAdd={handleAdd} />

            {/* Попап для редактирования товара */}
            {selectedOrder && (
                <EditItemPopup 
                open={editPopupOpen} 
                onClose={() => setEditPopupOpen(false)} 
                item={selectedOrder} 
                onSave={handleSave} // Используем новый обработчик
                categories={categories?.map(category => category.ru) || []}
            />
            )}
        </Paper>
    );
};

export default Orders;