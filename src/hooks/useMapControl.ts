import { useState, type SubmitEvent } from "react";
import type { TerrainConfig } from "../types/terrain";

const terrainConfigDefault: TerrainConfig = {
    seed: new Date().getTime(),
    width: 1024,
    height: 1024,
    scale: 200,
    octave: 6,
    persistence: 0.5,
    amplitude: 3.5,
    seaLevel: 110,
};

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
            octave:
                Number(formData.get("octave")) || terrainConfigDefault.octave,
            persistence:
                Number(formData.get("persistence")) ||
                terrainConfigDefault.persistence,
            amplitude:
                Number(formData.get("amplitude")) ||
                terrainConfigDefault.amplitude,
            seaLevel:
                Number(formData.get("seaLevel")) ||
                terrainConfigDefault.seaLevel,
        });
    };

    return {
        terrainConfig,
        updateConfig,
    };
}