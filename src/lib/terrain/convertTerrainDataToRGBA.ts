import type { TerrainConfig } from "../../types/terrain";

const BiomeColors: { [key: string]: [number, number, number] } = {
    DeepOcean: [30, 60, 150],
    Ocean: [70, 120, 200],
    Beach: [210, 190, 130],
    Rainforest: [34, 139, 34],
    SeasonalForest: [107, 142, 35],
    Desert: [238, 214, 175],
    TemperateRainforest: [46, 115, 50],
    DeciduousForest: [100, 150, 70],
    Grassland: [152, 204, 112],
    Taiga: [95, 135, 112],
    Tundra: [170, 170, 150],
    Snow: [240, 240, 240],
    HighMountain: [130, 130, 130],
    SnowPeak: [245, 245, 250],
};

export function convertTerrainDataToRGBA(
    terrainData: Uint8Array,
    config: TerrainConfig,
) {
    const numPixels = terrainData.length / 3;
    const pixels = new Uint8ClampedArray(numPixels * 4);

    for (let i = 0; i < numPixels; i++) {
        const h = terrainData[i * 3];
        const t = terrainData[i * 3 + 1]; // +1 is Temperature
        const m = terrainData[i * 3 + 2]; // +2 is Moisture
        const pIdx = i * 4;

        if (config.viewMode === "Height") {
            pixels[pIdx] = h;
            pixels[pIdx + 1] = h;
            pixels[pIdx + 2] = h;
            pixels[pIdx + 3] = 255;
            continue;
        } else if (config.viewMode === "Temperature") {
            pixels[pIdx] = t;
            pixels[pIdx + 1] = t;
            pixels[pIdx + 2] = t;
            pixels[pIdx + 3] = 255;
            continue;
        } else if (config.viewMode === "Moisture") {
            pixels[pIdx] = m;
            pixels[pIdx + 1] = m;
            pixels[pIdx + 2] = m;
            pixels[pIdx + 3] = 255;
            continue;
        }

        let color: [number, number, number];

        if (h < config.seaLevel) {
            if (h < config.seaLevel - 30) color = BiomeColors.DeepOcean;
            else color = BiomeColors.Ocean;
        } else if (h < config.seaLevel + 8) {
            color = BiomeColors.Beach;
        } else if (h > 210) {
            // Засніжені вершини гір
            color = BiomeColors.SnowPeak;
        } else if (h > 170) {
            // Скелі / Гори
            color = BiomeColors.HighMountain;
        } else {
            // Whittaker Biome Logic
            if (t > 170) {
                // Tropical / Hot
                if (m > 170) color = BiomeColors.Rainforest;
                else if (m > 85) color = BiomeColors.SeasonalForest;
                else color = BiomeColors.Desert;
            } else if (t > 85) {
                // Temperate
                if (m > 170) color = BiomeColors.TemperateRainforest;
                else if (m > 85) color = BiomeColors.DeciduousForest;
                else color = BiomeColors.Grassland;
            } else {
                // Cold / Polar
                if (m > 170) color = BiomeColors.Taiga;
                else if (m > 85) color = BiomeColors.Tundra;
                else color = BiomeColors.Snow;
            }
        }

        // Height-based shading (pseudo-lighting)
        // Обчислюємо затінення тільки для суші
        let shading = 1.0;
        if (h >= config.seaLevel) {
            const heightFactor =
                (h - config.seaLevel) / (255 - config.seaLevel);
            shading = 1.0 - heightFactor * 0.2; // Затемнюємо до 20% на вершинах
        }

        pixels[pIdx] = Math.min(255, color[0] * shading);
        pixels[pIdx + 1] = Math.min(255, color[1] * shading);
        pixels[pIdx + 2] = Math.min(255, color[2] * shading);
        pixels[pIdx + 3] = 255;
    }

    return pixels;
}
