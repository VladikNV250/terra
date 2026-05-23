package main

import (
	"syscall/js"
	"terracore/internal/perlin"
	"time"
)

const (
	DefaultWorldWidth  = 4096
	DefaultWorldHeight = 4096
	DefaultScale       = 400

	DefaultHeightFrequency      = 1.0
	DefaultTemperatureFrequency = 2.0
	DefaultMoistureFrequency    = 1.0

	DefaultHeightOctaves      = 6
	DefaultTemperatureOctaves = 4
	DefaultMoistureOctaves    = 4

	DefaultHeightContrast      = 1.0
	DefaultTemperatureContrast = 2.0
	DefaultMoistureContrast    = 2.5
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

type NoiseParams struct {
	perlin    *perlin.Perlin
	x         int
	y         int
	offsetX   int
	offsetY   int
	scale     int
	octaves   int
	contrast  float64
	frequency float64
}

func getNoiseValue(params *NoiseParams) uint8 {
	noiseX := float64(params.x+params.offsetX) / float64(params.scale)
	noiseY := float64(params.y+params.offsetY) / float64(params.scale)

	noise := params.perlin.FractalNoise(noiseX, noiseY, params.octaves, params.frequency)
	noise = (noise + 1.0) / 2.0
	noise = applyContrast(noise, params.contrast)

	return uint8(noise * 255)
}

type TerrainConfig struct {
	seed          int64
	scale         int
	contrast      float64
	width         int
	height        int
	startY        int
	endY          int
	offsetX       int
	offsetY       int
	tempScale     int
	moistureScale int
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
		seed:          getJSValue(config, "seed", time.Now().UnixNano()).(int64),
		scale:         getJSValue(config, "scale", DefaultScale).(int),
		contrast:      getJSValue(config, "contrast", DefaultHeightContrast).(float64),
		width:         getJSValue(config, "width", DefaultWorldWidth).(int),
		height:        getJSValue(config, "height", DefaultWorldHeight).(int),
		startY:        getJSValue(config, "startY", 0).(int),
		endY:          getJSValue(config, "endY", DefaultWorldHeight).(int),
		offsetX:       getJSValue(config, "offsetX", 0).(int),
		offsetY:       getJSValue(config, "offsetY", 0).(int),
		tempScale:     getJSValue(config, "tempScale", 2000).(int),
		moistureScale: getJSValue(config, "moistureScale", 400).(int),
	}
}

func main() {
	js.Global().Set("generate", js.FuncOf(func(this js.Value, args []js.Value) any {
		if len(args) == 0 {
			return nil
		}
		config := args[0]

		params := getParameters(config)

		heightPerlin := perlin.New(params.seed)
		temperaturePerlin := perlin.New(params.seed + 1)
		moisturePerlin := perlin.New(params.seed + 2)
		chunkHeight := params.endY - params.startY
		size := chunkHeight * params.width * 3
		terrainData := make([]uint8, size)

		for absoluteY := params.startY; absoluteY < params.endY; absoluteY++ {
			relativeY := absoluteY - params.startY
			for x := 0; x < params.width; x++ {
				height := getNoiseValue(
					&NoiseParams{
						perlin:    heightPerlin,
						x:         x + 100000,
						y:         absoluteY + 100000,
						offsetX:   params.offsetX,
						offsetY:   params.offsetY,
						scale:     params.scale,
						octaves:   DefaultHeightOctaves,
						contrast:  params.contrast,
						frequency: DefaultHeightFrequency,
					},
				)

				temperature := getNoiseValue(
					&NoiseParams{
						perlin:    temperaturePerlin,
						x:         x - 100000,
						y:         absoluteY - 100000,
						offsetX:   params.offsetX,
						offsetY:   params.offsetY,
						scale:     params.tempScale,
						octaves:   DefaultTemperatureOctaves,
						contrast:  DefaultTemperatureContrast,
						frequency: DefaultTemperatureFrequency,
					},
				)

				moisture := getNoiseValue(
					&NoiseParams{
						perlin:    moisturePerlin,
						x:         x,
						y:         absoluteY,
						offsetX:   params.offsetX,
						offsetY:   params.offsetY,
						scale:     params.moistureScale,
						octaves:   DefaultMoistureOctaves,
						contrast:  DefaultMoistureContrast,
						frequency: DefaultMoistureFrequency,
					},
				)

				idx := (relativeY*params.width + x) * 3

				terrainData[idx] = height
				terrainData[idx+1] = temperature
				terrainData[idx+2] = moisture
			}
		}

		terrainDataJS := js.Global().Get("Uint8Array").New(size)
		js.CopyBytesToJS(terrainDataJS, terrainData)

		return terrainDataJS
	}))

	<-make(chan bool)
}
