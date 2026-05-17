export interface TerrainConfig {
    seed: number;
    width: number;
    height: number;
    scale: number;
    octave: number;
    persistence: number;
    contrast: number;
    seaLevel: number;
}

export interface ChunkMetadata {
    id: number;
    startY: number;
    endY: number;
    offsetX: number;
    offsetY: number;
}