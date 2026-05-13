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
)

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

		width := DefaultWorldWidth
		if len(args) > 4 {
			width = int(args[4].Int())
		}

		height := DefaultWorldHeight
		if len(args) > 5 {
			height = int(args[5].Int())
		}

		startY := 0
		if len(args) > 6 {
			startY = int(args[6].Int())
		}

		endY := height
		if len(args) > 7 {
			endY = int(args[7].Int())
		}

		chunkHeight := endY - startY

		p := perlin.New(seed)
		size := chunkHeight * width
		heightmap := make([]uint8, size)

		for absoluteY := startY; absoluteY < endY; absoluteY++ {
			relativeY := absoluteY - startY
			for x := 0; x < width; x++ {
				noiseX := float64(x) / float64(scale)
				noiseY := float64(absoluteY) / float64(scale)
				rawNoise := p.FractalNoise(noiseX, noiseY, octaves, persistence)
				normalizedNoise := (rawNoise + 1.0) / 2.0

				if normalizedNoise < 0.0 {
					normalizedNoise = 0.0
				}
				if normalizedNoise > 1.0 {
					normalizedNoise = 1.0
				}

				heightValue := uint8(normalizedNoise * 255)

				heightmap[relativeY*width+x] = heightValue
			}
		}

		heightmapJS := js.Global().Get("Uint8Array").New(size)
		js.CopyBytesToJS(heightmapJS, heightmap)

		return heightmapJS
	}))

	<-make(chan bool)
}
