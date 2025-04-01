import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { RandomizerConfig, RandomSettings } from "../types";

export const useRandomSettings = () => {
  return useQuery<RandomSettings>({
    queryKey: ['randomSettings'],
    queryFn: async () => {
      const docRef = doc(db, "settings", "random");
      const docSnap = await getDoc(docRef);
      
      const defaultSettings = {
        pageTitle: { ru: "Рандомайзер", ro: "Randomizator", en: "Randomizer" },
        pageDescription: { ru: "", ro: "", en: "" },
        randomizers: [] as RandomizerConfig[]
      };

      if (!docSnap.exists()) {
        return defaultSettings;
      }

      const data = docSnap.data();
      
      // Конвертация старого формата
      if (data.categoryIds && !data.randomizers) {
        return {
          ...defaultSettings,
          randomizers: [{
            id: "default",
            slotTitle: { 
              ru: data.name?.ru || "Случайный выбор", 
              ro: data.name?.ro || "Alegere aleatorie", 
              en: data.name?.en || "Random choice" 
            },
            navigation: data.navigation || "1",
            categoryIds: Array.isArray(data.categoryIds) ? data.categoryIds : [],
            active: true
          }]
        };
      }
      
      // Нормализация текущего формата
      return {
        pageTitle: data.pageTitle || defaultSettings.pageTitle,
        pageDescription: data.pageDescription || defaultSettings.pageDescription,
        randomizers: (data.randomizers || []).map((r: Partial<RandomizerConfig>) => ({
          id: r.id || Date.now().toString(),
          slotTitle: {
            ru: r.slotTitle?.ru || r.name?.ru || "Случайный выбор",
            ro: r.slotTitle?.ro || r.name?.ro || r.slotTitle?.ru || "Alegere aleatorie",
            en: r.slotTitle?.en || r.name?.en || r.slotTitle?.ru || "Random choice"
          },
          navigation: r.navigation || "1",
          categoryIds: Array.isArray(r.categoryIds) ? r.categoryIds : [],
          active: r.active !== false
        }))
      };
    },
    staleTime: 60 * 60 * 1000 // 1 hour cache
  });
};