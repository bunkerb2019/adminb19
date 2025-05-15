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
  useMediaQuery,
  useTheme,
  Chip,
  keyframes,
  styled,
  Drawer,
  Divider,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Category as CategoryIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
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

// Анимация для кнопок (полностью сохранена)
const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(25, 118, 210, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
  }
`;

// Стилизованная кнопка "Добавить" (полностью сохранена)
const AddButton = styled(Button)(() => ({
  background: "linear-gradient(45deg, #1976d2 30%, #2196f3 90%)",
  color: "white",
  fontWeight: 600,
  borderRadius: 8,
  padding: "8px 16px",
  boxShadow: "0 3px 5px rgba(25, 118, 210, 0.2)",
  transition: "all 0.3s ease",
  animation: `${pulseAnimation} 2s infinite`,
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 5px 15px rgba(25, 118, 210, 0.4)",
    background: "linear-gradient(45deg, #1976d2 20%, #2196f3 80%)",
  },
  "&:active": {
    transform: "translateY(0)",
  },
  "& .MuiButton-startIcon": {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: "50%",
    padding: 4,
    marginRight: 8,
    transition: "all 0.3s ease",
  },
  "&:hover .MuiButton-startIcon": {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    transform: "rotate(90deg)",
  },
}));

// Стилизованная кнопка "Удалить" (полностью сохранена)
const DeleteButton = styled(Button)(() => ({
  background: "linear-gradient(45deg, #ff5252 30%, #ff867f 90%)",
  color: "white",
  fontWeight: 600,
  borderRadius: 8,
  padding: "8px 16px",
  boxShadow: "0 3px 5px rgba(255, 82, 82, 0.2)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 5px 15px rgba(255, 82, 82, 0.4)",
    background: "linear-gradient(45deg, #ff5252 20%, #ff867f 80%)",
  },
  "&:active": {
    transform: "translateY(0)",
  },
  "& .MuiButton-startIcon": {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: "50%",
    padding: 4,
    marginRight: 8,
    transition: "all 0.3s ease",
  },
  "&:hover .MuiButton-startIcon": {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    transform: "scale(1.1)",
  },
}));

const Orders = () => {
  // Все хуки состояния полностью сохранены
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Добавлен только этот хук для определения мобильных устройств
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const itemsPerPage = isMobile ? 5 : 10;
  const { getText } = useLanguage();

  // Фильтрация и сортировка (полностью сохранена)
  const filteredAndSortedOrders = filteredOrders
    .filter((order) =>
      getText(order.name || "")
        .toLowerCase()
        .includes(nameFilter.toLowerCase())
    )
    .sort((a, b) => {
      const aPrice = a.price || 0;
      const bPrice = b.price || 0;
      const aName = getText(a.name || "");
      const bName = getText(b.name || "");

      if (priceSort === "price-asc") return aPrice - bPrice;
      if (priceSort === "price-desc") return bPrice - aPrice;
      if (priceSort === "name-asc") return aName.localeCompare(bName);
      if (priceSort === "name-desc") return bName.localeCompare(aName);
      return 0;
    });

  const pageCount = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);
  const paginatedOrders = filteredAndSortedOrders.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Все обработчики полностью сохранены
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

  // Добавлен только этот компонент для мобильных фильтров
  const renderMobileFilters = () => (
    <Drawer
      anchor="bottom"
      open={mobileFiltersOpen}
      onClose={() => setMobileFiltersOpen(false)}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          px: 2,
          pt: 1,
          pb: 2,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="h6" component="h2">
          {getText({ ru: "Фильтры", en: "Filters", ro: "Filtre" })}
        </Typography>
        <IconButton onClick={() => setMobileFiltersOpen(false)}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={getText({
              ru: "Поиск по названию",
              en: "Search by name",
              ro: "Căutare după nume",
            })}
            variant="outlined"
            value={nameFilter}
            onChange={handleNameFilterChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>
              {getText({
                ru: "Сортировка",
                en: "Sort by",
                ro: "Sortează după",
              })}
            </InputLabel>
            <Select
              value={priceSort}
              onChange={handlePriceSortChange}
              label={getText({
                ru: "Сортировка",
                en: "Sort by",
                ro: "Sortează după",
              })}
              startAdornment={
                <SortIcon sx={{ mr: 1, color: "action.active" }} />
              }
            >
              <MenuItem value="">
                {getText({
                  ru: "Без сортировки",
                  en: "No sorting",
                  ro: "Fără sortare",
                })}
              </MenuItem>
              <MenuItem value="price-asc">
                {getText({
                  ru: "Цена (по возрастанию)",
                  en: "Price (low to high)",
                  ro: "Preț (crescător)",
                })}
              </MenuItem>
              <MenuItem value="price-desc">
                {getText({
                  ru: "Цена (по убыванию)",
                  en: "Price (high to low)",
                  ro: "Preț (descrescător)",
                })}
              </MenuItem>
              <MenuItem value="name-asc">
                {getText({
                  ru: "Название (А-Я)",
                  en: "Name (A-Z)",
                  ro: "Denumire (A-Z)",
                })}
              </MenuItem>
              <MenuItem value="name-desc">
                {getText({
                  ru: "Название (Я-А)",
                  en: "Name (Z-A)",
                  ro: "Denumire (Z-A)",
                })}
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
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
              startAdornment={
                <CategoryIcon sx={{ mr: 1, color: "action.active" }} />
              }
            >
              {dinamicCategory()}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Drawer>
  );

  return (
    <Paper
      sx={{
        mt: 4,
        p: isMobile ? 2 : 3,
        borderRadius: 2,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        background: theme.palette.background.paper,
        width: "100%",
        overflowX: "auto",
        boxSizing: "border-box",
      }}
    >
      {/* Заголовок и кнопки управления - полностью сохранены, только добавлены условия isMobile */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 2 : 0,
        }}
      >
        <Typography variant="h6" component="h2" fontWeight={600}>
          {getText({
            ru: "Последние заказы",
            en: "Recent orders",
            ro: "Comenzi recente",
          })}
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="view mode"
            size={isMobile ? "small" : "medium"}
          >
            <ToggleButton value="list" aria-label="list view">
              {getText({ ru: "Список", en: "List", ro: "Lista" })}
            </ToggleButton>
            <ToggleButton value="grid" aria-label="grid view">
              {getText({ ru: "Сетка", en: "Grid", ro: "Grila" })}
            </ToggleButton>
          </ToggleButtonGroup>

          {isMobile && (
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setMobileFiltersOpen(true)}
              size={isMobile ? "small" : "medium"}
              sx={{
                fontWeight: 500,
                borderRadius: 2,
                borderWidth: 2,
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                "&:hover": {
                  borderWidth: 2,
                  borderColor: theme.palette.primary.dark,
                  background: "rgba(25, 118, 210, 0.04)",
                },
              }}
            >
              {getText({ ru: "Фильтры", en: "Filters", ro: "Filtre" })}
            </Button>
          )}
        </Box>
      </Box>

      {/* Фильтры для десктопа - полностью сохранены */}
      {!isMobile && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label={getText({
                ru: "Поиск по названию",
                en: "Search by name",
                ro: "Căutare după nume",
              })}
              variant="outlined"
              value={nameFilter}
              onChange={handleNameFilterChange}
              size="medium"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>
                {getText({
                  ru: "Сортировка",
                  en: "Sort by",
                  ro: "Sortează după",
                })}
              </InputLabel>
              <Select
                value={priceSort}
                onChange={handlePriceSortChange}
                label={getText({
                  ru: "Сортировка",
                  en: "Sort by",
                  ro: "Sortează după",
                })}
                size="medium"
                startAdornment={
                  <SortIcon sx={{ mr: 1, color: "action.active" }} />
                }
              >
                <MenuItem value="">
                  {getText({
                    ru: "Без сортировки",
                    en: "No sorting",
                    ro: "Fără sortare",
                  })}
                </MenuItem>
                <MenuItem value="price-asc">
                  {getText({
                    ru: "Цена (по возрастанию)",
                    en: "Price (low to high)",
                    ro: "Preț (crescător)",
                  })}
                </MenuItem>
                <MenuItem value="price-desc">
                  {getText({
                    ru: "Цена (по убыванию)",
                    en: "Price (high to low)",
                    ro: "Preț (descrescător)",
                  })}
                </MenuItem>
                <MenuItem value="name-asc">
                  {getText({
                    ru: "Название (А-Я)",
                    en: "Name (A-Z)",
                    ro: "Denumire (A-Z)",
                  })}
                </MenuItem>
                <MenuItem value="name-desc">
                  {getText({
                    ru: "Название (Я-А)",
                    en: "Name (Z-A)",
                    ro: "Denumire (Z-A)",
                  })}
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
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
                size="medium"
                startAdornment={
                  <CategoryIcon sx={{ mr: 1, color: "action.active" }} />
                }
              >
                {dinamicCategory()}
              </Select>
            </FormControl>
          </Grid>

          <Grid
            item
            xs={12}
            sm={6}
            md={3}
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 1,
            }}
          >
            {selectedIds.length > 0 && (
              <DeleteButton
                variant="contained"
                startIcon={<DeleteIcon />}
                onClick={handleBulkDelete}
                size="medium"
                sx={{ mr: "auto" }}
              >
                {getText({
                  ru: `Удалить (${selectedIds.length})`,
                  en: `Delete (${selectedIds.length})`,
                  ro: `Șterge (${selectedIds.length})`,
                })}
              </DeleteButton>
            )}
            <AddButton
              variant="contained"
              onClick={() => setAddPopupOpen(true)}
              size="medium"
              sx={{ ml: "auto" }}
              startIcon={<AddIcon />}
            >
              {getText({
                ru: "Добавить товар",
                en: "Add item",
                ro: "Adăugați produs",
              })}
            </AddButton>
          </Grid>
        </Grid>
      )}

      {/* Мобильные фильтры - добавлен этот блок */}
      {renderMobileFilters()}

      {/* Контент - полностью сохранен, только добавлены условия isMobile */}
      {viewMode === "grid" ? (
  <Grid container spacing={2}>
    <OrderList
      orders={paginatedOrders}
      onEdit={handleEdit}
      selectedIds={selectedIds}
      onSelect={handleSelect}
      onImageClick={handleImageClick}
      isMobile={isMobile}
    />
  </Grid>
) : (
  <TableContainer
    component={Paper}
    sx={{
      borderRadius: 2,
      boxShadow: "none",
      width: "100%",
      overflowX: "auto",
    }}
  >
    <Table
      sx={{
        minWidth: isMobile ? 300 : "100%",
        "& .MuiTableCell-root": {
          padding: isMobile ? "8px 4px" : "16px",
          fontSize: isMobile ? "0.75rem" : "0.875rem",
        },
      }}
    >
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox" sx={{ pl: isMobile ? 1 : 2 }}>
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
              size={isMobile ? "small" : "medium"}
            />
          </TableCell>
          {isMobile ? (
            <>
              <TableCell>
                {getText({ ru: "Название", en: "Name", ro: "Denumire" })}
              </TableCell>
              <TableCell>
                {getText({ ru: "Цена", en: "Price", ro: "Preț" })}
              </TableCell>
              <TableCell>
                {getText({ ru: "Активен", en: "Active", ro: "Activ" })}
              </TableCell>
            </>
          ) : (
            <>
              <TableCell>
                {getText({ ru: "Название", en: "Name", ro: "Denumire" })}
              </TableCell>
              <TableCell>
                {getText({ ru: "Категория", en: "Category", ro: "Categorie" })}
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
            </>
          )}
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
            hover
          >
            <TableCell padding="checkbox" sx={{ pl: isMobile ? 1 : 2 }}>
              <Checkbox
                checked={selectedIds.includes(order.id)}
                onChange={() => handleSelect(order.id)}
                size={isMobile ? "small" : "medium"}
              />
            </TableCell>
            
            {isMobile ? (
              <>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {order.image && (
                      <IconButton
                        onClick={() => handleImageClick(order.image!)}
                        size="small"
                        sx={{
                          p: 0,
                          "&:hover": {
                            color: theme.palette.primary.main,
                          },
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    )}
                    <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                      {getText(order.name || "")}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {order.price || 0} {order.currency || "$"}
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
              </>
            ) : (
              <>
                <TableCell>{getText(order.name || "")}</TableCell>
                <TableCell>
                  <Chip
                    label={order.category}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  {order.image && (
                    <IconButton
                      onClick={() => handleImageClick(order.image!)}
                      size="small"
                      sx={{
                        "&:hover": {
                          color: theme.palette.primary.main,
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      <VisibilityIcon fontSize="small" />
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
                    size="medium"
                  />
                </TableCell>
              </>
            )}
            
            <TableCell>
              <IconButton
                onClick={() => handleEdit(order)}
                size={isMobile ? "small" : "medium"}
                sx={{
                  color: theme.palette.primary.main,
                  "&:hover": {
                    backgroundColor: "rgba(25, 118, 210, 0.08)",
                  },
                }}
              >
                <EditIcon fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
      )}

      {/* Пагинация - полностью сохранена, только добавлены условия isMobile */}
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
            size={isMobile ? "small" : "medium"}
            sx={{
              "& .MuiPaginationItem-root": {
                fontSize: isMobile ? "0.75rem" : "0.875rem",
              },
            }}
          />
        </Grid>
      )}

      {/* Попапы - полностью сохранены */}
      <AddItemPopup
        open={addPopupOpen}
        onClose={() => setAddPopupOpen(false)}
        onAdd={handleAdd}
        isMobile={isMobile}
      />

      {selectedOrder && (
        <EditItemPopup
          open={editPopupOpen}
          onClose={() => setEditPopupOpen(false)}
          item={selectedOrder}
          onSave={handleSave}
          categories={categories?.map((cat) => getText(cat)) || []}
          isMobile={isMobile}
        />
      )}

      <Dialog
        open={imagePopupOpen}
        onClose={() => setImagePopupOpen(false)}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ textAlign: "center", p: isMobile ? 1 : 2 }}>
          <img
            src={currentImage}
            alt="Preview"
            style={{
              maxWidth: "100%",
              maxHeight: isMobile ? "80vh" : "60vh",
              objectFit: "contain",
              borderRadius: 8,
            }}
          />
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={() => setImagePopupOpen(false)}
              size={isMobile ? "small" : "medium"}
              fullWidth={isMobile}
              sx={{
                background: "linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)",
                color: "white",
                fontWeight: 600,
                borderRadius: 8,
                padding: "8px 16px",
                maxWidth: isMobile ? "100%" : 200,
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #4caf50 20%, #66bb6a 80%)",
                },
              }}
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
