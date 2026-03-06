"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, translations, Translations } from "./translations";

interface LanguageContextType {
    lang: Language;
    t: Translations;
    setLang: (lang: Language) => void;
    toggle: () => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<Language>("zh");

    // Read from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem("nali_lang") as Language | null;
        if (stored === "en" || stored === "zh") {
            setLangState(stored);
        }
    }, []);

    const setLang = (newLang: Language) => {
        setLangState(newLang);
        localStorage.setItem("nali_lang", newLang);
    };

    const toggle = () => setLang(lang === "zh" ? "en" : "zh");

    const t = translations[lang] as unknown as Translations;

    return (
        <LanguageContext.Provider value={{ lang, t, setLang, toggle }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) {
        // Return a safe default if used outside provider (SSR etc.)
        return {
            lang: "zh" as Language,
            t: translations.zh as unknown as Translations,
            setLang: () => { },
            toggle: () => { },
        };
    }
    return ctx;
}
