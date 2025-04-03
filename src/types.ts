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
    ru?: string;
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



export interface RandomSettings {
  pageTitle: {
    ru: string;
    ro: string;
    en: string;
  };
  pageDescription: {
    ru: string;
    ro: string;
    en: string;
  };
  randomizers: RandomizerConfig[];
}


export interface RandomizerConfig {
  id: string;
  slotTitle: {
    ru: string;
    ro: string;
    en: string;
  };
  name?: { // Добавлено для обратной совместимости
    ru: string;
    ro?: string;
    en?: string;
  };
  navigation: string;
  categoryIds: string[];
  active: boolean;
}