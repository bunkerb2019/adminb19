import { Table, TableHead, TableRow, TableCell, TableBody, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { Order } from "../types"; // ✅ Убедись, что Order импортируется отсюда

interface DataTableProps {
  data: Order[];
  onEdit: (order: Order) => void;
}

const DataTable: React.FC<DataTableProps> = ({ data, onEdit }) => {
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
            <TableCell>{order.name}</TableCell>
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