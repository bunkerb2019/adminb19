import {useEffect, useState} from "react";
import {collection, getDocs, doc, getDoc} from "firebase/firestore";
import {db} from "../firebase/firebaseConfig";
import StatisticsOverview from "../components/Statistics/StatisticsOverview"; // убедись, что импорт есть!
import {useAppViewsContext} from "../contexts/AppViewsContext.tsx";


const Home = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    productsWithoutImage: 0,
    conversionRate: 0,
    views: [{name: '', value: 0}],
  });

  const {filteredAndSortedData} = useAppViewsContext();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const productsSnapshot = await getDocs(collection(db, "menu"));
        const products = productsSnapshot.docs.map((doc) => doc.data());

        const categoriesDocRef = doc(db, "settings", "categories");
        const categoriesDoc = await getDoc(categoriesDocRef);

        let categoriesList = [];
        if (categoriesDoc.exists()) {
          const data = categoriesDoc.data();
          categoriesList = data.list || [];
        }

        setStats({
          totalProducts: products.length,
          totalCategories: categoriesList.length,
          productsWithoutImage: products.filter((p) => !p.image).length,
          conversionRate: 5,
          views: filteredAndSortedData,
        });
      } catch (error) {
        console.error("Ошибка при получении статистики:", error);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    setStats({...stats, views: filteredAndSortedData});
  }, [filteredAndSortedData]);

  return (
    <div>
      <StatisticsOverview stats={stats}/>
    </div>
  );
};

export default Home;