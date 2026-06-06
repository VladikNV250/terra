import { MapMediator, ErrorFallback } from "../components";
import { Theme } from "@radix-ui/themes";
import { ErrorBoundary } from "react-error-boundary";
import { useSystemTheme } from "../hooks/useSystemTheme";

function App() {
    const theme = useSystemTheme();

    return (
        <Theme appearance={theme} accentColor="gray" radius="large">
            <ErrorBoundary FallbackComponent={ErrorFallback}>
                <main className="bg-(--gray) min-w-screen h-dvh w-full relative">
                    <MapMediator />
                </main>
            </ErrorBoundary>
        </Theme>
    );
}

export default App;
