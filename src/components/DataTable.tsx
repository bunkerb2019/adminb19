import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { Order } from "../types"; // ✅ Убедись, что Order импортируется отсюда
import { useLanguage } from "../contexts/LanguageContext";

interface DataTableProps {
  data: Order[];
  onEdit: (order: Order) => void;
}

const DataTable: React.FC<DataTableProps> = ({ data, onEdit }) => {
  const { language } = useLanguage();
  const getLocalizedText = (text?: (typeof data)[number]["name"]) => {
    if (typeof text === "string") return text; // Для обратной совместимости
    return text?.[language] || text?.ru || "";
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Название</TableCell>
          <TableCell>Категория</TableCell>
          <TableCell>Тип</TableCell>
          <TableCell>Цена</TableCell>
          <TableCell>Действия</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((order) => (
          <TableRow key={order.id}>
            <TableCell>{getLocalizedText(order.name)}</TableCell>
            <TableCell>{order.category}</TableCell>
            <TableCell>{order.type}</TableCell>
            <TableCell>{order.price} $</TableCell>
            <TableCell>
              <IconButton onClick={() => onEdit(order)}>
                <EditIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DataTable;
