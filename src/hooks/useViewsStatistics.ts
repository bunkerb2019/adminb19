import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export const useViewsStatistics = () => {
  return useQuery<{ views?: Record<string, number>}>({
    queryKey: ["app-views"],
    queryFn: async () => {
      const viewStatisticsDocRef = doc(db, "statistics", "app-views");
      const appViewsDoc = await getDoc(viewStatisticsDocRef);
      return appViewsDoc.data() ?? {};
    },
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};