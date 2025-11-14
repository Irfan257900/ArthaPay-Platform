import { useState, useEffect } from "react";

export default function useDarkMode() {
    // Set initial theme based on localStorage or default to 'light'
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

    useEffect(() => {
        const root = window.document.documentElement;
        if(root.classList.contains(theme)){
            return
        }
        root.classList.remove("light","dark");
        root.classList.add(theme);

        // Update localStorage based on theme
        localStorage.setItem("theme", theme);
    }, [theme]);

    // Toggle theme between 'dark' and 'light'
    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
    };

    // Return the current theme and function to toggle theme
    return [theme, toggleTheme];
}