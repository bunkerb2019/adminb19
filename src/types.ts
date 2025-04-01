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
  id: string;
  name: {
    ru: string;
    ro?: string;
    en?: string;
  };
  description: {
    ru: string;
    ro?: string;
    en?: string;
  };
  weight?: number;
  weightUnit?: 'g' | 'ml' | 'kg'; // Add this line
  price?: number;
  currency?: 'MDL' | '$' | '€'; // Add this line
  image?: string;
  category: string;
  type?: ReactNode;
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