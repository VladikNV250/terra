import { useState, type SubmitEvent } from "react";
import type { ViewMode } from "../types/terrain";
import { terrainConfigDefault } from "../config/terrain";

export const useMapControl = () => {
    const [terrainConfig, setTerrainConfig] = useState(terrainConfigDefault);

    const updateConfig = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        setTerrainConfig({
            seed: Number(formData.get("seed")) || terrainConfigDefault.seed,
            width: Number(formData.get("width")) || terrainConfigDefault.width,
            height:
                Number(formData.get("height")) || terrainConfigDefault.height,
            scale: Number(formData.get("scale")) || terrainConfigDefault.scale,
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
        });
    };

    return {
        terrainConfig,
        updateConfig,
    };
};
