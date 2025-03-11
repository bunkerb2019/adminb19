export type Order = {
    id: string;
    name?: string;
    description?: string; // ⬅️ Здесь нужно проверить, что `description: string`, а не `string | undefined`
    weight?: number;
    price?: number;
    category?: string;
    type?: "food" | "bar"; // ⬅️ Тип строго ограничен
    image?: string;
  };