// utils/language.ts
import { useState } from "react";

type LanguageCode = 'ru' | 'ro' | 'en';

type LocalizedText = {
  ru: string;
  ro?: string;
  en?: string;
};

type TextInput = string | LocalizedText;

interface LanguageHook {
  currentLanguage: LanguageCode;
  getText: (text: TextInput) => string;
  setLanguage?: (language: LanguageCode) => void; // Опционально, если нужно менять язык
}

export const useLanguage = (): LanguageHook => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('ru');
  
  /**
   * Получает текст на текущем языке
   * @param text - Строка или объект с переводами
   * @returns Текст на выбранном языке или русский как fallback
   */
  const getText = (text: TextInput): string => {
    if (typeof text === 'string') {
      return text;
    }
    
    // Проверяем наличие перевода для текущего языка
    const translation = text[currentLanguage];
    
    // Если перевода нет, используем русскую версию
    if (!translation) {
      console.warn(`Missing translation for language: ${currentLanguage}`);
      return text.ru || '';
    }
    
    return translation;
  };

  return { 
    currentLanguage,
    getText,
    setLanguage: setCurrentLanguage // Опционально, если нужно менять язык
  };
};

// Пример использования в компоненте:
/*
import { useLanguage } from './utils/language';

const MyComponent = () => {
  const { currentLanguage, getText } = useLanguage();
  
  const item = {
    name: {
      ru: 'Название',
      en: 'Name',
      ro: 'Denumire'
    },
    description: {
      ru: 'Описание',
      en: 'Description'
    }
  };

  return (
    <div>
      <p>Current language: {currentLanguage}</p>
      <p>Name: {getText(item.name)}</p>
      <p>Description: {getText(item.description)}</p>
    </div>
  );
};
*/