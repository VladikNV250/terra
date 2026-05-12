package main

import (
	"syscall/js"
	"terracore/internal/perlin"
	"time"
)

const (
	DefaultWorldWidth  = 4096
	DefaultWorldHeight = 4096
	DefaultScale       = 200
	DefaultOctaves     = 6
	DefaultPersistence = 0.5
	DefaultAmplitude   = 3.5
	DefaultSeaLevel    = 110
)

func paintPixel(noise float64, amplitude float64, seaLevel uint8) (r, g, b uint8) {
	raw := noise * amplitude
	if raw > 1.0 {
		raw = 1.0
	}
	if raw < -1.0 {
		raw = -1.0
	}
	v := uint8((raw + 1.0) * 0.5 * 255)
	if v < seaLevel {
		if v < seaLevel-30 {
			r, g, b = 30, 60, 150
		} else {
			r, g, b = 70, 120, 200
		}
	} else {
		if v < seaLevel+15 {
			r, g, b = 210, 190, 130
		} else if v < seaLevel+60 {
			r, g, b = 80, 160, 80
		} else if v < seaLevel+100 {
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

		scale := DefaultScale
		if len(args) > 1 {
			scale = int(args[1].Int())
		}

		octaves := DefaultOctaves
		if len(args) > 2 {
			octaves = int(args[2].Int())
		}

		persistence := DefaultPersistence
		if len(args) > 3 {
			persistence = float64(args[3].Float())
		}

		amplitude := DefaultAmplitude
		if len(args) > 4 {
			amplitude = float64(args[4].Float())
		}

		seaLevel := uint8(DefaultSeaLevel)
		if len(args) > 5 {
			if int(args[5].Int()) < 30 {
				seaLevel = 30
			} else if int(args[5].Int()) > 255 {
				seaLevel = 255
			} else {
				seaLevel = uint8(args[5].Int())
			}
		}

		width := DefaultWorldWidth
		if len(args) > 6 {
			width = int(args[6].Int())
		}

		height := DefaultWorldHeight
		if len(args) > 7 {
			height = int(args[7].Int())
		}

		startY := 0
		if len(args) > 8 {
			startY = int(args[8].Int())
		}

		endY := height
		if len(args) > 9 {
			endY = int(args[9].Int())
		}

		chunkHeight := endY - startY

		p := perlin.New(seed)
		size := chunkHeight * width * 4
		imageData := make([]uint8, size)

		for absoluteY := startY; absoluteY < endY; absoluteY++ {
			relativeY := absoluteY -  startY
			for x := 0; x < width; x++ {
				noiseX := float64(x) / float64(scale)
				noiseY := float64(absoluteY) / float64(scale)
				index := (relativeY*width + x) * 4
				noise := p.FractalNoise(noiseX, noiseY, octaves, persistence)
				r, g, b := paintPixel(noise, amplitude, seaLevel)
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
