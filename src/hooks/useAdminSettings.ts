import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export const useAdminSettings = () => {
  return useQuery<{ ownerEmail?: string }>({
    queryKey: ["adminSettings"],
    queryFn: async () => {
      const docRef = doc(db, "settings", "admin");
      const docSnap = await getDoc(docRef);
      return docSnap.data() ?? {};
    },
    staleTime: 60 * 60 * 1000,
  });
};