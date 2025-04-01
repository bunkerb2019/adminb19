import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { RandomSettings } from "../types";

export const useRandomSettings = () => {
  return useQuery<RandomSettings>({
    queryKey: ['randomSettings'],
    queryFn: async () => {
      const docRef = doc(db, "settings", "random");
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return {
          pageTitle: { ru: "Рандомайзер", ro: "Randomizator", en: "Randomizer" },
          pageDescription: { ru: "", ro: "", en: "" },
          randomizers: []
        };
      }

      const data = docSnap.data();
      
      // Конвертация старого формата
      if (data.categoryIds && !data.randomizers) {
        return {
          pageTitle: { ru: "Рандомайзер", ro: "Randomizator", en: "Randomizer" },
          pageDescription: { ru: "", ro: "", en: "" },
          randomizers: [{
            id: "default",
            name: { ru: "Случайный выбор", ro: "Alegere aleatorie", en: "Random choice" },
            slotTitle: { ru: "Случайный выбор", ro: "Alegere aleatorie", en: "Random choice" },
            navigation: data.navigation || "1",
            categoryIds: Array.isArray(data.categoryIds) ? data.categoryIds : [],
            active: true
          }]
        };
      }
      
      return {
        pageTitle: data.pageTitle || { ru: "Рандомайзер", ro: "Randomizator", en: "Randomizer" },
        pageDescription: data.pageDescription || { ru: "", ro: "", en: "" },
        randomizers: data.randomizers || []
      };
    },
    staleTime: 60 * 60 * 1000 // 1 hour cache
  });
};