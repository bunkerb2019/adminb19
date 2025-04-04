import { useState, useEffect } from "react";
import { collection, deleteDoc, doc, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { Order } from "../types";

const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "menu"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items: Order[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Order);
      });
      setOrders(items);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (categoryFilter) {
      setFilteredOrders(
        orders.filter((order) => order.category === categoryFilter)
      );
    } else {
      setFilteredOrders([...orders]);
    }
  }, [categoryFilter, orders]);

  const refreshData = () => {
    setIsLoading(true);
    // Данные обновятся автоматически через onSnapshot
  };

  const deleteOrders = async (ids: string[]) => {
    // Реализация удаления нескольких заказов
    // Например, для Firebase:
    await Promise.all(ids.map(id => deleteDoc(doc(db, "menu", id))));
  };

  return {
    orders,
    filteredOrders,
    categoryFilter,
    setCategoryFilter,
    refreshData,
    isLoading,
    deleteOrders
  };
};

export default useOrders;