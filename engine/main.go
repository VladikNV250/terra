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

func getJSValue(obj js.Value, key string, defaultValue any) any {
	v := obj.Get(key)
	if v.IsUndefined() {
		return defaultValue
	}

	switch defaultValue.(type) {
	case int:
		return v.Int()
	case float64:
		return v.Float()
	case int64:
		return int64(v.Int())
	default:
		return defaultValue
	}
}

func getParameters(config js.Value) TerrainConfig {
	return TerrainConfig{
		seed:        getJSValue(config, "seed", time.Now().UnixNano()).(int64),
		scale:       getJSValue(config, "scale", DefaultScale).(int),
		octaves:     getJSValue(config, "octave", DefaultOctaves).(int),
		persistence: getJSValue(config, "persistence", DefaultPersistence).(float64),
		contrast:    getJSValue(config, "contrast", DefaultContrast).(float64),
		width:       getJSValue(config, "width", DefaultWorldWidth).(int),
		height:      getJSValue(config, "height", DefaultWorldHeight).(int),
		startY:      getJSValue(config, "startY", 0).(int),
		endY:        getJSValue(config, "endY", DefaultWorldHeight).(int),
		offsetX:     getJSValue(config, "offsetX", 0).(int),
		offsetY:     getJSValue(config, "offsetY", 0).(int),
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
