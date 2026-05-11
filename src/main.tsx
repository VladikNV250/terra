import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "@radix-ui/themes/styles.css";
import App from "./app/App.tsx";
import { Theme } from "@radix-ui/themes";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Theme appearance="dark">
            <App />
        </Theme>
    </StrictMode>,
);
