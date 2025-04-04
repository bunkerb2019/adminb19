import React from "react";
import { Order } from "../types";
import OrderListItem from "./OrderListItem";

interface OrderListProps {
  orders: Order[];
  onEdit: (order: Order) => void;
  selectedIds: string[];
  onSelect: (id: string) => void;
}

const OrderList: React.FC<OrderListProps> = ({ 
  orders, 
  onEdit, 
  selectedIds,
  onSelect 
}) => {
  return (
    <>
      {orders.map((order) => (
        <OrderListItem 
          key={order.id} 
          order={order} 
          onEdit={onEdit}
          selected={selectedIds.includes(order.id)}
          onSelect={() => onSelect(order.id)}
        />
      ))}
    </>
  );
};

export default OrderList;