package perlin

import (
	"math"
	"math/rand"
)

type Perlin struct {
	permutationTable []byte
}

func New(seed int64) *Perlin {
	rng := rand.New(rand.NewSource(seed))
	table := make([]byte, 1024)
	rng.Read(table)
	
	return &Perlin{
		permutationTable: table,
	}
} 

func (p *Perlin) Noise2D(x, y float64) float64 {
	x00, y00 := int(math.Floor(x)), int(math.Floor(y))
	x10, y10 := x00+1, y00
	x01, y01 := x00, y00+1
	x11, y11 := x00+1, y00+1
	
	xl00, yl00 := x-float64(x00), y-float64(y00)
	xl10, yl10 := xl00-1, yl00
	xl01, yl01 := xl00, yl00-1
	xl11, yl11 := xl00-1, yl00-1
	
	grad00x, grad00y := p.getGradientVector2D(x00, y00)
	grad10x, grad10y := p.getGradientVector2D(x10, y10)
	grad01x, grad01y := p.getGradientVector2D(x01, y01)
	grad11x, grad11y := p.getGradientVector2D(x11, y11)
	
	dot00 := dot2D(grad00x, grad00y, xl00, yl00)
	dot10 := dot2D(grad10x, grad10y, xl10, yl10)
	dot01 := dot2D(grad01x, grad01y, xl01, yl01)
	dot11 := dot2D(grad11x, grad11y, xl11, yl11)
	
	u := f(xl00)
	v := f(yl00)

	lerp1 := lerp(dot00, dot10, u)
	lerp2 := lerp(dot01, dot11, u)
	lerp3 := lerp(lerp1, lerp2, v)

	return lerp3
}

func (p *Perlin) FractalNoise(x, y float64, octaves int, persistence float64) float64 {
    total := 0.0
    frequency := 1.0
    amplitude := 1.0
    maxValue := 0.0 

    for i := 0; i < octaves; i++ {
        total += p.Noise2D(x*frequency, y*frequency) * amplitude
        
        maxValue += amplitude
        
        amplitude *= persistence 
        frequency *= 2.0
	}

    return total / maxValue
}

func (p *Perlin) getGradientVector2D(x, y int) (float64, float64) {
	v := int(((x * 1836311903) ^ (y * 2971215073) + 4807526976) & 1023)
	v = int(p.permutationTable[v]) & 3

	switch v {
	case 0:
		return 1, 0
	case 1:
		return -1, 0
	case 2:
		return 0, 1
	default:
		return 0, -1
	}
}



