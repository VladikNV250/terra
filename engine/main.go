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
	DefaultContrast    = 1.0
)

func applyContrast(val float64, contrast float64) float64 {
	val = (val-0.5)*contrast + 0.5
	if val < 0.0 {
		return 0.0
	}
	if val > 1.0 {
		return 1.0
	}

	return val
}

func main() {
	js.Global().Set("generate", js.FuncOf(func(this js.Value, args []js.Value) any {
		if len(args) == 0 {
			return nil
		}
		config := args[0]

		seed := time.Now().UnixNano()
		if v := config.Get("seed"); !v.IsUndefined() {
			seed = int64(v.Int())
		}

		scale := DefaultScale
		if v := config.Get("scale"); !v.IsUndefined() {
			scale = v.Int()
		}

		octaves := DefaultOctaves
		if v := config.Get("octave"); !v.IsUndefined() {
			octaves = v.Int()
		}

		persistence := DefaultPersistence
		if v := config.Get("persistence"); !v.IsUndefined() {
			persistence = v.Float()
		}

		contrast := DefaultContrast
		if v := config.Get("contrast"); !v.IsUndefined() {
			contrast = v.Float()
		}

		width := DefaultWorldWidth
		if v := config.Get("width"); !v.IsUndefined() {
			width = v.Int()
		}

		height := DefaultWorldHeight
		if v := config.Get("height"); !v.IsUndefined() {
			height = v.Int()
		}

		startY := 0
		if v := config.Get("startY"); !v.IsUndefined() {
			startY = v.Int()
		}

		endY := height
		if v := config.Get("endY"); !v.IsUndefined() {
			endY = v.Int()
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
				noise := p.FractalNoise(noiseX, noiseY, octaves, persistence)
				noise = (noise + 1.0) / 2.0

				noise = applyContrast(noise, contrast)

				heightValue := uint8(noise * 255)

				heightmap[relativeY*width+x] = heightValue
			}
		}

		heightmapJS := js.Global().Get("Uint8Array").New(size)
		js.CopyBytesToJS(heightmapJS, heightmap)

		return heightmapJS
	}))

	<-make(chan bool)
}
