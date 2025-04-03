import { createContext, useContext, useState } from "react";
import { Order } from "../types";

type Language = "ru" | "ro" | "en";

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
  getText: (text: Order["name"]) => string;
}>({
  language: "ru",
  setLanguage: () => {},
  getText: (text) => (typeof text === "string" ? text : text.ru || ""),
});

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [language, setLanguage] = useState<Language>("ru");

  const getText = (text: Order["name"]) => {
    if (typeof text === "string") return text;
    return text[language] || text.ru || "";
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, getText }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
