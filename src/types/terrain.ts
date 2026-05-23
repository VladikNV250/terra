export type ViewMode = "Biome" | "Height" | "Temperature" | "Moisture";

export interface TerrainConfig {
    seed: number;
    width: number;
    height: number;
    scale: number;
    contrast: number;
    seaLevel: number;
    tempScale: number;
    moistureScale: number;
    viewMode: ViewMode;
}

export interface ChunkMetadata {
    id: number;
    startY: number;
    endY: number;
    offsetX: number;
    offsetY: number;
}