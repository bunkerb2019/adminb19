import { doc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export const getCategoriesDoc = () => {
    return doc(db, "settings", "categories")
  };

  export const getNavigationDoc = () => {
    return doc(db, "settings", "navigation")
  };    