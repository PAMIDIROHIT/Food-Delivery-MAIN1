import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

const ThemeContextProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Check localStorage for saved preference
        const saved = localStorage.getItem("tomato-theme");
        if (saved) return saved === "dark";
        // Check system preference
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    useEffect(() => {
        // Apply theme to document
        const root = document.documentElement;
        if (isDarkMode) {
            root.classList.add("dark-mode");
            localStorage.setItem("tomato-theme", "dark");
        } else {
            root.classList.remove("dark-mode");
            localStorage.setItem("tomato-theme", "light");
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode((prev) => !prev);
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContextProvider;
