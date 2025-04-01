import React from "react";
import { Order } from "../types";
import OrderListItem from "./OrderListItem";

interface OrderListProps {
  orders: Order[];
  onEdit: (order: Order) => void;
  getText: (text: string | { ru: string; ro?: string; en?: string }) => string;
}

const OrderList: React.FC<OrderListProps> = ({ orders, onEdit, getText }) => {
  return (
    <>
      {orders.map((order) => (
        <OrderListItem
          key={order.id}
          order={order}
          onEdit={onEdit}
          getText={getText}
        />
      ))}
    </>
  );
};

export default OrderList;