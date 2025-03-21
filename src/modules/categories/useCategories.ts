import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import queryKeys from "../../utils/queryKeys";
import { getDoc } from "firebase/firestore";
import { getCategoriesDoc } from "../../utils/firebaseDoc";
import { Category } from "../../components/CategoriesPopup";

const useCategories = () => {
  const queryFn = useCallback(async () => {
    const docRef = getCategoriesDoc();
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().list as Category[] ?? [] as Category[];
    }
    return [] as Category[];
  }, []);

  return useQuery({
    queryKey: queryKeys.categories(),
    queryFn,
  });
};

export default useCategories;
        