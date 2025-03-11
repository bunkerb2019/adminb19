
import React from 'react';

import { Order } from "../types";


import OrderListItem from './OrderListItem';

interface OrderListProps {
    orders: Order[];
    onEdit: (order: Order) => void;
}

const OrderList: React.FC<OrderListProps> = ({ orders, onEdit }) => {
    return (
        <>
            {orders.map((order) => <OrderListItem onEdit={onEdit} key={order.id} order={order}/>)}
        </>
    );
};

export default OrderList;
