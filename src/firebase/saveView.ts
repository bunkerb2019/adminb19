import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
const db = getFirestore();

export const saveCategoryView = async (categoryId: string) => {
  try {
    await addDoc(collection(db, "views"), {
      categoryId,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Ошибка сохранения просмотра:", error);
  }
};