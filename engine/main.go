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

type TerrainConfig struct {
	seed        int64
	scale       int
	octaves     int
	persistence float64
	contrast    float64
	width       int
	height      int
	startY      int
	endY        int
	offsetX     int
	offsetY     int
}

func getParameters(config js.Value) TerrainConfig {
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

	offsetX := 0
	if v := config.Get("offsetX"); !v.IsUndefined() {
		offsetX = v.Int()
	}

	offsetY := 0
	if v := config.Get("offsetY"); !v.IsUndefined() {
		offsetY = v.Int()
	}

	return TerrainConfig{
		seed:        seed,
		scale:       scale,
		octaves:     octaves,
		persistence: persistence,
		contrast:    contrast,
		width:       width,
		height:      height,
		startY:      startY,
		endY:        endY,
		offsetX:     offsetX,
		offsetY:     offsetY,
	}
}

func main() {
	js.Global().Set("generate", js.FuncOf(func(this js.Value, args []js.Value) any {
		if len(args) == 0 {
			return nil
		}
		config := args[0]

		params := getParameters(config)

		p := perlin.New(params.seed)
		chunkHeight := params.endY - params.startY
		size := chunkHeight * params.width
		heightmap := make([]uint8, size)

		for absoluteY := params.startY; absoluteY < params.endY; absoluteY++ {
			relativeY := absoluteY - params.startY
			for x := 0; x < params.width; x++ {
				noiseX := float64(x + params.offsetX) / float64(params.scale)
				noiseY := float64(absoluteY + params.offsetY) / float64(params.scale)
				noise := p.FractalNoise(noiseX, noiseY, params.octaves, params.persistence)
				noise = (noise + 1.0) / 2.0

				noise = applyContrast(noise, params.contrast)

				heightValue := uint8(noise * 255)

				heightmap[relativeY*params.width+x] = heightValue
			}
		}

		heightmapJS := js.Global().Get("Uint8Array").New(size)
		js.CopyBytesToJS(heightmapJS, heightmap)

		return heightmapJS
	}))

	<-make(chan bool)
}
