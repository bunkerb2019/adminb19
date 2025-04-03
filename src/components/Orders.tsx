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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import useOrders from "../components/useOrders";
import AddItemPopup from "../components/AddItemPopup";
import EditItemPopup from "../components/EditItemPopup";
import { Order } from "../types";
import OrderList from "./OrderList";
import useCategories from "../modules/categories/useCategories";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../firebase/firebaseConfig";
import { useLanguage } from "../contexts/LanguageContext";

const Orders = () => {
  const { filteredOrders, categoryFilter, setCategoryFilter, refreshData } =
    useOrders();
  const [addPopupOpen, setAddPopupOpen] = useState(false);
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list"); 
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const { getText } = useLanguage();

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
  };

  const pageCount = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
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
        <Grid item xs={6} md={3}>
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

        <Grid item xs={6} md={3}>
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

        <Grid item xs={12} md={6} textAlign="right">
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
            getText={getText}
          />
        </Grid>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
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
                  {getText({ ru: "Действия", en: "Actions", ro: "Acțiuni" })}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{getText(order.name)}</TableCell>
                  <TableCell>{order.category}</TableCell>
                  <TableCell>
                    {order.image && (
                      <IconButton
                        onClick={() => {
                          const storageRef = ref(storage, order.image!);
                          getDownloadURL(storageRef).then((url) => {
                            window.open(url, "_blank");
                          });
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    )}
                  </TableCell>
                  <TableCell>
                    {" "}
                    {order.price} {order.currency || "$"}
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
            onChange={(_, value) => setPage(value)}
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
    </Paper>
  );
};

export default Orders;
