export function convertHeightsToRGBA(
    heightmap: Uint8Array,
    seaLevel: number = 110,
    debug: boolean = false,
) {
    const pixels = new Uint8ClampedArray(heightmap.length * 4);

    heightmap.forEach((h, i) => {
        if (debug) {
            pixels[i * 4] = h;
            pixels[i * 4 + 1] = h;
            pixels[i * 4 + 2] = h;
            pixels[i * 4 + 3] = 255;
            return;
        } else {
            if (h < seaLevel) {
                if (h < seaLevel - 30) {
                    pixels[i * 4] = 30;
                    pixels[i * 4 + 1] = 60;
                    pixels[i * 4 + 2] = 150;
                } else {
                    pixels[i * 4] = 70;
                    pixels[i * 4 + 1] = 120;
                    pixels[i * 4 + 2] = 200;
                }
            } else {
                if (h < seaLevel + 15) {
                    pixels[i * 4] = 210;
                    pixels[i * 4 + 1] = 190;
                    pixels[i * 4 + 2] = 130;
                } else if (h < seaLevel + 60) {
                    pixels[i * 4] = 80;
                    pixels[i * 4 + 1] = 160;
                    pixels[i * 4 + 2] = 80;
                } else if (h < seaLevel + 100) {
                    pixels[i * 4] = 130;
                    pixels[i * 4 + 1] = 130;
                    pixels[i * 4 + 2] = 130;
                } else {
                    pixels[i * 4] = 240;
                    pixels[i * 4 + 1] = 240;
                    pixels[i * 4 + 2] = 240;
                }
            }
         
            pixels[i * 4 + 3] = 255;
        }
    });

    return pixels;
}
