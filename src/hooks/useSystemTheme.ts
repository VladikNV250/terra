import { useState, useEffect } from "react";

export const useSystemTheme = () => {
    const [theme, setTheme] = useState<"light" | "dark">(
        window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    );

    useEffect(() => {
        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const listener = (e: MediaQueryListEvent) => setTheme(e.matches ? "dark" : "light");
        
        media.addEventListener("change", listener);
        return () => media.removeEventListener("change", listener);
    }, []);

    return theme;
};
