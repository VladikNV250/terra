import type { TerrainConfig } from "../types/terrain";

export const terrainConfigDefault: TerrainConfig = {
    seed: new Date().getTime(),
    width: 4096,
    height: 4096,
    scale: 500,
    contrast: 2.0,
    seaLevel: 110,
    tempScale: 2000,
    moistureScale: 400,
    viewMode: "Biome",
};