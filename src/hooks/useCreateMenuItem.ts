import { useCallback, useState } from "react";
import { ref, uploadBytes } from "firebase/storage"; // Импортируйте функции из storage
import {
  collection,
  doc,
  DocumentData,
  DocumentReference,
  setDoc,
} from "firebase/firestore";
import { db, storage } from "../firebase/firebaseConfig"; // Импортируйте storage из firebaseConfig
import { Order } from "../types";

type Props = {
  item?: Order;
  onSave?: (item: Order) => void;
};

const useCreateMenuItem = ({ item, onSave }: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  const saveItem = useCallback(
    async (newItem?: Partial<Order>, image?: File | null) => {
      setIsLoading(true);
      let menuDoc: DocumentReference<DocumentData, DocumentData> | undefined;
      if (!item) {
        menuDoc = doc(collection(db, "menu"));
      } else {
        menuDoc = doc(collection(db, "menu"), item.id);
      }

      if (newItem) {
        try {
          let updatedItem = { id: menuDoc.id, ...item };

          updatedItem = { ...updatedItem, ...newItem };

          if (image) {
            // Если есть новое изображение, загружаем его в Storage
            const imagePath = `images/${menuDoc.id}`;
            const storageRef = ref(storage, imagePath);
            await uploadBytes(storageRef, image);
            updatedItem = {
              ...updatedItem,
              image: imagePath, // Обновляем URL изображения
            };
          }

          await setDoc(menuDoc, updatedItem, { merge: true });

          onSave?.(updatedItem);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      }
    },
    [item, onSave]
  );

  return { saveItem, isLoading };
};

export default useCreateMenuItem;
