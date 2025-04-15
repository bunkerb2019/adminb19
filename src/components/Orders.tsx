import { useState } from "react";
import {
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Card,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  SelectChangeEvent,
  Checkbox,
  Box,
  Switch,
  TextField,
  Dialog,
  DialogContent,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import useOrders from "../components/useOrders";
import AddItemPopup from "../components/AddItemPopup";
import EditItemPopup from "../components/EditItemPopup";
import { Order } from "../types";
import OrderList from "./OrderList";
import useCategories from "../modules/categories/useCategories";
import { getDownloadURL, ref } from "firebase/storage";
import { db, storage } from "../firebase/firebaseConfig";
import { useLanguage } from "../contexts/LanguageContext";
import { doc, updateDoc } from "firebase/firestore";

const Orders = () => {
  const {
    filteredOrders,
    categoryFilter,
    setCategoryFilter,
    refreshData,
    deleteOrders,
  } = useOrders();
  const [addPopupOpen, setAddPopupOpen] = useState(false);
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [nameFilter, setNameFilter] = useState("");
  const [priceSort, setPriceSort] = useState<string>("");
  const [imagePopupOpen, setImagePopupOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const itemsPerPage = 10;
  const { getText } = useLanguage();

  // Filter and sort orders with fallback values
  const filteredAndSortedOrders = filteredOrders
    .filter((order) => 
      getText(order.name || '').toLowerCase().includes(nameFilter.toLowerCase())
    )
    .sort((a, b) => {
      const aPrice = a.price || 0;
      const bPrice = b.price || 0;
      const aName = getText(a.name || '');
      const bName = getText(b.name || '');
      
      if (priceSort === "price-asc") return aPrice - bPrice;
      if (priceSort === "price-desc") return bPrice - aPrice;
      if (priceSort === "name-asc") return aName.localeCompare(bName);
      if (priceSort === "name-desc") return bName.localeCompare(aName);
      return 0;
    });

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
    refreshData();
  };

  const { data: categories } = useCategories();

  const dinamicCategory = () => {
    return [
      <MenuItem key="all" value="">
        {getText({
          ru: "Все категории",
          en: "All categories",
          ro: "Toate categoriile",
        })}
      </MenuItem>,
      ...(categories?.map((category) => (
        <MenuItem key={category.id} value={getText(category)}>
          {getText(category)}
        </MenuItem>
      )) || []),
    ];
  };

  const handleCategoryChange = (e: SelectChangeEvent) => {
    setCategoryFilter(e.target.value);
    setSelectedIds([]);
  };

  const handleNameFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameFilter(e.target.value);
    setPage(1);
  };

  const handlePriceSortChange = (e: SelectChangeEvent) => {
    setPriceSort(e.target.value as string);
    setPage(1);
  };

  const handleImageClick = async (imagePath: string) => {
    try {
      const storageRef = ref(storage, imagePath);
      const url = await getDownloadURL(storageRef);
      setCurrentImage(url);
      setImagePopupOpen(true);
    } catch (error) {
      console.error("Error loading image:", error);
    }
  };

  const pageCount = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);
  const paginatedOrders = filteredAndSortedOrders.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newViewMode: "grid" | "list"
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === paginatedOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedOrders.map((order) => order.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length > 0) {
      await deleteOrders(selectedIds);
      setSelectedIds([]);
      refreshData();
    }
  };

  return (
    <Paper sx={{ mt: 4, p: 3 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        {getText({
          ru: "Последние заказы",
          en: "Recent orders",
          ro: "Comenzi recente",
        })}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label={getText({ ru: "Поиск по названию", en: "Search by name", ro: "Căutare după nume" })}
            variant="outlined"
            value={nameFilter}
            onChange={handleNameFilterChange}
          />
        </Grid>
        
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>
              {getText({ ru: "Сортировка", en: "Sort by", ro: "Sortează după" })}
            </InputLabel>
            <Select
              value={priceSort}
              onChange={handlePriceSortChange}
              label={getText({ ru: "Сортировка", en: "Sort by", ro: "Sortează după" })}
            >
              <MenuItem value="">
                {getText({ ru: "Без сортировки", en: "No sorting", ro: "Fără sortare" })}
              </MenuItem>
              <MenuItem value="price-asc">
                {getText({ ru: "Цена (по возрастанию)", en: "Price (low to high)", ro: "Preț (crescător)" })}
              </MenuItem>
              <MenuItem value="price-desc">
                {getText({ ru: "Цена (по убыванию)", en: "Price (high to low)", ro: "Preț (descrescător)" })}
              </MenuItem>
              <MenuItem value="name-asc">
                {getText({ ru: "Название (А-Я)", en: "Name (A-Z)", ro: "Denumire (A-Z)" })}
              </MenuItem>
              <MenuItem value="name-desc">
                {getText({ ru: "Название (Я-А)", en: "Name (Z-A)", ro: "Denumire (Z-A)" })}
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>
              {getText({ ru: "Категория", en: "Category", ro: "Categorie" })}
            </InputLabel>
            <Select
              value={categoryFilter}
              onChange={handleCategoryChange}
              label={getText({
                ru: "Категория",
                en: "Category",
                ro: "Categorie",
              })}
            >
              {dinamicCategory()}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3} textAlign="right">
          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
            {selectedIds.length > 0 && (
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleBulkDelete}
              >
                {getText({
                  ru: `Удалить (${selectedIds.length})`,
                  en: `Delete (${selectedIds.length})`,
                  ro: `Șterge (${selectedIds.length})`,
                })}
              </Button>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={() => setAddPopupOpen(true)}
            >
              {getText({
                ru: "Добавить товар",
                en: "Add item",
                ro: "Adăugați produs",
              })}
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="view mode"
          >
            <ToggleButton value="list" aria-label="list view">
              {getText({ ru: "Список", en: "List", ro: "Lista" })}
            </ToggleButton>
            <ToggleButton value="grid" aria-label="grid view">
              {getText({ ru: "Сетка", en: "Grid", ro: "Grila" })}
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>

      {viewMode === "grid" ? (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 100,
                cursor: "pointer",
              }}
              onClick={() => setAddPopupOpen(true)}
            >
              <IconButton>
                <AddIcon fontSize="large" />
              </IconButton>
            </Card>
          </Grid>

          <OrderList
            orders={paginatedOrders}
            onEdit={handleEdit}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onImageClick={handleImageClick}
          />
        </Grid>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selectedIds.length > 0 &&
                      selectedIds.length < paginatedOrders.length
                    }
                    checked={
                      paginatedOrders.length > 0 &&
                      selectedIds.length === paginatedOrders.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>
                  {getText({ ru: "Название", en: "Name", ro: "Denumire" })}
                </TableCell>
                <TableCell>
                  {getText({
                    ru: "Категория",
                    en: "Category",
                    ro: "Categorie",
                  })}
                </TableCell>
                <TableCell>
                  {getText({ ru: "Фото", en: "Photo", ro: "Fotografie" })}
                </TableCell>
                <TableCell>
                  {getText({ ru: "Цена", en: "Price", ro: "Preț" })}
                </TableCell>
                <TableCell>
                  {getText({ ru: "Вес", en: "Weight", ro: "Greutate" })}
                </TableCell>
                <TableCell>
                  {getText({ ru: "Активен", en: "Active", ro: "Activ" })}
                </TableCell>
                <TableCell>
                  {getText({ ru: "Действия", en: "Actions", ro: "Acțiuni" })}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedOrders.map((order) => (
                <TableRow
                  key={order.id}
                  selected={selectedIds.includes(order.id)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedIds.includes(order.id)}
                      onChange={() => handleSelect(order.id)}
                    />
                  </TableCell>
                  <TableCell>{getText(order.name || '')}</TableCell>
                  <TableCell>{order.category}</TableCell>
                  <TableCell>
                    {order.image && (
                      <IconButton
                        onClick={() => handleImageClick(order.image!)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    )}
                  </TableCell>
                  <TableCell>
                    {order.price || 0} {order.currency || "$"}
                  </TableCell>
                  <TableCell>
                    {order.weight}{" "}
                    {order.weightUnit === "g"
                      ? "g"
                      : order.weightUnit === "ml"
                      ? "ml"
                      : "kg"}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={order.active !== false}
                      onChange={(e) => {
                        const menuDoc = doc(db, "menu", order.id);
                        updateDoc(menuDoc, {
                          active: e.target.checked,
                        });
                      }}
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleEdit(order)}
                    >
                      {getText({
                        ru: "Редактировать",
                        en: "Edit",
                        ro: "Editați",
                      })}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {pageCount > 1 && (
        <Grid container justifyContent="center" sx={{ mt: 3 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, value) => {
              setPage(value);
              setSelectedIds([]);
            }}
            color="primary"
          />
        </Grid>
      )}

      <AddItemPopup
        open={addPopupOpen}
        onClose={() => setAddPopupOpen(false)}
        onAdd={handleAdd}
      />

      {selectedOrder && (
        <EditItemPopup
          open={editPopupOpen}
          onClose={() => setEditPopupOpen(false)}
          item={selectedOrder}
          onSave={handleSave}
          categories={categories?.map((cat) => getText(cat)) || []}
        />
      )}

      <Dialog
        open={imagePopupOpen}
        onClose={() => setImagePopupOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ textAlign: 'center', p: 2 }}>
          <img
            src={currentImage}
            alt="Preview"
            style={{ 
              maxWidth: '100%', 
              maxHeight: '60vh',
              objectFit: 'contain'
            }}
          />
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="contained" 
              onClick={() => setImagePopupOpen(false)}
            >
              {getText({ ru: "Закрыть", en: "Close", ro: "Închide" })}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default Orders;