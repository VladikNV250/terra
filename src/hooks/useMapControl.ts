import { useState, useEffect, type SubmitEvent } from "react";
import type { ViewMode } from "../types/terrain";
import { terrainConfigDefault } from "../config/terrain";

export const useMapControl = () => {
    const [terrainConfig, setTerrainConfig] = useState({
        ...terrainConfigDefault,
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        const handleResize = () => {
            setTerrainConfig((prev) => ({
                ...prev,
                width: window.innerWidth,
                height: window.innerHeight,
            }));
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const updateConfig = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        setTerrainConfig((prev) => ({
            ...prev,
            seed: Number(formData.get("seed")) || terrainConfigDefault.seed,
            scale: terrainConfigDefault.scale, 
            zoom: Number(formData.get("zoom")) || terrainConfigDefault.zoom,
            contrast:
                Number(formData.get("contrast")) ||
                terrainConfigDefault.contrast,
            seaLevel:
                Number(formData.get("seaLevel")) ||
                terrainConfigDefault.seaLevel,
            tempScale:
                Number(formData.get("tempScale")) ||
                terrainConfigDefault.tempScale,
            moistureScale:
                Number(formData.get("moistureScale")) ||
                terrainConfigDefault.moistureScale,
            viewMode:
                (formData.get("viewMode") as ViewMode) ||
                terrainConfigDefault.viewMode,
        }));
    };

    return {
        terrainConfig,
        updateConfig,
    };
};
