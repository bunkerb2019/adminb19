import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { RandomSettings } from "../types";

// Основное изменение - добавлен правильный экспорт
 const useRandomSettings = () => {
  return useQuery<RandomSettings>({
    queryKey: ['randomSettings'],
    queryFn: async () => {
      const docRef = doc(db, "settings", "random");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Конвертация старого формата
        if (data.categoryIds && !data.randomizers) {
          return {
            randomizers: [{
              id: "default",
              name: "Default Randomizer",
              slotTitle: "Randomizer",
              navigation: data.navigation || "1",
              categoryIds: data.categoryIds || [],
              active: true
              
            }]
          };
        }
        
        return data as RandomSettings;
      }
      
      return {
        randomizers: []
      };
    },
  });
};

// Убедитесь, что нет дублирующего экспорта default
export default useRandomSettings;