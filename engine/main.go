package main

import (
	"terracore/internal/perlin"
	"syscall/js"
	"time"
)

const (
	WorldWidth  = 512
	WorldHeight = 512
	Scale       = 100
	Octaves     = 6
	Persistence = 0.5
	Amplitude   = 3.5
	SeaLevel    = 110
)

func paintPixel(noise float64) (r, g, b uint8) {
	raw := noise * Amplitude
	if raw > 1.0 {
		raw = 1.0
	}
	if raw < -1.0 {
		raw = -1.0
	}
	v := uint8((raw + 1.0) * 0.5 * 255)
	if v < SeaLevel {
		if v < SeaLevel-30 {
			r, g, b = 30, 60, 150
		} else {
			r, g, b = 70, 120, 200
		}
	} else {
		if v < SeaLevel+15 {
			r, g, b = 210, 190, 130
		} else if v < SeaLevel+60 {
			r, g, b = 80, 160, 80
		} else if v < SeaLevel+100 {
			r, g, b = 130, 130, 130
		} else {
			r, g, b = 240, 240, 240
		}
	}

	return r, g, b
}

func main() {
	js.Global().Set("generate", js.FuncOf(func(this js.Value, args []js.Value) any {
		seed := time.Now().UnixNano()
		if len(args) > 0 {
			seed = int64(args[0].Int())
		}

		p := perlin.New(seed)
		size := WorldHeight * WorldWidth * 4
		imageData := make([]uint8, size)

		for y := 0; y < WorldHeight; y++ {
			for x := 0; x < WorldWidth; x++ {
				noiseX := float64(x) / float64(Scale)
				noiseY := float64(y) / float64(Scale)
				index := (y*WorldWidth + x) * 4
				noise := p.FractalNoise(noiseX, noiseY, Octaves, Persistence)
				r, g, b := paintPixel(noise)
				imageData[index] = r
				imageData[index+1] = g
				imageData[index+2] = b
				imageData[index+3] = 255
			}
		}

		imageDataJS := js.Global().Get("Uint8Array").New(size)
		js.CopyBytesToJS(imageDataJS, imageData)

		return imageDataJS
	}))

	<-make(chan bool)
}
