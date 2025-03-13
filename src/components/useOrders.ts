// useOrders.ts
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { Order } from "../types"; // ✅ Убеждаемся, что используем общий интерфейс Order

const useOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [categoryFilter, setCategoryFilter] = useState<string>("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "menu"));
                const data: Order[] = [];
                querySnapshot.docs.forEach((doc) => data.push(doc.data() as Order));

                setOrders(data);
                setFilteredOrders(data);
            } catch (error) {
                console.error("Ошибка загрузки заказов:", error);
            }
        };

        fetchOrders();
    }, []);

    useEffect(() => {
        let filtered = orders;

        if (categoryFilter) filtered = filtered.filter((order) => order.category === categoryFilter);

        setFilteredOrders(filtered);
    }, [ categoryFilter, orders]);

    return { filteredOrders, categoryFilter, setCategoryFilter };
};

export default useOrders;
