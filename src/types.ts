import { ReactNode } from "react";

export interface Category {
  id: string;
  parentId: string;
  ru: string;
  ro?: string;
  en?: string;
  icon?: string;
}

export interface Order {
  type: ReactNode;
  id: string;
  name: string;
  description: string;
  weight?: number;
  price?: number;
  image?: string;
  category: string;
}

export interface RandomizerConfig {
  id: string;
  name: string;
  slotTitle: string;
  navigation: string;
  categoryIds: string[];
  active: boolean;
}

export interface RandomSettings {
  randomizers: RandomizerConfig[];
  

}