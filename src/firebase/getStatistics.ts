import {
  collection,
  getDocs,
  query,
  where,
  getDoc,
  doc,
  orderBy
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

type Product = {
  id: string;
  name: string;
  image?: string;
  views?: number;
  category?: string;
};

type Category = {
  id: string;
  name: string;
  icon?: string;
};

export const getStatistics = async () => {
  const [productsSnap, categoriesSnap] = await Promise.all([
    getDocs(collection(db, "menu")),
    getDoc(doc(db, "settings", "categories"))
  ]);

  const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  const totalProducts = products.length;
  const productsWithoutImage = products.filter(p => !p.image).length;

  let totalCategories = 0;
  if (categoriesSnap.exists()) {
    const data = categoriesSnap.data();
    const list = (data?.list ?? []) as Category[];
    totalCategories = list.length;
  }

  // Get popular products
  const popularProducts = [...products]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 6)
    .map(p => ({ name: p.name, views: p.views || 0 }));

  // Calculate conversion rate (example logic)
  const conversionRate = products.length > 0 
  ? Math.round((products.filter(p => p.views && p.views > 10).length / products.length) * 100)
  : 0;

return {
  totalProducts,
  productsWithoutImage,
  totalCategories,
  popularProducts,
  conversionRate
};
};

export const getViewsStats = async (
  month: number,
  year: number,
  viewType: "day" | "week" | "month" | "year"
) => {
  const now = new Date();
  let start: Date;
  let end: Date;

  switch (viewType) {
    case "day":
      start = new Date(year, month - 1, now.getDate());
      end = new Date(year, month - 1, now.getDate() + 1);
      break;
    case "week":
      { const today = new Date(year, month - 1, now.getDate());
      const day = today.getDay();
      const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(year, month - 1, diffToMonday);
      end = new Date(year, month - 1, diffToMonday + 7);
      break; }
    case "month":
      start = new Date(year, month - 1, 1);
      end = new Date(year, month, 1);
      break;
    case "year":
      start = new Date(year, 0, 1);
      end = new Date(year + 1, 0, 1);
      break;
    default:
      throw new Error("Invalid viewType");
  }

  const q = query(
    collection(db, "views"),
    where("createdAt", ">=", start),
    where("createdAt", "<", end)
  );

  const snap = await getDocs(q);
  const stats: Record<string, number> = {};

  snap.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.categoryId) {
      stats[data.categoryId] = (stats[data.categoryId] || 0) + 1;
    }
  });

  return stats;
};

export const getProductStats = async (month: number, year: number) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const q = query(
    collection(db, "productViews"),
    where("date", ">=", start),
    where("date", "<", end),
    orderBy("date")
  );

  const snap = await getDocs(q);
  const stats: {date: string; views: number}[] = [];

  snap.forEach(docSnap => {
    const data = docSnap.data();
    if (data.date && data.views) {
      stats.push({
        date: data.date.toDate().toLocaleDateString(),
        views: data.views
      });
    }
  });

  return stats;
};