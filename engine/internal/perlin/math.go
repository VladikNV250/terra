package perlin

func dot2D(x1, y1, x2, y2 float64) float64 {
	return float64(x1*x2 + y1*y2)
}

func lerp(a, b, t float64) float64 {
	return a + (b-a)*t
}

func f(t float64) float64 {
	return t * t * t * (t*(t*6-15) + 10)
}